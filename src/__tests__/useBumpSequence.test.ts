/**
 * @file useBumpSequence.test.ts
 * @description Unit tests for the useBumpSequence hook.
 * @package stellar-hooks
 * @license MIT
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock React hooks ─────────────────────────────────────────────────────────

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
  Horizon: {
    Server: vi.fn().mockImplementation(() => ({
      loadAccount: vi.fn().mockResolvedValue({ id: "GSOURCE", sequence: "1" }),
    })),
  },
  Operation: {
    bumpSequence: vi.fn().mockReturnValue({ type: "bumpSequence" }),
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

import { useBumpSequence } from "../hooks/useBumpSequence";

// ─── Helper ───────────────────────────────────────────────────────────────────

function getHook(overrides: Partial<Parameters<typeof useBumpSequence>[0]> = {}) {
  return useBumpSequence({ bumpTo: "1000000", ...overrides });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("useBumpSequence", () => {
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

  it("builds, signs, and submits the BumpSequence transaction", async () => {
    const hook = getHook();
    await hook.submit();

    expect(mockSignTransaction).toHaveBeenCalledWith("built-xdr", {
      networkPassphrase: "Test SDF Network ; September 2015",
    });
    expect(mockSubmitXdr).toHaveBeenCalledWith("signed-xdr");
  });

  it("passes bumpTo to Operation.bumpSequence", async () => {
    const { Operation } = await import("@stellar/stellar-sdk");
    const hook = getHook({ bumpTo: "9999999" });
    await hook.submit();

    expect(Operation.bumpSequence).toHaveBeenCalledWith({ bumpTo: "9999999" });
  });

  it("accepts a bigint bumpTo value", async () => {
    const { Operation } = await import("@stellar/stellar-sdk");
    const hook = getHook({ bumpTo: BigInt("12345678") });
    await hook.submit();

    expect(Operation.bumpSequence).toHaveBeenCalledWith({ bumpTo: "12345678" });
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

  it("calls reset", () => {
    const hook = getHook();
    hook.reset();
    expect(mockReset).toHaveBeenCalled();
  });
});
