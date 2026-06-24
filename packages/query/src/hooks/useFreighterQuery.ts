/**
 * @file useFreighterQuery.ts
 * @description React Query adapter for Freighter wallet — wraps connect in useMutation
 * and surfaces the full wallet state alongside mutation state.
 * @package @stellar-hooks/query
 * @license MIT
 */

import { useMutation } from "@tanstack/react-query";
import { useFreighter } from "stellar-hooks";
import type { UseFreighterQueryOptions, UseFreighterQueryReturn } from "../types";

/**
 * React Query adapter for `useFreighter`.
 *
 * Wraps the `connect` action in `useMutation` so callers get standard
 * `isPending / isError / isSuccess` flags, and exposes the full wallet state
 * (publicKey, network, sign helpers, …) via the `wallet` property.
 *
 * @example
 * ```tsx
 * const { connect, isPending, wallet } = useFreighterQuery();
 *
 * return (
 *   <button onClick={connect} disabled={isPending || wallet.isConnected}>
 *     {wallet.isConnected ? wallet.publicKey : "Connect Wallet"}
 *   </button>
 * );
 * ```
 */
export function useFreighterQuery(
  options?: UseFreighterQueryOptions
): UseFreighterQueryReturn {
  const {
    connect: freighterConnect,
    disconnect,
    signTransaction,
    signAuthEntry,
    signBlob,
    ...walletState
  } = useFreighter();

  const { mutate, isPending, isError, isSuccess, error } = useMutation<void, Error, void>({
    mutationFn: () => freighterConnect(),
    ...options,
  });

  return {
    connect: () => mutate(),
    isPending,
    isError,
    isSuccess,
    error,
    wallet: {
      ...walletState,
      disconnect,
      signTransaction: signTransaction as UseFreighterQueryReturn["wallet"]["signTransaction"],
      signAuthEntry,
      signBlob: signBlob as UseFreighterQueryReturn["wallet"]["signBlob"],
    },
  };
}
