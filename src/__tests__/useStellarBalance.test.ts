/**
 * @file useStellarBalance.test.ts
 * @description Unit tests for the useStellarBalance hook.
 * @package stellar-hooks
 * @license MIT
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useStellarBalance } from "../hooks/useStellarBalance";
import * as useStellarAccountModule from "../hooks/useStellarAccount";

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("../hooks/useStellarAccount");

const mockUseStellarAccount = vi.mocked(useStellarAccountModule.useStellarAccount);

const XLM_ONLY_DATA = {
  data: {
    balances: [
      { assetType: "native", balance: "100.0000000", balanceFloat: 100, isNative: true },
    ],
  },
  isLoading: false,
  error: null,
  lastFetchedAt: new Date(),
  refetch: vi.fn(),
};

const MULTI_ASSET_DATA = {
  data: {
    balances: [
      { assetType: "native", balance: "100.0000000", balanceFloat: 100, isNative: true },
      { assetType: "credit_alphanum4", assetCode: "USDC", assetIssuer: "GISSUER", balance: "50.0000000", balanceFloat: 50, isNative: false },
    ],
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
    mockUseStellarAccount.mockReturnValue(XLM_ONLY_DATA as any);

    const { result } = renderHook(() => useStellarBalance("GABC..."));

    expect(result.current.xlmBalance?.balance).toBe("100.0000000");
    expect(result.current.balances).toHaveLength(1);
  });

  it("handles multiple assets and correctly identifies XLM", () => {
    mockUseStellarAccount.mockReturnValue(MULTI_ASSET_DATA as any);

    const { result } = renderHook(() => useStellarBalance("GABC..."));

    expect(result.current.xlmBalance?.balance).toBe("100.0000000");
    expect(result.current.balances).toHaveLength(2);
    expect(result.current.balances.find(b => b.assetCode === "USDC")).toBeDefined();
  });

  it("returns specific asset balance when asset is provided", () => {
    const usdcAsset = { code: "USDC", issuer: "GISSUER" };
    mockUseStellarAccount.mockReturnValue(MULTI_ASSET_DATA as any);

    const { result } = renderHook(() => useStellarBalance("GABC...", usdcAsset));

    expect(result.current.assetBalance?.assetCode).toBe("USDC");
    expect(result.current.assetBalance?.balance).toBe("50.0000000");
  });

  it("returns null assetBalance when trustline is missing", () => {
    const missingAsset = { code: "BONY", issuer: "GOTHER" };
    mockUseStellarAccount.mockReturnValue(MULTI_ASSET_DATA as any);

    const { result } = renderHook(() => useStellarBalance("GABC...", missingAsset));

    expect(result.current.assetBalance).toBeNull();
  });

  it("returns null xlmBalance when account data is missing", () => {
    mockUseStellarAccount.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
      lastFetchedAt: null,
      refetch: vi.fn(),
    } as any);

    const { result } = renderHook(() => useStellarBalance("GABC..."));

    expect(result.current.xlmBalance).toBeNull();
    expect(result.current.balances).toEqual([]);
  });

  it("passes options to useStellarAccount", () => {
    const options = { enabled: false, refetchInterval: 5000 };
    mockUseStellarAccount.mockReturnValue({} as any);

    renderHook(() => useStellarBalance("GABC...", options));

    expect(mockUseStellarAccount).toHaveBeenCalledWith("GABC...", options);
  });
});
