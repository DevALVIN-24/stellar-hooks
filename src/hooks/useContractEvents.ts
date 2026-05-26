import { useCallback, useEffect, useReducer, useRef } from "react";
import { rpc as SorobanRpc } from "@stellar/stellar-sdk";
import { useStellarContext } from "../context";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ContractEvent = SorobanRpc.Api.EventResponse;

export interface UseContractEventsOptions {
  /** Soroban contract address (C...) */
  contractId: string;
  /** Optional topic filters. Each entry is an array of topic segments. */
  topics?: string[][];
  /** Polling interval in milliseconds. Default: 5000 */
  intervalMs?: number;
  /** Ledger cursor to start from. Default: "now" */
  startLedger?: number;
  /** Whether polling is active. Default: true */
  enabled?: boolean;
}

export interface UseContractEventsReturn {
  events: ContractEvent[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  /** Stop polling */
  stop: () => void;
  /** Resume polling */
  start: () => void;
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

interface EventsState {
  events: ContractEvent[];
  isLoading: boolean;
  error: Error | null;
}

type EventsAction =
  | { type: "LOADING" }
  | { type: "SUCCESS"; payload: ContractEvent[] }
  | { type: "ERROR"; payload: Error };

function reducer(state: EventsState, action: EventsAction): EventsState {
  switch (action.type) {
    case "LOADING":
      return { ...state, isLoading: true, error: null };
    case "SUCCESS":
      return { events: action.payload, isLoading: false, error: null };
    case "ERROR":
      return { ...state, isLoading: false, error: action.payload };
    default:
      return state;
  }
}

const initial: EventsState = {
  events: [],
  isLoading: false,
  error: null,
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Polls the Soroban RPC `getEvents` endpoint on an interval and returns
 * contract events for the given contractId.
 *
 * Topics are optional filters. Polling can be paused with `stop()` and
 * resumed with `start()`. Upgrade to streaming in a follow-up issue.
 *
 * @example
 * ```tsx
 * const { events, isLoading, error } = useContractEvents({
 *   contractId: "CXXX...",
 *   topics: [["AAAADwAAAAh0cmFuc2Zlcg=="]],
 *   intervalMs: 5000,
 * });
 * ```
 */
export function useContractEvents(
  options: UseContractEventsOptions
): UseContractEventsReturn {
  const {
    contractId,
    topics,
    intervalMs = 5000,
    startLedger,
    enabled = true,
  } = options;

  const { config } = useStellarContext();
  const [state, dispatch] = useReducer(reducer, initial);

  // Track whether polling is running
  const isPolling = useRef(enabled);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchEvents = useCallback(async () => {
    dispatch({ type: "LOADING" });

    try {
      const server = new SorobanRpc.Server(config.sorobanRpcUrl);

      const filters: SorobanRpc.Server.GetEventsRequest["filters"] = [
        {
          type: "contract",
          contractIds: [contractId],
          ...(topics ? { topics } : {}),
        },
      ];

      const request: SorobanRpc.Server.GetEventsRequest = {
        filters,
        ...(startLedger !== undefined ? { startLedger } : {}),
      };

      const response = await server.getEvents(request);
      dispatch({ type: "SUCCESS", payload: response.events });
    } catch (err) {
      dispatch({
        type: "ERROR",
        payload: err instanceof Error ? err : new Error(String(err)),
      });
    }
  }, [contractId, topics, startLedger, config.sorobanRpcUrl]);

  const stop = useCallback(() => {
    isPolling.current = false;
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    if (isPolling.current) return;
    isPolling.current = true;
    fetchEvents();
    intervalRef.current = setInterval(fetchEvents, intervalMs);
  }, [fetchEvents, intervalMs]);

  // Start/stop polling based on `enabled`
  useEffect(() => {
    if (!enabled) {
      stop();
      return;
    }

    fetchEvents();
    intervalRef.current = setInterval(fetchEvents, intervalMs);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, intervalMs, fetchEvents, stop]);

  return {
    events: state.events,
    isLoading: state.isLoading,
    error: state.error,
    refetch: fetchEvents,
    stop,
    start,
  };
}