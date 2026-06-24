import { useCallback } from "react";
import { Horizon, Operation, TransactionBuilder } from "@stellar/stellar-sdk";
import { useStellarContext } from "../context";
import { useTransaction } from "./useTransaction";
import { useFreighter } from "./useFreighter";
import type { TransactionStatus } from "../types";

export type AccountFlag =
  | "authRequired"
  | "authRevocable"
  | "authImmutable"
  | "authClawbackEnabled";

export interface UseAccountFlagsOptions {
  setFlags?: AccountFlag[];
  clearFlags?: AccountFlag[];
  fee?: number;
  timeoutSeconds?: number;
  onSuccess?: (hash: string) => void;
  onError?: (error: Error) => void;
}

export interface UseAccountFlagsReturn {
  submit: () => Promise<void>;
  status: TransactionStatus;
  hash: string | null;
  error: Error | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  reset: () => void;
}

const FLAG_BITS: Record<AccountFlag, number> = {
  authRequired: 1,
  authRevocable: 2,
  authImmutable: 4,
  authClawbackEnabled: 8,
};

function toMask(flags: AccountFlag[]): number {
  return flags.reduce((mask, flag) => mask | FLAG_BITS[flag], 0);
}

export function useAccountFlags(options: UseAccountFlagsOptions = {}): UseAccountFlagsReturn {
  const { setFlags, clearFlags, fee = 100, timeoutSeconds = 60, onSuccess, onError } = options;

  const { config } = useStellarContext();
  const { signTransaction, publicKey } = useFreighter();
  const { submit: submitXdr, reset, ...txState } = useTransaction({
    mode: "classic",
    timeoutSeconds,
    ...(onSuccess && { onSuccess }),
    ...(onError && { onError }),
  });

  const submit = useCallback(async () => {
    if (!publicKey) {
      throw new Error("Freighter is not connected. Call connect() first.");
    }

    const server = new Horizon.Server(config.horizonUrl);
    const sourceAccount = await server.loadAccount(publicKey);

    const setFlagsMask = setFlags && setFlags.length > 0 ? toMask(setFlags) : undefined;
    const clearFlagsMask = clearFlags && clearFlags.length > 0 ? toMask(clearFlags) : undefined;

    if (!setFlagsMask && !clearFlagsMask) {
      throw new Error("At least one of setFlags or clearFlags must be provided.");
    }

    const builder = new TransactionBuilder(sourceAccount, {
      fee: String(fee),
      networkPassphrase: config.networkPassphrase,
    })
      .addOperation(
        Operation.setOptions({
          setFlags: setFlagsMask,
          clearFlags: clearFlagsMask,
        })
      )
      .setTimeout(timeoutSeconds);

    const builtTx = builder.build();
    const builtXdr = builtTx.toXDR();

    const signedXdr = await signTransaction(builtXdr, {
      networkPassphrase: config.networkPassphrase,
    });

    await submitXdr(signedXdr);
  }, [
    setFlags,
    clearFlags,
    fee,
    timeoutSeconds,
    config,
    publicKey,
    signTransaction,
    submitXdr,
  ]);

  return {
    submit,
    reset,
    status: txState.status,
    hash: txState.hash,
    error: txState.error,
    isLoading: txState.isLoading,
    isSuccess: txState.isSuccess,
    isError: txState.isError,
  };
}
