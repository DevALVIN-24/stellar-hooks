import { describe, it, expect, vi } from "vitest";
import { useLedgerEntryQuery } from "../hooks/useLedgerEntryQuery";

const mockConfig = {
  horizonUrl: "https://horizon-testnet.stellar.org",
  sorobanRpcUrl: "https://soroban-testnet.stellar.org",
  network: "testnet",
  networkPassphrase: "Test SDF Network ; September 2015",
};

vi.mock("stellar-hooks", () => ({
  useStellarContext: () => ({ config: mockConfig }),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn((opts) => ({
    data: null,
    isLoading: false,
    error: null,
    isRefetching: false,
    refetch: vi.fn(),
    _queryKey: opts.queryKey,
    _enabled: opts.enabled,
  })),
}));

const mockLedgerKey = {
  toXDR: () => "base64encodedkey==",
} as any;

describe("useLedgerEntryQuery", () => {
  it("returns standard query fields", () => {
    const result = useLedgerEntryQuery(mockLedgerKey);

    expect(result).toHaveProperty("data");
    expect(result).toHaveProperty("isLoading");
    expect(result).toHaveProperty("error");
    expect(result).toHaveProperty("refetch");
  });

  it("uses ledgerEntry as query key prefix", () => {
    const result = useLedgerEntryQuery(mockLedgerKey) as any;

    expect(result._queryKey[0]).toBe("ledgerEntry");
    expect(result._queryKey[1]).toBe("base64encodedkey==");
  });

  it("is disabled when ledgerKey is null", () => {
    const result = useLedgerEntryQuery(null) as any;

    expect(result._enabled).toBe(false);
  });

  it("respects enabled:false option", () => {
    const result = useLedgerEntryQuery(mockLedgerKey, { enabled: false }) as any;

    expect(result._enabled).toBe(false);
  });

  it("uses custom sorobanRpcUrl in query key when provided", () => {
    const customUrl = "https://my-custom-rpc.example.com";
    const result = useLedgerEntryQuery(mockLedgerKey, {
      sorobanRpcUrl: customUrl,
    }) as any;

    expect(result._queryKey).toContain(customUrl);
  });
});
