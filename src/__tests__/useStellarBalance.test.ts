/**
 * @file useStellarBalance.test.ts
 * @description Unit tests for the useStellarBalance hook.
 * @package stellar-hooks
 * @license MIT
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useStellarBalance } from "../hooks/useStellarBalance";
import * as useStellarAccountModule from "../hooks/useStellarAccount";
import type { UseStellarAccountReturn } from "../hooks/useStellarAccount";

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("../hooks/useStellarAccount");

const mockUseStellarAccount = vi.mocked(useStellarAccountModule.useStellarAccount);

const XLM_ONLY_DATA: UseStellarAccountReturn = {
  account: null,
  data: {
    accountId: "GABC...",
    balances: [
      { assetType: "native", balance: "100.0000000", balanceFloat: 100, isNative: true, buyingLiabilities: "0", sellingLiabilities: "0" },
    ],
    sequence: "1",
    subentryCount: 0,
    numSponsored: 0,
    numSponsoring: 0,
    thresholds: { lowThreshold: 0, medThreshold: 0, highThreshold: 0 },
    flags: { authRequired: false, authRevocable: false, authImmutable: false, authClawbackEnabled: false },
    raw: {} as unknown as import("@stellar/stellar-sdk").Horizon.AccountResponse,
  },
  isLoading: false,
  error: null,
  lastFetchedAt: new Date(),
  refetch: vi.fn(),
};

const MULTI_ASSET_DATA: UseStellarAccountReturn = {
  account: null,
  data: {
    accountId: "GABC...",
    balances: [
      { assetType: "native", balance: "100.0000000", balanceFloat: 100, isNative: true, buyingLiabilities: "0", sellingLiabilities: "0" },
      { assetType: "credit_alphanum4", assetCode: "USDC", assetIssuer: "GISSUER", balance: "50.0000000", balanceFloat: 50, isNative: false, buyingLiabilities: "0", sellingLiabilities: "0", limit: "1000" },
    ],
    sequence: "1",
    subentryCount: 0,
    numSponsored: 0,
    numSponsoring: 0,
    thresholds: { lowThreshold: 0, medThreshold: 0, highThreshold: 0 },
    flags: { authRequired: false, authRevocable: false, authImmutable: false, authClawbackEnabled: false },
    raw: {} as unknown as import("@stellar/stellar-sdk").Horizon.AccountResponse,
  },
  isLoading: false,
  error: null,
  lastFetchedAt: new Date(),
  refetch: vi.fn(),
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("useStellarBalance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("extracts XLM balance from account data", () => {
    mockUseStellarAccount.mockReturnValue(XLM_ONLY_DATA);

    const { result } = renderHook(() => useStellarBalance("GABC..."));

    expect(result.current.xlmBalance?.balance).toBe("100.0000000");
    expect(result.current.balances).toHaveLength(1);
  });

  it("handles multiple assets and correctly identifies XLM", () => {
    mockUseStellarAccount.mockReturnValue(MULTI_ASSET_DATA);

    const { result } = renderHook(() => useStellarBalance("GABC..."));

    expect(result.current.xlmBalance?.balance).toBe("100.0000000");
    expect(result.current.balances).toHaveLength(2);
    expect(result.current.balances.find(b => b.assetCode === "USDC")).toBeDefined();
  });

  it("returns specific asset balance when asset is provided", () => {
    const usdcAsset = { code: "USDC", issuer: "GISSUER" };
    mockUseStellarAccount.mockReturnValue(MULTI_ASSET_DATA);

    const { result } = renderHook(() => useStellarBalance("GABC...", usdcAsset));

    expect(result.current.assetBalance?.assetCode).toBe("USDC");
    expect(result.current.assetBalance?.balance).toBe("50.0000000");
  });

  it("returns null assetBalance when trustline is missing", () => {
    const missingAsset = { code: "BONY", issuer: "GOTHER" };
    mockUseStellarAccount.mockReturnValue(MULTI_ASSET_DATA);

    const { result } = renderHook(() => useStellarBalance("GABC...", missingAsset));

    expect(result.current.assetBalance).toBeNull();
  });

  it("returns null xlmBalance when account data is missing", () => {
    mockUseStellarAccount.mockReturnValue({
      account: null,
      data: null,
      isLoading: false,
      error: null,
      lastFetchedAt: null,
      refetch: vi.fn(),
    });

    const { result } = renderHook(() => useStellarBalance("GABC..."));

    expect(result.current.xlmBalance).toBeNull();
    expect(result.current.balances).toEqual([]);
  });

  it("passes options to useStellarAccount", () => {
    const options = { enabled: false, refetchInterval: 5000 };
    mockUseStellarAccount.mockReturnValue({
      account: null,
      data: null,
      isLoading: false,
      error: null,
      lastFetchedAt: null,
      refetch: vi.fn(),
    });

    renderHook(() => useStellarBalance("GABC...", options));

    expect(mockUseStellarAccount).toHaveBeenCalledWith("GABC...", options);
  });

  it("handles null publicKey", () => {
    mockUseStellarAccount.mockReturnValue({
      account: null,
      data: null,
      isLoading: false,
      error: null,
      lastFetchedAt: null,
      refetch: vi.fn(),
    });

    const { result } = renderHook(() => useStellarBalance(null));

    expect(result.current.xlmBalance).toBeNull();
    expect(result.current.balances).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("handles undefined publicKey", () => {
    mockUseStellarAccount.mockReturnValue({
      account: null,
      data: null,
      isLoading: false,
      error: null,
      lastFetchedAt: null,
      refetch: vi.fn(),
    });

    const { result } = renderHook(() => useStellarBalance(undefined));

    expect(result.current.xlmBalance).toBeNull();
    expect(result.current.balances).toEqual([]);
  });

  it("propagates loading state from useStellarAccount", () => {
    mockUseStellarAccount.mockReturnValue({
      account: null,
      data: null,
      isLoading: true,
      error: null,
      lastFetchedAt: null,
      refetch: vi.fn(),
    });

    const { result } = renderHook(() => useStellarBalance("GABC..."));

    expect(result.current.isLoading).toBe(true);
  });

  it("propagates error state from useStellarAccount", () => {
    const testError = new Error("Failed to fetch");
    mockUseStellarAccount.mockReturnValue({
      account: null,
      data: null,
      isLoading: false,
      error: testError,
      lastFetchedAt: null,
      refetch: vi.fn(),
    });

    const { result } = renderHook(() => useStellarBalance("GABC..."));

    expect(result.current.error).toBe(testError);
  });

  it("propagates lastFetchedAt from useStellarAccount", () => {
    const lastFetchedAt = new Date("2024-01-01");
    mockUseStellarAccount.mockReturnValue({
      account: null,
      data: XLM_ONLY_DATA.data,
      isLoading: false,
      error: null,
      lastFetchedAt,
      refetch: vi.fn(),
    });

    const { result } = renderHook(() => useStellarBalance("GABC..."));

    expect(result.current.lastFetchedAt).toBe(lastFetchedAt);
  });

  it("propagates refetch from useStellarAccount", async () => {
    const refetchMock = vi.fn().mockResolvedValue(undefined);
    mockUseStellarAccount.mockReturnValue({
      account: null,
      data: XLM_ONLY_DATA.data,
      isLoading: false,
      error: null,
      lastFetchedAt: new Date(),
      refetch: refetchMock,
    });

    const { result } = renderHook(() => useStellarBalance("GABC..."));

    await result.current.refetch();
    expect(refetchMock).toHaveBeenCalledOnce();
  });

  it("exposes data alias matching account data", () => {
    mockUseStellarAccount.mockReturnValue(XLM_ONLY_DATA);

    const { result } = renderHook(() => useStellarBalance("GABC..."));

    expect(result.current.data).toBe(XLM_ONLY_DATA.data);
  });

  it("passes asset as second arg and options as third arg separately", () => {
    const usdcAsset = { code: "USDC", issuer: "GISSUER" };
    const options = { enabled: false };
    mockUseStellarAccount.mockReturnValue(MULTI_ASSET_DATA);

    renderHook(() => useStellarBalance("GABC...", usdcAsset, options));

    expect(mockUseStellarAccount).toHaveBeenCalledWith("GABC...", options);
  });

  it("handles explicit null assetOrOptions", () => {
    mockUseStellarAccount.mockReturnValue(XLM_ONLY_DATA);

    const { result } = renderHook(() => useStellarBalance("GABC...", null));

    expect(result.current.xlmBalance?.balance).toBe("100.0000000");
    expect(result.current.assetBalance).toBeNull();
  });

  it("returns empty balances when account has no balances", () => {
    mockUseStellarAccount.mockReturnValue({
      account: null,
      data: { balances: [] },
      isLoading: false,
      error: null,
      lastFetchedAt: new Date(),
      refetch: vi.fn(),
    });

    const { result } = renderHook(() => useStellarBalance("GABC..."));

    expect(result.current.balances).toEqual([]);
    expect(result.current.xlmBalance).toBeNull();
  });

  it("does not find asset balance when asset code differs in case", () => {
    const usdcAsset = { code: "usdc", issuer: "GISSUER" };
    mockUseStellarAccount.mockReturnValue(MULTI_ASSET_DATA);

    const { result } = renderHook(() => useStellarBalance("GABC...", usdcAsset));

    expect(result.current.assetBalance).toBeNull();
  });

  it("does not find asset balance when asset issuer differs", () => {
    const usdcAsset = { code: "USDC", issuer: "GOTHER" };
    mockUseStellarAccount.mockReturnValue(MULTI_ASSET_DATA);

    const { result } = renderHook(() => useStellarBalance("GABC...", usdcAsset));

    expect(result.current.assetBalance).toBeNull();
  });
});
