import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useFreighter } from "../hooks/useFreighter";
import {
  resetFreighterMocks,
  mockFreighterConnected,
  mockFreighterInstalled,
  mockFreighterError,
  requestAccess,
  getAddress,
  getNetwork,
  signTransaction,
  signAuthEntry,
  signBlob,
} from "../__mocks__/@stellar/freighter-api";

// Note: vitest.config.ts already aliases "@stellar/freighter-api" to the
// manual mock file, so the hook and this test share the exact same vi.fn()
// instances. Calling vi.mock() here would auto-mock and clobber the resolved
// values, so we deliberately omit it.

beforeEach(() => {
  resetFreighterMocks();
});

describe("useFreighter — not installed", () => {
  it("starts with isLoading true", () => {
    const { result } = renderHook(() => useFreighter());
    expect(result.current.isLoading).toBe(true);
  });

  it("sets isInstalled false when Freighter is not detected", async () => {
    const { result } = renderHook(() => useFreighter());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isInstalled).toBe(false);
    expect(result.current.isConnected).toBe(false);
    expect(result.current.publicKey).toBeNull();
  });
});

describe("useFreighter — installed but not connected", () => {
  it("sets isInstalled true and isConnected false", async () => {
    mockFreighterInstalled();
    const { result } = renderHook(() => useFreighter());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isInstalled).toBe(true);
    expect(result.current.isConnected).toBe(false);
    expect(result.current.publicKey).toBeNull();
  });
});

describe("useFreighter — connected", () => {
  it("sets publicKey, network, and networkPassphrase when connected", async () => {
    mockFreighterConnected("GDEMO123PUBLICKEY", "TESTNET", "Test SDF Network ; September 2015");
    const { result } = renderHook(() => useFreighter());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isConnected).toBe(true);
    expect(result.current.publicKey).toBe("GDEMO123PUBLICKEY");
    expect(result.current.network).toBe("TESTNET");
    expect(result.current.networkPassphrase).toBe("Test SDF Network ; September 2015");
  });
});

describe("useFreighter — connect()", () => {
  it("connects successfully when requestAccess succeeds", async () => {
    mockFreighterInstalled();
    requestAccess.mockResolvedValue({ address: "GNEW456PUBLICKEY", error: null });
    getAddress.mockResolvedValue({ address: "GNEW456PUBLICKEY", error: null });
    getNetwork.mockResolvedValue({ network: "TESTNET", networkPassphrase: "Test SDF Network ; September 2015" });

    const { result } = renderHook(() => useFreighter());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.connect();
    });

    expect(result.current.isConnected).toBe(true);
    expect(result.current.publicKey).toBe("GNEW456PUBLICKEY");
  });

  it("sets error when requestAccess fails", async () => {
    requestAccess.mockRejectedValue(new Error("User rejected"));
    const { result } = renderHook(() => useFreighter());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.connect();
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe("User rejected");
    expect(result.current.isConnected).toBe(false);
  });
});

describe("useFreighter — disconnect()", () => {
  it("clears publicKey and sets isConnected false", async () => {
    mockFreighterConnected();
    const { result } = renderHook(() => useFreighter());
    await waitFor(() => expect(result.current.isConnected).toBe(true));

    act(() => {
      result.current.disconnect();
    });

    expect(result.current.isConnected).toBe(false);
    expect(result.current.publicKey).toBeNull();
  });
});

describe("useFreighter — error state", () => {
  it("sets error when Freighter throws on probe", async () => {
    mockFreighterError("Extension crashed");
    const { result } = renderHook(() => useFreighter());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe("Extension crashed");
  });
});

describe("useFreighter — signTransaction()", () => {
  it("returns signed XDR", async () => {
    mockFreighterConnected();
    signTransaction.mockResolvedValue({ signedTxXdr: "signed-result-xdr", error: null });
    const { result } = renderHook(() => useFreighter());
    await waitFor(() => expect(result.current.isConnected).toBe(true));

    const signed = await result.current.signTransaction("raw-xdr");
    expect(signed).toBe("signed-result-xdr");
  });

  it("throws when signTransaction returns error", async () => {
    mockFreighterConnected();
    signTransaction.mockResolvedValue({ signedTxXdr: "", error: "Sign failed" });
    const { result } = renderHook(() => useFreighter());
    await waitFor(() => expect(result.current.isConnected).toBe(true));

    await expect(result.current.signTransaction("raw-xdr")).rejects.toThrow("Sign failed");
  });
});

describe("useFreighter — signAuthEntry()", () => {
  it("returns signed auth entry", async () => {
    mockFreighterConnected();
    signAuthEntry.mockResolvedValue({ signedAuthEntry: "signed-auth", error: null });
    const { result } = renderHook(() => useFreighter());
    await waitFor(() => expect(result.current.isConnected).toBe(true));

    const signed = await result.current.signAuthEntry("entry-xdr");
    expect(signed).toBe("signed-auth");
  });
});

describe("useFreighter — signBlob()", () => {
  it("returns signed blob", async () => {
    mockFreighterConnected();
    signBlob.mockResolvedValue({ signedBlob: "signed-blob-result", error: null });
    const { result } = renderHook(() => useFreighter());
    await waitFor(() => expect(result.current.isConnected).toBe(true));

    const signed = await result.current.signBlob("my-blob");
    expect(signed).toBe("signed-blob-result");
  });
});