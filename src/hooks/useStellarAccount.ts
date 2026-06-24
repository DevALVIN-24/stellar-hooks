/**
 * @file useStellarAccount.ts
 * @description Hook for fetching Stellar account data from Horizon.
 * @package stellar-hooks
 * @license MIT
 */

import { useCallback, useEffect, useReducer, useRef } from "react";
import { Horizon } from "@stellar/stellar-sdk";
import { useStellarContext } from "../context";
import { parseAccountResponse } from "../utils";
import type { StellarAccountData, StellarPublicKey } from "../types";
import { parseAccountResponse, validatePublicKey } from "../utils";
import type { StellarAccountData } from "../types";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface UseStellarAccountOptions {
  /** Whether the query is enabled. Defaults to true. */
  enabled?: boolean;
  /** Polling interval in milliseconds. If 0, polling is disabled. Defaults to 0. */
  refetchInterval?: number;
}

export interface UseStellarAccountReturn {
  /** The parsed account data. Matches 'account' in issue #63. */
  account: StellarAccountData | null;
  /** Alias for account, maintained for backward compatibility. */
  data: StellarAccountData | null;
  isLoading: boolean;
  error: Error | null;
  /** Timestamp of the last successful fetch. */
  lastFetchedAt: Date | null;
  /** Manually trigger a refetch of the account data. */
  refetch: () => Promise<void>;
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

interface State {
  data: StellarAccountData | null;
  isLoading: boolean;
  error: Error | null;
  lastFetchedAt: Date | null;
}

type Action =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: StellarAccountData }
  | { type: "FETCH_ERROR"; payload: Error };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, isLoading: true, error: null };
    case "FETCH_SUCCESS":
      return {
        data: action.payload,
        isLoading: false,
        error: null,
        lastFetchedAt: new Date(),
      };
    case "FETCH_ERROR":
      return { ...state, isLoading: false, error: action.payload };
    default:
      return state;
  }
}

const initialState: State = {
  data: null,
  isLoading: false,
  error: null,
  lastFetchedAt: null,
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Fetch and optionally poll a Stellar account from Horizon.
 *
 * @param {StellarPublicKey | null | undefined} publicKey - The public key of the account to fetch.
 * @param {UseStellarAccountOptions} [options={}] - Configuration options.
 * @returns {UseStellarAccountReturn}
 */
export function useStellarAccount(
  publicKey: StellarPublicKey | null | undefined,
  options: UseStellarAccountOptions = {}
): UseStellarAccountReturn {
  const { enabled = true, refetchInterval = 0 } = options;
  const { config } = useStellarContext();
  const [state, dispatch] = useReducer(reducer, initialState);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchAccount = useCallback(async () => {
    if (!publicKey) return;

    dispatch({ type: "FETCH_START" });

    try {
      validatePublicKey(publicKey);
      const server = new Horizon.Server(config.horizonUrl);
      const rawAccount = await server.loadAccount(publicKey);
      const parsed = parseAccountResponse(rawAccount);
      dispatch({ type: "FETCH_SUCCESS", payload: parsed });
    } catch (err) {
      dispatch({
        type: "FETCH_ERROR",
        payload: err instanceof Error ? err : new Error(String(err)),
      });
    }
  }, [publicKey, config.horizonUrl]);

  useEffect(() => {
    if (enabled && publicKey) {
      void fetchAccount();
      if (refetchInterval > 0) {
        timerRef.current = setInterval(() => void fetchAccount(), refetchInterval);
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [enabled, publicKey, refetchInterval, fetchAccount]);

  return { account: state.data, ...state, refetch: fetchAccount };
}