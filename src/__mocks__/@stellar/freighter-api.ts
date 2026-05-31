import { vi } from "vitest";

export const isConnected = vi.fn().mockResolvedValue({ isConnected: false });
export const getAddress = vi.fn().mockResolvedValue({ address: null, error: "Not connected" });
export const getNetwork = vi.fn().mockResolvedValue({ network: null, networkPassphrase: null });
export const requestAccess = vi.fn().mockResolvedValue({ address: null, error: null });
export const signTransaction = vi.fn().mockResolvedValue({ signedTxXdr: "signed-xdr", error: null });
export const signAuthEntry = vi.fn().mockResolvedValue({ signedAuthEntry: "signed-entry", error: null });
export const signBlob = vi.fn().mockResolvedValue({ signedBlob: "signed-blob", error: null });

export function resetFreighterMocks() {
  isConnected.mockResolvedValue({ isConnected: false });
  getAddress.mockResolvedValue({ address: null, error: "Not connected" });
  getNetwork.mockResolvedValue({ network: null, networkPassphrase: null });
  requestAccess.mockResolvedValue({ address: null, error: null });
  signTransaction.mockResolvedValue({ signedTxXdr: "signed-xdr", error: null });
  signAuthEntry.mockResolvedValue({ signedAuthEntry: "signed-entry", error: null });
  signBlob.mockResolvedValue({ signedBlob: "signed-blob", error: null });
}

export function mockFreighterConnected(
  publicKey = "GDEMO123PUBLICKEY",
  network = "TESTNET",
  networkPassphrase = "Test SDF Network ; September 2015"
) {
  isConnected.mockResolvedValue({ isConnected: true });
  getAddress.mockResolvedValue({ address: publicKey, error: null });
  getNetwork.mockResolvedValue({ network, networkPassphrase });
}

export function mockFreighterInstalled() {
  isConnected.mockResolvedValue({ isConnected: true });
  getAddress.mockResolvedValue({ address: null, error: "No address" });
  getNetwork.mockResolvedValue({ network: null, networkPassphrase: null });
}

export function mockFreighterError(message = "Freighter error") {
  isConnected.mockResolvedValue({ isConnected: true });
  getAddress.mockRejectedValue(new Error(message));
}