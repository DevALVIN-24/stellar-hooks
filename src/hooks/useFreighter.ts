import { useCallback, useEffect, useMemo, useReducer } from "react";
import {
  isConnected,
  getAddress,
  getNetworkDetails,
  requestAccess,
  signTransaction,
  signAuthEntry,
  signMessage,
} from "@stellar/freighter-api";
import { useOptionalStellarContext } from "../context";
import type {
  FreighterState,
  SignTransactionOptions,
  UseFreighterOptions,
  UseFreighterReturn,
} from "../types";

// ─── Network mismatch helpers ─────────────────────────────────────────────────

function buildNetworkPassphraseWarning(
  walletNetwork: string | null,
  expectedPassphrase: string,
): string {
  const networkLabel = walletNetwork ?? "a different network";
  return (
    `Freighter is connected to ${networkLabel}, which does not match this app's ` +
    `configured network (${expectedPassphrase}). Switch the network in Freighter or ` +
    `update your StellarProvider configuration to avoid signing on the wrong network.`
  );
}

function getNetworkPassphraseMismatch(
  isConnected: boolean,
  walletPassphrase: string | null,
  expectedPassphrase: string | null,
): boolean {
  return Boolean(
    isConnected &&
      walletPassphrase &&
      expectedPassphrase &&
      walletPassphrase !== expectedPassphrase
  );
}
import type { FreighterState, SignTransactionOptions, UseFreighterReturn } from "../types";
import type { FreighterState, SignTransactionOptions, UseFreighterReturn, StellarPublicKey, StellarXdrString } from "../types";
import { asPublicKey, unsafeAsXdrString } from "../types";

// ─── State Machine ────────────────────────────────────────────────────────────

type Action =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_CONNECTED"; publicKey: StellarPublicKey; network: string; networkPassphrase: string }
  | { type: "SET_DISCONNECTED" }
  | { type: "SET_NOT_INSTALLED" }
  | { type: "SET_ERROR"; payload: Error };

type WalletReducerState = Omit<FreighterState, "networkPassphraseMismatch" | "networkPassphraseWarning">;

function reducer(state: WalletReducerState, action: Action): WalletReducerState {
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

const initial: Omit<FreighterState, "networkPassphraseMismatch" | "networkPassphraseWarning"> = {
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
export function useFreighter(options?: UseFreighterOptions): UseFreighterReturn {
  const [state, dispatch] = useReducer(reducer, initial);
  const stellarContext = useOptionalStellarContext();
  const expectedNetworkPassphrase =
    options?.expectedNetworkPassphrase ?? stellarContext?.config.networkPassphrase ?? null;

  const networkPassphraseMismatch = useMemo(
    () =>
      getNetworkPassphraseMismatch(
        state.isConnected,
        state.networkPassphrase,
        expectedNetworkPassphrase,
      ),
    [state.isConnected, state.networkPassphrase, expectedNetworkPassphrase],
  );

  const networkPassphraseWarning = useMemo(() => {
    if (!networkPassphraseMismatch || !expectedNetworkPassphrase) return null;
    return buildNetworkPassphraseWarning(state.network, expectedNetworkPassphrase);
  }, [networkPassphraseMismatch, expectedNetworkPassphrase, state.network]);

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
    networkPassphraseMismatch,
    networkPassphraseWarning,
    connect,
    disconnect,
    signTransaction: signTx,
    signAuthEntry: signEntry,
    signBlob,
  };
}