import { useCallback } from "react";
import { Horizon, TransactionBuilder, xdr } from "@stellar/stellar-sdk";
import { Horizon, Transaction, TransactionBuilder, xdr } from "@stellar/stellar-sdk";
import { useStellarContext } from "../context";
import { useFreighter } from "./useFreighter";
import { useTransaction } from "./useTransaction";
import { unsafeAsXdrString, type TransactionStatus } from "../types";
import { validatePublicKey } from "../utils";

export interface UseStellarTransactionOptions {
  /** Target base fee in stroops. Default: 100 */
  fee?: number;
  /** Polling and build timeout in seconds. Default: 60 */
  timeoutSeconds?: number;
  /** Optional configuration to sponsor the transaction via fee bumping */
  feeBump?: {
    fee: string;
    sponsor?: string;
  };
  onSuccess?: (hash: string) => void;
  onError?: (error: Error) => void;
}

export interface UseStellarTransactionReturn {
  submit: (operations: xdr.Operation[]) => Promise<void>;
  status: TransactionStatus;
  txHash: string | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
  reset: () => void;
}

export function useStellarTransaction(options: UseStellarTransactionOptions = {}): UseStellarTransactionReturn {
  const { fee = 100, timeoutSeconds = 60, feeBump, onSuccess, onError } = options;
  const { config } = useStellarContext();
  const { signTransaction, publicKey } = useFreighter();
  const { submit: submitXdr, reset, status, hash, error, isLoading, isSuccess, isError } = useTransaction({
    mode: "classic",
    timeoutSeconds,
    ...(onSuccess && { onSuccess }),
    ...(onError && { onError }),
  });

  const submit = useCallback(async (operations: xdr.Operation[]) => {
    if (!publicKey) throw new Error("Freighter is not connected. Call connect() first.");

    const server = new Horizon.Server(config.horizonUrl);
    const sourceAccount = await server.loadAccount(publicKey);

    const builder = new TransactionBuilder(sourceAccount, {
      fee: String(fee),
      networkPassphrase: config.networkPassphrase,
    }).setTimeout(timeoutSeconds);

    operations.forEach(op => builder.addOperation(op));

    const builtTx = builder.build();
    const signedInnerXdr = await signTransaction(unsafeAsXdrString(builtTx.toXDR()), { networkPassphrase: config.networkPassphrase });

    // If fee bump is configured, construct and sign the FeeBump transaction wrapping the inner tx
    if (feeBump) {
      const sponsorAddress = feeBump.sponsor || publicKey;
      validatePublicKey(sponsorAddress, "feeBump.sponsor");
      const innerTxSigned = TransactionBuilder.fromXDR(signedInnerXdr, config.networkPassphrase);
      const feeBumpTx = TransactionBuilder.buildFeeBumpTransaction(
        sponsorAddress,
        feeBump.fee,
        innerTxSigned as Transaction,
        config.networkPassphrase
      );
      
      const signedFeeBumpXdr = await signTransaction(unsafeAsXdrString(feeBumpTx.toXDR()), { 
        networkPassphrase: config.networkPassphrase,
        address: sponsorAddress
      });
      await submitXdr(signedFeeBumpXdr);
    } else {
      await submitXdr(signedInnerXdr);
    }
  }, [publicKey, config, signTransaction, submitXdr, fee, timeoutSeconds, feeBump]);

  return { submit, status, txHash: hash, isLoading, isSuccess, isError, error, reset };
}
