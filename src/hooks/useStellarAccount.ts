import { useCallback, useEffect, useReducer, useRef } from "react";
import { Horizon } from "@stellar/stellar-sdk";
import { useStellarContext } from "../context";
import { parseAccountResponse } from "../utils";
import type { StellarAccountData } from "../types";

// ─── State ─────────────────────────────────────────────────────────────────────

interface AccountState {
  data: StellarAccountData | null;
  isLoading: boolean;
  error: Error | null;
  lastFetchedAt: Date | null;
}

type Action =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: StellarAccountData }
  | { type: "FETCH_ERROR"; payload: Error }
  | { type: "RESET" };

function reducer(state: AccountState, action: Action): AccountState {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, isLoading: true, error: null };
    case "FETCH_SUCCESS":
      return { data: action.payload, isLoading: false, error: null, lastFetchedAt: new Date() };
    case "FETCH_ERROR":
      return { ...state, isLoading: false, error: action.payload };
    case "RESET":
      return { data: null, isLoading: false, error: null, lastFetchedAt: null };
    default:
      return state;
  }
}

// ─── Options ──────────────────────────────────────────────────────────────────

export interface UseStellarAccountOptions {
  /** Set to false to skip automatic fetching. Default: true */
  enabled?: boolean;
  /** Poll interval in ms. Set to 0 to disable. Default: 0 */
  refetchInterval?: number;
}

/**
 * @example
 * ```tsx
 * const {
 *   data,          // StellarAccountData | null — full account info
 *   isLoading,     // boolean
 *   error,         // Error | null
 *   lastFetchedAt, // Date | null
 *   refetch,       // () => Promise<void>
 * } = useStellarAccount("G...");
 *
 * // data.balances  → StellarBalance[]
 * // data.sequence  → string
 * // data.raw       → raw Horizon.AccountResponse
 * const xlm = data?.balances.find(b => b.isNative);
 * ```
 */
export interface UseStellarAccountReturn extends AccountState {
  refetch: () => Promise<void>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Fetch and optionally poll a Stellar account by its public key.
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useStellarAccount("G...");
 *
 * const xlmBalance = data?.balances.find(b => b.isNative);
 * ```
 */
export function useStellarAccount(
  publicKey: string | null | undefined,
  options: UseStellarAccountOptions = {}
): UseStellarAccountReturn {
  const { enabled = true, refetchInterval = 0 } = options;
  const { config } = useStellarContext();

  const [state, dispatch] = useReducer(reducer, {
    data: null,
    isLoading: false,
    error: null,
    lastFetchedAt: null,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetch = useCallback(async () => {
    if (!publicKey) return;

    dispatch({ type: "FETCH_START" });

    try {
      const server = new Horizon.Server(config.horizonUrl);
      const raw = await server.loadAccount(publicKey);
      dispatch({ type: "FETCH_SUCCESS", payload: parseAccountResponse(raw) });
    } catch (err) {
      dispatch({
        type: "FETCH_ERROR",
        payload: err instanceof Error ? err : new Error(String(err)),
      });
    }
  }, [publicKey, config.horizonUrl]);

  // Initial fetch + re-fetch when publicKey or config changes
  useEffect(() => {
    if (!enabled || !publicKey) {
      dispatch({ type: "RESET" });
      return;
    }
    void fetch();
  }, [enabled, publicKey, fetch]);

  // Polling
  useEffect(() => {
    if (!enabled || !publicKey || refetchInterval <= 0) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const intervalId = setInterval(() => void fetch(), refetchInterval);
    intervalRef.current = intervalId;
    return () => {
      clearInterval(intervalId);
      if (intervalRef.current === intervalId) {
        intervalRef.current = null;
      }
    };
  }, [enabled, publicKey, refetchInterval, fetch]);

  return { ...state, refetch: fetch };
}
