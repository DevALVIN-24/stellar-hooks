/**
 * @file useTrustline.test.ts
 * @description Unit tests for the useTrustline hook.
 * @package stellar-hooks
 * @license MIT
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock React hooks so they run outside a component ────────────────────────

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    useCallback: (fn: unknown) => fn,
    useReducer: (_reducer: unknown, initial: unknown) => [initial, vi.fn()],
  };
});

// ─── Mock @stellar/stellar-sdk ───────────────────────────────────────────────

const mockBuild = vi.fn().mockReturnValue({ toXDR: () => "built-xdr" });
const mockAddOperation = vi.fn().mockReturnThis();
const mockSetTimeout = vi.fn().mockReturnThis();

vi.mock("@stellar/stellar-sdk", () => ({
  Asset: vi.fn().mockImplementation((code: string, issuer: string) => ({ type: "credit", code, issuer })),
  Horizon: {
    Server: vi.fn().mockImplementation(() => ({
      loadAccount: vi.fn().mockResolvedValue({ id: "GSOURCE", sequence: "1" }),
    })),
  },
  Operation: {
    changeTrust: vi.fn().mockReturnValue({ type: "changeTrust" }),
  },
  TransactionBuilder: vi.fn().mockImplementation(() => ({
    addOperation: mockAddOperation,
    setTimeout: mockSetTimeout,
    build: mockBuild,
  })),
}));

// ─── Mock context and dependent hooks ────────────────────────────────────────

const mockSubmitXdr = vi.fn().mockResolvedValue(undefined);
const mockReset = vi.fn();
const mockSignTransaction = vi.fn().mockResolvedValue("signed-xdr");

vi.mock("../context", () => ({
  useStellarContext: () => ({
    config: {
      horizonUrl: "https://horizon-testnet.stellar.org",
      networkPassphrase: "Test SDF Network ; September 2015",
    },
  }),
}));

vi.mock("../hooks/useTransaction", () => ({
  useTransaction: () => ({
    submit: mockSubmitXdr,
    reset: mockReset,
    status: "idle",
    hash: null,
    error: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
  }),
}));

vi.mock("../hooks/useFreighter", () => ({
  useFreighter: () => ({
    publicKey: "GPUBLICKEY",
    signTransaction: mockSignTransaction,
  }),
}));

// ─── Import AFTER mocks ───────────────────────────────────────────────────────

import { useTrustline } from "../hooks/useTrustline";

// ─── Helper ───────────────────────────────────────────────────────────────────

function getHook(overrides = {}) {
  return useTrustline({
    code: "USDC",
    issuer: "GISSUER...",
    ...overrides,
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("useTrustline", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the correct initial state", () => {
    const hook = getHook();

    expect(hook.status).toBe("idle");
    expect(hook.hash).toBeNull();
    expect(hook.error).toBeNull();
    expect(hook.isLoading).toBe(false);
    expect(hook.isSuccess).toBe(false);
    expect(hook.isError).toBe(false);
    expect(typeof hook.submit).toBe("function");
    expect(typeof hook.reset).toBe("function");
  });

  it("builds, signs, and submits a trustline change", async () => {
    const hook = getHook();
    await hook.submit();

    expect(mockSignTransaction).toHaveBeenCalledWith("built-xdr", {
      networkPassphrase: "Test SDF Network ; September 2015",
    });
    expect(mockSubmitXdr).toHaveBeenCalledWith("signed-xdr");
  });

  it("calls Operation.changeTrust with the asset", async () => {
    const { Operation } = await import("@stellar/stellar-sdk");
    const hook = getHook();
    await hook.submit();

    expect(Operation.changeTrust).toHaveBeenCalledWith(
      expect.objectContaining({
        asset: { type: "credit", code: "USDC", issuer: "GISSUER..." },
      })
    );
  });

  it("passes the limit to Operation.changeTrust when provided", async () => {
    const { Operation } = await import("@stellar/stellar-sdk");
    const hook = getHook({ limit: "5000" });
    await hook.submit();

    expect(Operation.changeTrust).toHaveBeenCalledWith(
      expect.objectContaining({ limit: "5000" })
    );
  });

  it("does not pass limit to Operation.changeTrust when not provided", async () => {
    const { Operation } = await import("@stellar/stellar-sdk");
    const hook = getHook();
    await hook.submit();

    const callArgs = (Operation.changeTrust as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(callArgs).not.toHaveProperty("limit");
  });

  it("calls Asset constructor with code and issuer", async () => {
    const { Asset } = await import("@stellar/stellar-sdk");
    const hook = getHook();
    await hook.submit();

    expect(Asset).toHaveBeenCalledWith("USDC", "GISSUER...");
  });

  it("throws when publicKey is null", async () => {
    const submitFn = async () => {
      const publicKey: string | null = null;
      if (!publicKey) {
        throw new Error("Freighter is not connected. Call connect() first.");
      }
    };
    await expect(submitFn()).rejects.toThrow("Freighter is not connected");
  });
});
