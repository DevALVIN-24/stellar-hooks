/**
 * @file useLedgerEntry.ts
 * @description Hook for fetching ledger entries from Soroban RPC.
 * @package stellar-hooks
 * @license MIT
 */

import { useCallback, useEffect, useReducer, useRef } from "react";
import { xdr } from "@stellar/stellar-sdk";
import * as rpc from "@stellar/stellar-sdk/rpc";
import { useStellarContext } from "../context";
import type { LedgerEntryState } from "../types";
import { getCache, setCache } from "../utils";

// ─── Reducer ──────────────────────────────────────────────────────────────────

type Action =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: rpc.Api.LedgerEntryResult }
  | { type: "FETCH_NOT_FOUND" }
  | { type: "FETCH_ERROR"; payload: Error };

function reducer(state: LedgerEntryState, action: Action): LedgerEntryState {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, isLoading: true, error: null };
    case "FETCH_SUCCESS":
      return { data: action.payload, isLoading: false, error: null, lastFetchedAt: new Date(), refetch: state.refetch };
    case "FETCH_NOT_FOUND":
      return { data: null, isLoading: false, error: null, lastFetchedAt: new Date(), refetch: state.refetch };
    case "FETCH_ERROR":
      return { ...state, isLoading: false, error: action.payload };
    default:
      return state;
  }
}

// ─── Options ──────────────────────────────────────────────────────────────────

export interface UseLedgerEntryOptions {
  /** Set false to skip automatic fetching. Default: true */
  enabled?: boolean;
  /** Poll every N ms. Set to 0 to disable. Default: 0 */
  refetchInterval?: number;
  /** Time-to-live for cache in milliseconds (default: 60000 = 1 minute) */
  cacheTTL?: number;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Read a raw Soroban ledger entry by its XDR key.
 * Useful for reading persistent contract data without constructing a full
 * contract call.
 *
 * @returns {LedgerEntryState}
 * @example
 * ```tsx
 * // Build the ledger key for a persistent "Counter" entry
 * const key = xdr.LedgerKey.contractData(
 *   new xdr.LedgerKeyContractData({
 *     contract: new Address(CONTRACT_ID).toScAddress(),
 *     key: xdr.ScVal.scvSymbol("Counter"),
 *     durability: xdr.ContractDataDurability.persistent(),
 *   })
 * );
 *
 * const {
 *   data,          // SorobanRpc.Api.LedgerEntryResult | null
 *   isLoading,     // boolean
 *   error,         // Error | null
 *   lastFetchedAt, // Date | null
 *   refetch,       // () => Promise<void>
 * } = useLedgerEntry(key, { refetchInterval: 3000 });
 *
 * const value = data
 *   ? scValToNative(data.val.contractData().val())
 *   : null;
 * ```
 */
export function useLedgerEntry(
  ledgerKey: xdr.LedgerKey | null | undefined,
  options: UseLedgerEntryOptions = {},
): LedgerEntryState {
  const { enabled = true, refetchInterval = 0, cacheTTL = 60000 } = options;
  const { config } = useStellarContext();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refetchRef = useRef<(force?: boolean) => Promise<void>>(() => Promise.resolve());

  const [state, dispatch] = useReducer(reducer, {
    data: null,
    isLoading: false,
    error: null,
    lastFetchedAt: null,
    refetch: () => refetchRef.current(true),
  });

  const fetch = useCallback(async (force = false) => {
    if (!ledgerKey) return;

    const cacheKey = `ledger-entry-${ledgerKey.toXDR("base64")}-${config.network}`;

    if (!force) {
      const cached = getCache<rpc.Api.LedgerEntryResult>(cacheKey);
      if (cached) {
        dispatch({ type: "FETCH_SUCCESS", payload: cached });
        return;
      }
    }

    dispatch({ type: "FETCH_START" });

    try {
      const server = new rpc.Server(config.sorobanRpcUrl);
      const result = await server.getLedgerEntries(ledgerKey);

      if (result.entries.length === 0) {
        dispatch({ type: "FETCH_NOT_FOUND" });
        return;
      }

      const entry = result.entries[0];
      if (entry) {
        setCache(cacheKey, entry, cacheTTL);
        dispatch({ type: "FETCH_SUCCESS", payload: entry });
      } else {
        dispatch({ type: "FETCH_NOT_FOUND" });
      }
    } catch (err) {
      dispatch({
        type: "FETCH_ERROR",
        payload: err instanceof Error ? err : new Error(String(err)),
      });
    }
  }, [ledgerKey, config.sorobanRpcUrl, config.network, cacheTTL]);

  // Keep ref fresh so state.refetch always points to the latest
  useEffect(() => { refetchRef.current = fetch; }, [fetch]);

  useEffect(() => {
    if (!enabled || !ledgerKey) return;
    void fetch();
  }, [enabled, ledgerKey, fetch]);

  useEffect(() => {
    if (!enabled || !ledgerKey || refetchInterval <= 0) return;
    intervalRef.current = setInterval(() => void fetch(true), refetchInterval);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [enabled, ledgerKey, refetchInterval, fetch]);

  return state;
}
