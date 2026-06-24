/**
 * @file useContractEvents.ts
 * @description Hook for polling Soroban contract events from RPC.
 * @package stellar-hooks
 * @license MIT
 */

import { useCallback, useEffect, useReducer, useRef } from "react";
import { rpc } from "@stellar/stellar-sdk";
import { useStellarContext } from "../context";
import { validateContractId } from "../utils";

export interface UseContractEventsOptions {
  /** Soroban contract address (C...) */
  contractId: string;
  /** Optional array of topic filters for event matching */
  topics?: string[][];
  /** Event type filter. Default is "contract" */
  type?: "system" | "contract" | "diagnostic";
  /** Max number of events per poll. Default: 100 */
  limit?: number;
  /** Starting ledger to query events from */
  startLedger?: number;
  /** Interval in milliseconds to continuously stream/poll events. Default: 0 (disabled) */
  refetchInterval?: number;
}

interface EventsState {
  events: rpc.Api.EventResponse[];
  isLoading: boolean;
  error: Error | null;
}

type Action =
  | { type: "LOADING" }
  | { type: "SUCCESS"; payload: rpc.Api.EventResponse[] }
  | { type: "ERROR"; payload: Error };

function reducer(state: EventsState, action: Action): EventsState {
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

export function useContractEvents(options: UseContractEventsOptions) {
  const { config } = useStellarContext();
  const [state, dispatch] = useReducer(reducer, {
    events: [],
    isLoading: false,
    error: null,
  });

  const cursorRef = useRef<string | undefined>();
  const isMounted = useRef(true);

  const fetchEvents = useCallback(async () => {
    try {
      validateContractId(options.contractId);
      dispatch({ type: "LOADING" });
      const server = new rpc.Server(config.sorobanRpcUrl);
      
      const filter: rpc.Api.EventFilter = {
        type: options.type || "contract",
        contractIds: [options.contractId],
        topics: options.topics,
      };

      const response = await server.getEvents({
        startLedger: options.startLedger,
        filters: [filter],
        pagination: {
          cursor: cursorRef.current,
          limit: options.limit || 100,
        }
      });

      if (isMounted.current && response.events) {
        if (response.events.length > 0) {
          cursorRef.current = response.events[response.events.length - 1].pagingToken;
        }
        dispatch({ type: "SUCCESS", payload: response.events });
      }
    } catch (err) {
      if (isMounted.current) {
        dispatch({ type: "ERROR", payload: err instanceof Error ? err : new Error(String(err)) });
      }
    }
  }, [config.sorobanRpcUrl, options.contractId, options.type, options.topics, options.startLedger, options.limit]);

  useEffect(() => {
    isMounted.current = true;
    fetchEvents();

    let intervalId: ReturnType<typeof setInterval>;
    if (options.refetchInterval && options.refetchInterval > 0) {
      intervalId = setInterval(fetchEvents, options.refetchInterval);
    }

    return () => {
      isMounted.current = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [fetchEvents, options.refetchInterval]);

  return { 
    ...state, 
    refetch: fetchEvents,
    stop: () => { isMounted.current = false; },
    start: () => { isMounted.current = true; fetchEvents(); }
  };
}