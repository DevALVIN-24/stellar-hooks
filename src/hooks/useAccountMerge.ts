/**
 * @file useAccountMerge.ts
 * @description Hook for building and submitting a Stellar account merge.
 * @package stellar-hooks
 * @license MIT
 */

import { useCallback } from "react";
import {
  Horizon,
  Memo,
  Operation,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import { useStellarContext } from "../context";
import { useTransaction } from "./useTransaction";
import { useFreighter } from "./useFreighter";
import type { TransactionStatus } from "../types";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface UseAccountMergeOptions {
  /**
   * Destination Stellar address (G...) that receives the merged account's
   * entire XLM balance. The source account is deleted on success.
   */
  destination: string;
  /** Optional memo text (max 28 bytes) */
  memo?: string;
  /** Fee in stroops. Default: 100 */
  fee?: number;
  /** Polling timeout in seconds. Default: 60 */
  timeoutSeconds?: number;
  /** Callback fired when the transaction is successfully confirmed. */
  onSuccess?: (hash: string) => void;
  /** Callback fired when the transaction fails or an error occurs. */
  onError?: (error: Error) => void;
}

/**
 * @example
 * ```tsx
 * const {
 *   submit,    // () => Promise<void> — build, sign, and submit the merge
 *   status,    // "idle" | "submitting" | "polling" | "success" | "error"
 *   hash,      // string | null — transaction hash on success
 *   isLoading, // boolean
 *   isSuccess, // boolean
 *   isError,   // boolean
 *   error,     // Error | null
 *   reset,     // () => void
 * } = useAccountMerge({
 *   destination: "GBXXX...",
 * });
 *
 * return <button onClick={submit} disabled={isLoading}>Merge account</button>;
 * ```
 */
export interface UseAccountMergeReturn {
  /** Call this to build, sign, and submit the account merge */
  submit: () => Promise<void>;
  status: TransactionStatus;
  hash: string | null;
  error: Error | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  reset: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Builds a classic Stellar `accountMerge` operation, signs it via Freighter,
 * and submits it through Horizon with polling for confirmation.
 *
 * The connected Freighter account is the source: its entire XLM balance is
 * transferred to `destination` and the source account is removed from the
 * ledger. The source must hold no other assets, offers, or trustlines for the
 * merge to succeed.
 *
 * Wraps `useTransaction({ mode: "classic" })` for submission and polling.
 *
 * @example
 * ```tsx
 * const { submit, status, hash, error } = useAccountMerge({
 *   destination: "GBXXX...",
 * });
 *
 * return <button onClick={submit}>Merge account</button>;
 * ```
 */
export function useAccountMerge(
  options: UseAccountMergeOptions
): UseAccountMergeReturn {
  const {
    destination,
    memo,
    fee = 100,
    timeoutSeconds = 60,
    onSuccess,
    onError,
  } = options;

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

    // 1. Load the source account from Horizon to get the sequence number
    const server = new Horizon.Server(config.horizonUrl);
    const sourceAccount = await server.loadAccount(publicKey);

    // 2. Build the transaction
    const builder = new TransactionBuilder(sourceAccount, {
      fee: String(fee),
      networkPassphrase: config.networkPassphrase,
    })
      .addOperation(
        Operation.accountMerge({
          destination,
        })
      )
      .setTimeout(timeoutSeconds);

    // 3. Attach memo if provided
    if (memo) {
      builder.addMemo(Memo.text(memo));
    }

    const builtTx = builder.build();
    const builtXdr = builtTx.toXDR();

    // 4. Sign via Freighter
    const signedXdr = await signTransaction(builtXdr, {
      networkPassphrase: config.networkPassphrase,
    });

    // 5. Submit and poll via useTransaction internals
    await submitXdr(signedXdr);
  }, [
    destination,
    memo,
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
