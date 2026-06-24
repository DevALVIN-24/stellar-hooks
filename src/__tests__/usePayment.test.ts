/**
 * @file usePayment.test.ts
 * @description Unit tests for the usePayment hook.
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
const mockAddMemo = vi.fn().mockReturnThis();

vi.mock("@stellar/stellar-sdk", () => ({
  StrKey: {
    isValidEd25519PublicKey: vi.fn().mockReturnValue(true),
  },
  Asset: Object.assign(
  vi.fn().mockImplementation((code: string, issuer: string) => ({ type: "credit", code, issuer })),
  {
    native: vi.fn().mockReturnValue({ type: "native" }),
  }
),
  Horizon: {
    Server: vi.fn().mockImplementation(() => ({
      loadAccount: vi.fn().mockResolvedValue({ id: "GSOURCE", sequence: "1" }),
    })),
  },
  Memo: {
    text: vi.fn().mockReturnValue({ type: "text", value: "Thanks!" }),
  },
  Operation: {
    payment: vi.fn().mockReturnValue({ type: "payment" }),
  },
  TransactionBuilder: vi.fn().mockImplementation(() => ({
    addOperation: mockAddOperation,
    setTimeout: mockSetTimeout,
    addMemo: mockAddMemo,
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

import { usePayment } from "../hooks/usePayment";

// ─── Helper ───────────────────────────────────────────────────────────────────

function useHook(overrides = {}) {
  return usePayment({
    destination: "GDEST...",
    asset: { type: "native" },
    amount: "10",
    ...overrides,
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("usePayment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the correct initial state", () => {
    const hook = useHook();

    expect(hook.status).toBe("idle");
    expect(hook.hash).toBeNull();
    expect(hook.error).toBeNull();
    expect(hook.isLoading).toBe(false);
    expect(hook.isSuccess).toBe(false);
    expect(hook.isError).toBe(false);
    expect(typeof hook.submit).toBe("function");
    expect(typeof hook.reset).toBe("function");
  });

  it("builds, signs, and submits an XLM payment", async () => {
    const hook = useHook();
    await hook.submit();

    expect(mockSignTransaction).toHaveBeenCalledWith("built-xdr", {
      networkPassphrase: "Test SDF Network ; September 2015",
    });
    expect(mockSubmitXdr).toHaveBeenCalledWith("signed-xdr");
  });

  it("attaches a memo when provided", async () => {
    const { Memo } = await import("@stellar/stellar-sdk");
    const hook = useHook({ memo: "Thanks!" });
    await hook.submit();

    expect(Memo.text).toHaveBeenCalledWith("Thanks!");
    expect(mockAddMemo).toHaveBeenCalled();
  });

  it("does not attach a memo when not provided", async () => {
    const hook = useHook();
    await hook.submit();

    expect(mockAddMemo).not.toHaveBeenCalled();
  });

  it("uses Asset.native() for native asset type", async () => {
    const { Asset } = await import("@stellar/stellar-sdk");
    const hook = useHook({ asset: { type: "native" } });
    await hook.submit();

    expect(Asset.native).toHaveBeenCalled();
  });

  it("uses a credit asset when asset type is credit", async () => {
    const { Asset } = await import("@stellar/stellar-sdk");
    const hook = useHook({
      asset: { type: "credit", code: "USDC", issuer: "GISSUER..." },
    });
    await hook.submit();

    expect(Asset.native).not.toHaveBeenCalled();
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