import { useCallback, useEffect, useReducer } from "react";
import {
  isConnected,
  getAddress,
  getNetworkDetails,
  requestAccess,
  signTransaction,
  signAuthEntry,
  signMessage,
} from "@stellar/freighter-api";
import type { FreighterState, SignTransactionOptions, UseFreighterReturn } from "../types";
import { asPublicKey, unsafeAsXdrString } from "../types";

// ─── State Machine ────────────────────────────────────────────────────────────

type Action =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_CONNECTED"; publicKey: StellarPublicKey; network: string; networkPassphrase: string }
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

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Connect to and interact with the Freighter browser wallet.
 *
 * @example
 * ```tsx
 * const { isConnected, publicKey, connect } = useFreighter();
 *
 * if (!isConnected) return <button onClick={connect}>Connect</button>;
 * return <p>Connected: {publicKey}</p>;
 * ```
 */
export function useFreighter(): UseFreighterReturn {
  const [state, dispatch] = useReducer(reducer, initial);

  useEffect(() => {
    let cancelled = false;

    async function probe() {
      dispatch({ type: "SET_LOADING", payload: true });
      try {
        const { isConnected: connected, error: connErr } = await isConnected();
        if (cancelled) return;

        if (connErr || !connected) {
          dispatch({ type: "SET_NOT_INSTALLED" });
          return;
        }

        const { address, error: addrErr } = await getAddress();
        if (cancelled) return;

        if (!addrErr && address) {
          const networkDetails = await getNetworkDetails();
          if (cancelled) return;
          dispatch({
            type: "SET_CONNECTED",
            publicKey: asPublicKey(address),
            network: networkDetails.network ?? "",
            networkPassphrase: networkDetails.networkPassphrase ?? "",
          });
        } else {
          dispatch({ type: "SET_DISCONNECTED" });
        }
      } catch (err) {
        if (!cancelled) {
          dispatch({ type: "SET_ERROR", payload: err instanceof Error ? err : new Error(String(err)) });
        }
      }
    }

    void probe();
    return () => { cancelled = true; };
  }, []);

  const connect = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const { address, error } = await requestAccess();
      if (error) throw new Error(error.message);
      if (!address) throw new Error("Failed to get address");

      const networkDetails = await getNetworkDetails();
      dispatch({
        type: "SET_CONNECTED",
        publicKey: asPublicKey(address),
        network: networkDetails.network ?? "",
        networkPassphrase: networkDetails.networkPassphrase ?? "",
      });
    } catch (err) {
      dispatch({ type: "SET_ERROR", payload: err instanceof Error ? err : new Error(String(err)) });
    }
  }, []);

  const disconnect = useCallback(() => {
    dispatch({ type: "SET_DISCONNECTED" });
  }, []);

  const signTx = useCallback(
    async (xdr: StellarXdrString, opts?: SignTransactionOptions): Promise<StellarXdrString> => {
      const { signedTxXdr, error } = await signTransaction(xdr, {
        ...(opts?.networkPassphrase && { networkPassphrase: opts.networkPassphrase }),
        ...(opts?.address && { address: opts.address }),
      });
      if (error) throw new Error(error.message);
      return unsafeAsXdrString(signedTxXdr);
    },
    []
  );

  const signEntry = useCallback(
    async (entryPreimageXdr: StellarXdrString): Promise<StellarXdrString> => {
      const publicKey = state.publicKey;
      if (!publicKey) throw new Error("Wallet not connected");
      const { signedAuthEntry, error } = await signAuthEntry(entryPreimageXdr, {
        address: publicKey,
      });
      if (error) throw new Error(error.message);
      if (!signedAuthEntry) throw new Error("No signed auth entry returned");
      return unsafeAsXdrString(signedAuthEntry);
    },
    [state.publicKey]
  );

  // signBlob maps to signMessage in freighter-api v6
  const signBlob = useCallback(
    async (blob: string, opts?: { accountToSign?: string }): Promise<string> => {
      const address = opts?.accountToSign ?? state.publicKey;
      if (!address) throw new Error("Wallet not connected");
      const { signedMessage, error } = await signMessage(blob, { address });
      if (error) throw new Error(error.message);
      if (!signedMessage) throw new Error("No signed message returned");
      return signedMessage.toString();
    },
    [state.publicKey]
  );

  return {
    ...state,
    connect,
    disconnect,
    signTransaction: signTx,
    signAuthEntry: signEntry,
    signBlob,
  };
}