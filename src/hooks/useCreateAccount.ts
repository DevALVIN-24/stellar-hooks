/**
 * @file useCreateAccount.ts
 * @description Hook for funding (via Friendbot) and creating new Stellar accounts.
 * @package stellar-hooks
 */

import { useState, useCallback } from "react";
import { Horizon, TransactionBuilder, Operation, Networks } from "@stellar/stellar-sdk";
import { useStellarContext } from "../context";

export interface UseCreateAccountOptions {
  /** Optional Friendbot URL. If not provided, it attempts to infer from the network. */
  friendbotUrl?: string;
}

export interface UseCreateAccountReturn {
  /** Request funding for the given public key from Friendbot (Testnet/Futurenet only) */
  fundWithFriendbot: (publicKey: string) => Promise<void>;
  /** Build a CreateAccount transaction */
  buildCreateAccountTransaction: (
    sourceAccountId: string,
    destinationPublicKey: string,
    startingBalance: string,
    sequenceNumber: string,
    baseFee?: string
  ) => import("@stellar/stellar-sdk").Transaction;
  isLoading: boolean;
  error: Error | null;
}

export function useCreateAccount(options: UseCreateAccountOptions = {}): UseCreateAccountReturn {
  const { config, network } = useStellarContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fundWithFriendbot = useCallback(
    async (publicKey: string) => {
      setIsLoading(true);
      setError(null);

      try {
        let url = options.friendbotUrl;
        if (!url) {
          if (network === "testnet") {
            url = "https://friendbot.stellar.org";
          } else if (network === "futurenet") {
            url = "https://friendbot-futurenet.stellar.org";
          } else {
            throw new Error("Friendbot is only available on testnet or futurenet.");
          }
        }

        const response = await fetch(`${url}?addr=${encodeURIComponent(publicKey)}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(
            errorData?.detail || `Friendbot request failed with status ${response.status}`
          );
        }
      } catch (err) {
        const parsedError = err instanceof Error ? err : new Error(String(err));
        setError(parsedError);
        throw parsedError;
      } finally {
        setIsLoading(false);
      }
    },
    [network, options.friendbotUrl]
  );

  const buildCreateAccountTransaction = useCallback(
    (
      sourceAccountId: string,
      destinationPublicKey: string,
      startingBalance: string,
      sequenceNumber: string,
      baseFee: string = "100"
    ) => {
      // Create a dummy account object just for the builder
      const sourceAccount = new Horizon.AccountResponse({
        account_id: sourceAccountId,
        sequence: sequenceNumber,
        subentry_count: 0,
        balances: [],
        signers: [],
        thresholds: { low_threshold: 0, med_threshold: 0, high_threshold: 0 },
        flags: { auth_required: false, auth_revocable: false, auth_immutable: false },
        id: sourceAccountId,
        paging_token: "",
        _links: {} as any,
      } as any);

      return new TransactionBuilder(sourceAccount, {
        fee: baseFee,
        networkPassphrase: config.networkPassphrase,
      })
        .addOperation(
          Operation.createAccount({
            destination: destinationPublicKey,
            startingBalance,
          })
        )
        .setTimeout(30)
        .build();
    },
    [config.networkPassphrase]
  );

  return {
    fundWithFriendbot,
    buildCreateAccountTransaction,
    isLoading,
    error,
  };
}
