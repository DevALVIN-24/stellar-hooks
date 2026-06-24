import { vi } from "vitest";

export const isConnected = vi.fn().mockResolvedValue({ isConnected: false });
export const getAddress = vi.fn().mockResolvedValue({ address: null, error: "Not connected" });
export const getNetwork = vi.fn().mockResolvedValue({ network: null, networkPassphrase: null });
export const getNetworkDetails = getNetwork;
export const requestAccess = vi.fn().mockResolvedValue({ address: null, error: null });
export const signTransaction = vi.fn().mockResolvedValue({ signedTxXdr: "signed-xdr", error: null });
export const signAuthEntry = vi.fn().mockResolvedValue({ signedAuthEntry: "signed-entry", error: null });
export const signMessage = vi.fn().mockResolvedValue({ signedMessage: "signed-blob", error: null });
export const getNetworkDetails = vi.fn().mockResolvedValue({ network: null, networkPassphrase: null });
export const getNetwork = getNetworkDetails;
export const requestAccess = vi.fn().mockResolvedValue({ address: null, error: null });
export const signTransaction = vi.fn().mockResolvedValue({ signedTxXdr: "signed-xdr", error: null });
export const signAuthEntry = vi.fn().mockResolvedValue({ signedAuthEntry: "signed-entry", error: null });
export const signMessage = vi.fn().mockResolvedValue({ signedMessage: "signed-blob", signedBlob: "signed-blob", error: null });
export const signBlob = signMessage;

export function resetFreighterMocks() {
  isConnected.mockResolvedValue({ isConnected: false });
  getAddress.mockResolvedValue({ address: null, error: "Not connected" });
  getNetworkDetails.mockResolvedValue({ network: null, networkPassphrase: null });
  requestAccess.mockResolvedValue({ address: null, error: null });
  signTransaction.mockResolvedValue({ signedTxXdr: "signed-xdr", error: null });
  signAuthEntry.mockResolvedValue({ signedAuthEntry: "signed-entry", error: null });
  signMessage.mockResolvedValue({ signedMessage: "signed-blob", error: null });
  signMessage.mockResolvedValue({ signedMessage: "signed-blob", signedBlob: "signed-blob", error: null });
}

export function mockFreighterConnected(
  publicKey = "GAAZI4BCE7Y5L7S25K2LJKBJHW7X2UHLW4XY5R2DZPHFBUHE5PQ7L2UQ",
  network = "TESTNET",
  networkPassphrase = "Test SDF Network ; September 2015"
) {
  isConnected.mockResolvedValue({ isConnected: true });
  getAddress.mockResolvedValue({ address: publicKey, error: null });
  getNetworkDetails.mockResolvedValue({ network, networkPassphrase });
}

export function mockFreighterInstalled() {
  isConnected.mockResolvedValue({ isConnected: true });
  getAddress.mockResolvedValue({ address: null, error: "No address" });
  getNetworkDetails.mockResolvedValue({ network: null, networkPassphrase: null });
}

export function mockFreighterError(message = "Freighter error") {
  isConnected.mockResolvedValue({ isConnected: true });
  getAddress.mockRejectedValue(new Error(message));
}