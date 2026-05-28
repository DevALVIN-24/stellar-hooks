import { useCallback, useEffect, useReducer } from "react";
import {
  isConnected,
  getAddress,
  getNetwork,
  requestAccess,
  signTransaction,
  signAuthEntry,
  signBlob,
} from "@stellar/freighter-api";
import type { FreighterState, SignTransactionOptions, UseFreighterReturn } from "../types";

// ─── State Machine ─────────────────────────────────────────────────────────────

type Action =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_CONNECTED"; publicKey: string; network: string; networkPassphrase: string }
  | { type: "SET_DISCONNECTED" }
  | { type: "SET_NOT_INSTALLED" }
  | { type: "SET_ERROR"; payload: Error };

function reducer(state: FreighterState, action: Action): FreighterState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload, error: null };
    case "SET_CONNECTED":
      return {
        ...state,
        isInstalled: true,
        isConnected: true,
        publicKey: action.publicKey,
        network: action.network,
        networkPassphrase: action.networkPassphrase,
        isLoading: false,
        error: null,
      };
    case "SET_DISCONNECTED":
      return {
        ...state,
        isInstalled: true,
        isConnected: false,
        publicKey: null,
        network: null,
        networkPassphrase: null,
        isLoading: false,
        error: null,
      };
    case "SET_NOT_INSTALLED":
      return { ...state, isInstalled: false, isLoading: false };
    case "SET_ERROR":
      return { ...state, isLoading: false, error: action.payload };
    default:
      return state;
  }
}

const initial: FreighterState = {
  isInstalled: false,
  isConnected: false,
  publicKey: null,
  network: null,
  networkPassphrase: null,
  isLoading: true,
  error: null,
};

const STORAGE_KEY = "stellar-hooks:freighter-connected";

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Connect to and interact with the Freighter browser wallet.
 *
 * @example
 * ```tsx
 * const { isConnected, publicKey, connect } = useFreighter();
 *
 * if (!isConnected) return <button onClick={connect}>Connect Wallet</button>;
 * return <p>Connected: {publicKey}</p>;
 * ```
 */
export function useFreighter(): UseFreighterReturn {
  const [state, dispatch] = useReducer(reducer, initial);

  // Probe on mount
  useEffect(() => {
    let cancelled = false;

    async function probe() {
      dispatch({ type: "SET_LOADING", payload: true });

      try {
        const connection = await isConnected();
        // Handle both boolean (v2) and object (v6+) return types
        const isActuallyConnected =
          typeof connection === "boolean" ? connection : connection?.isConnected;

        if (cancelled) return;

        if (!isActuallyConnected) {
          dispatch({ type: "SET_NOT_INSTALLED" });
          return;
        }

        // Check if an address is already authorised
        const addressResult = await getAddress();
        if (cancelled) return;

        if (addressResult && !addressResult.error && addressResult.address) {
          const networkResult = await getNetwork();
          if (cancelled) return;

          dispatch({
            type: "SET_CONNECTED",
            publicKey: addressResult.address,
            network: networkResult.network ?? "",
            networkPassphrase: networkResult.networkPassphrase ?? "",
          });
        } else {
          // Check if we should try to restore from localStorage
          const wasConnected = localStorage.getItem(STORAGE_KEY) === "true";
          if (wasConnected) {
            // User was previously connected, but getAddress() returned empty.
            // This usually means the wallet is locked.
            // We'll keep them as disconnected but we know it's installed.
            dispatch({ type: "SET_DISCONNECTED" });
          } else {
            dispatch({ type: "SET_DISCONNECTED" });
          }
        }
      } catch (err) {
        if (!cancelled) {
          dispatch({
            type: "SET_ERROR",
            payload: err instanceof Error ? err : new Error(String(err)),
          });
        }
      }
    }

    void probe();
    return () => {
      cancelled = true;
    };
  }, []);

  const connect = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const address = await requestAccess();
      if (!address) {
        throw new Error("User rejected the connection request or no address returned");
      }

      const addressResult = await getAddress();
      if (addressResult.error || !addressResult.address) {
        throw new Error(addressResult.error ?? "Failed to get address");
      }

      const networkResult = await getNetwork();
      
      localStorage.setItem(STORAGE_KEY, "true");
      
      dispatch({
        type: "SET_CONNECTED",
        publicKey: addressResult.address,
        network: networkResult.network ?? "",
        networkPassphrase: networkResult.networkPassphrase ?? "",
      });
    } catch (err) {
      dispatch({ type: "SET_ERROR", payload: err instanceof Error ? err : new Error(String(err)) });
    }
  }, []);

  const disconnect = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    dispatch({ type: "SET_DISCONNECTED" });
  }, []);

  const signTx = useCallback(
    async (xdr: string, opts?: SignTransactionOptions): Promise<string> => {
      const result = await signTransaction(xdr, {
        networkPassphrase: opts?.networkPassphrase,
        address: opts?.address,
      });
      if (result.error) throw new Error(result.error);
      return result.signedTxXdr;
    },
    []
  );

  const signEntry = useCallback(async (entryPreimageXdr: string): Promise<string> => {
    const result = await signAuthEntry(entryPreimageXdr);
    if (result.error) throw new Error(result.error);
    return result.signedAuthEntry;
  }, []);

  const signBlobCallback = useCallback(
    async (blob: string, opts?: { accountToSign?: string }): Promise<string> => {
      const result = await signBlob(blob, opts);
      if (result.error) throw new Error(result.error);
      return result.signedBlob;
    },
    []
  );

  return {
    ...state,
    connect,
    disconnect,
    signTransaction: signTx,
    signAuthEntry: signEntry,
    signBlob: signBlobCallback,
  };
}
