import { useCallback, useEffect, useReducer } from "react";
import {
  isConnected,
  getAddress,
  getNetwork,
  requestAccess,
  signTransaction,
  signAuthEntry,
  signMessage,
  WatchWalletChanges,
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
      if (state.isLoading === action.payload) return state;
      return { ...state, isLoading: action.payload, error: null };
    case "SET_CONNECTED":
      if (
        state.isConnected &&
        state.publicKey === action.publicKey &&
        state.network === action.network &&
        state.networkPassphrase === action.networkPassphrase
      ) {
        return state;
      }
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
      if (!state.isConnected && state.publicKey === null) return state;
      return {
        ...state,
        // Reaching SET_DISCONNECTED from the probe means isConnected() returned
        // true (extension detected) but no address is authorised yet. From the
        // disconnect() callback the extension was already known to be installed.
        // In both cases the wallet IS installed, so mark it as such.
        isInstalled: true,
        isConnected: false,
        publicKey: null,
        network: null,
        networkPassphrase: null,
        isLoading: false,
        error: null,
      };
    case "SET_NOT_INSTALLED":
      if (!state.isInstalled && !state.isLoading) return state;
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
 * @returns {UseFreighterReturn}
 * @example
 * ```tsx
 * const {
 *   isInstalled,       // boolean — Freighter extension detected
 *   isConnected,       // boolean — user has granted access
 *   publicKey,         // string | null
 *   network,           // string | null  e.g. "TESTNET"
 *   networkPassphrase, // string | null
 *   isLoading,
 *   error,
 *   connect,           // () => Promise<void>
 *   disconnect,        // () => void
 *   signTransaction,   // (xdr: string, opts?) => Promise<string>
 *   signAuthEntry,     // (entryPreimageXdr: string) => Promise<string>
 *   signBlob,          // (blob: string, opts?) => Promise<string>
 * } = useFreighter();
 *
 * if (!isInstalled) return <p>Install Freighter first.</p>;
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
        const isConnectedResult = await isConnected();
        if (cancelled) return;

        if (!isConnectedResult.isConnected) {
          // Freighter is not installed or not connected yet
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

  // Subscribe to changes (address, network, passphrase)
  useEffect(() => {
    if (!state.isInstalled) return;

    const watcher = new WatchWalletChanges();

    watcher.watch((changes: { address: string; network: string; networkPassphrase: string }) => {
      if (changes.address) {
        dispatch({
          type: "SET_CONNECTED",
          publicKey: changes.address,
          network: changes.network || "",
          networkPassphrase: changes.networkPassphrase || "",
        });
      } else {
        dispatch({ type: "SET_DISCONNECTED" });
      }
    });

    return () => {
      watcher.stop();
    };
  }, [state.isInstalled]);

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
      const signOptions: { networkPassphrase?: string; address?: string } = {};
      if (opts?.networkPassphrase) signOptions.networkPassphrase = opts.networkPassphrase;
      if (opts?.address) signOptions.address = opts.address;

      const result = await signTransaction(xdr, signOptions);
      if (result.error) throw new Error(result.error);
      return result.signedTxXdr;
    },
    []
  );

  const signEntry = useCallback(async (entryPreimageXdr: string): Promise<string> => {
    const result = await signAuthEntry(entryPreimageXdr);
    if (result.error) throw new Error(result.error);
    if (!result.signedAuthEntry) throw new Error("Failed to sign auth entry");
    return result.signedAuthEntry;
  }, []);

  const signBlobCallback = useCallback(
    async (blob: string, opts?: { accountToSign?: string }): Promise<string> => {
      const signOptions: { address?: string } = {};
      if (opts?.accountToSign) signOptions.address = opts.accountToSign;

      const result = await signMessage(blob, signOptions);
      if (result.error) throw new Error(result.error);

      const signedMessage = result.signedMessage;
       if (!signedMessage) throw new Error("Failed to sign blob");
       if (typeof signedMessage === "string") return signedMessage;
       if (Buffer.isBuffer(signedMessage)) return signedMessage.toString("base64");
       throw new Error("Failed to sign blob");
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
