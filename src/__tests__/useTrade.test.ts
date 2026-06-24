/**
 * @file useTrade.test.ts
 * @description Unit tests for the useTrade hook.
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
  };
});

// ─── Mock @stellar/stellar-sdk ───────────────────────────────────────────────

const mockBuild = vi.fn().mockReturnValue({ toXDR: () => "built-xdr" });
const mockAddOperation = vi.fn().mockReturnThis();
const mockSetTimeout = vi.fn().mockReturnThis();

vi.mock("@stellar/stellar-sdk", () => ({
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
  Operation: {
    manageBuyOffer: vi.fn().mockImplementation((opts) => ({ type: "manageBuyOffer", ...opts })),
    manageSellOffer: vi.fn().mockImplementation((opts) => ({ type: "manageSellOffer", ...opts })),
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

// We'll mock useFreighter with a variable publicKey that we can change in tests
let mockPublicKey: string | null = "GPUBLICKEY";

vi.mock("../hooks/useFreighter", () => ({
  useFreighter: () => ({
    publicKey: mockPublicKey,
    signTransaction: mockSignTransaction,
  }),
}));

// ─── Import AFTER mocks ───────────────────────────────────────────────────────

import { useTrade } from "../hooks/useTrade";
import { Operation } from "@stellar/stellar-sdk";

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("useTrade", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPublicKey = "GPUBLICKEY";
  });

  it("returns the correct initial state", () => {
    const hook = useTrade();

    expect(hook.status).toBe("idle");
    expect(hook.hash).toBeNull();
    expect(hook.error).toBeNull();
    expect(hook.isLoading).toBe(false);
    expect(hook.isSuccess).toBe(false);
    expect(hook.isError).toBe(false);
    expect(typeof hook.placeOffer).toBe("function");
    expect(typeof hook.modifyOffer).toBe("function");
    expect(typeof hook.cancelOffer).toBe("function");
    expect(typeof hook.reset).toBe("function");
  });

  describe("placeOffer", () => {
    it("builds, signs, and submits a buy offer transaction", async () => {
      const hook = useTrade();
      await hook.placeOffer({
        type: "buy",
        selling: { type: "native" },
        buying: { type: "credit", code: "USDC", issuer: "GISSUER..." },
        amount: "100",
        price: "0.5",
      });

      expect(Operation.manageBuyOffer).toHaveBeenCalledWith({
        selling: expect.objectContaining({ type: "native" }),
        buying: expect.objectContaining({ type: "credit", code: "USDC", issuer: "GISSUER..." }),
        buyAmount: "100",
        price: "0.5",
        offerId: "0",
      });
      expect(mockSignTransaction).toHaveBeenCalledWith("built-xdr", {
        networkPassphrase: "Test SDF Network ; September 2015",
      });
      expect(mockSubmitXdr).toHaveBeenCalledWith("signed-xdr");
    });

    it("builds, signs, and submits a sell offer transaction", async () => {
      const hook = useTrade();
      await hook.placeOffer({
        type: "sell",
        selling: { type: "native" },
        buying: { type: "credit", code: "USDC", issuer: "GISSUER..." },
        amount: "50",
        price: "2.5",
      });

      expect(Operation.manageSellOffer).toHaveBeenCalledWith({
        selling: expect.objectContaining({ type: "native" }),
        buying: expect.objectContaining({ type: "credit", code: "USDC", issuer: "GISSUER..." }),
        amount: "50",
        price: "2.5",
        offerId: "0",
      });
      expect(mockSignTransaction).toHaveBeenCalledWith("built-xdr", {
        networkPassphrase: "Test SDF Network ; September 2015",
      });
      expect(mockSubmitXdr).toHaveBeenCalledWith("signed-xdr");
    });
  });

  describe("modifyOffer", () => {
    it("modifies an existing buy offer with offerId", async () => {
      const hook = useTrade();
      await hook.modifyOffer({
        type: "buy",
        offerId: "12345",
        selling: { type: "native" },
        buying: { type: "credit", code: "USDC", issuer: "GISSUER..." },
        amount: "150",
        price: "0.4",
      });

      expect(Operation.manageBuyOffer).toHaveBeenCalledWith({
        selling: expect.objectContaining({ type: "native" }),
        buying: expect.objectContaining({ type: "credit", code: "USDC", issuer: "GISSUER..." }),
        buyAmount: "150",
        price: "0.4",
        offerId: "12345",
      });
      expect(mockSubmitXdr).toHaveBeenCalled();
    });

    it("modifies an existing sell offer with offerId", async () => {
      const hook = useTrade();
      await hook.modifyOffer({
        type: "sell",
        offerId: 9876,
        selling: { type: "native" },
        buying: { type: "credit", code: "USDC", issuer: "GISSUER..." },
        amount: "80",
        price: "3.0",
      });

      expect(Operation.manageSellOffer).toHaveBeenCalledWith({
        selling: expect.objectContaining({ type: "native" }),
        buying: expect.objectContaining({ type: "credit", code: "USDC", issuer: "GISSUER..." }),
        amount: "80",
        price: "3.0",
        offerId: "9876",
      });
      expect(mockSubmitXdr).toHaveBeenCalled();
    });
  });

  describe("cancelOffer", () => {
    it("cancels a buy offer by setting amount to 0", async () => {
      const hook = useTrade();
      await hook.cancelOffer({
        type: "buy",
        offerId: "12345",
        selling: { type: "native" },
        buying: { type: "credit", code: "USDC", issuer: "GISSUER..." },
      });

      expect(Operation.manageBuyOffer).toHaveBeenCalledWith({
        selling: expect.objectContaining({ type: "native" }),
        buying: expect.objectContaining({ type: "credit", code: "USDC", issuer: "GISSUER..." }),
        buyAmount: "0",
        price: "1",
        offerId: "12345",
      });
      expect(mockSubmitXdr).toHaveBeenCalled();
    });

    it("cancels a sell offer with a custom price when specified", async () => {
      const hook = useTrade();
      await hook.cancelOffer({
        type: "sell",
        offerId: "54321",
        selling: { type: "native" },
        buying: { type: "credit", code: "USDC", issuer: "GISSUER..." },
        price: "1.5",
      });

      expect(Operation.manageSellOffer).toHaveBeenCalledWith({
        selling: expect.objectContaining({ type: "native" }),
        buying: expect.objectContaining({ type: "credit", code: "USDC", issuer: "GISSUER..." }),
        amount: "0",
        price: "1.5",
        offerId: "54321",
      });
      expect(mockSubmitXdr).toHaveBeenCalled();
    });
  });

  it("throws when publicKey is null", async () => {
    mockPublicKey = null;
    const hook = useTrade();

    await expect(
      hook.placeOffer({
        type: "buy",
        selling: { type: "native" },
        buying: { type: "credit", code: "USDC", issuer: "GISSUER..." },
        amount: "100",
        price: "0.5",
      })
    ).rejects.toThrow("Freighter is not connected. Call connect() first.");
  });
});
