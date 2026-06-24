import { describe, it, expect, vi } from "vitest";
import { useStellarAccountQuery } from "../hooks/useStellarAccountQuery";

const mockConfig = {
  horizonUrl: "https://horizon-testnet.stellar.org",
  sorobanRpcUrl: "https://soroban-testnet.stellar.org",
  network: "testnet",
  networkPassphrase: "Test SDF Network ; September 2015",
};

vi.mock("stellar-hooks", () => ({
  useStellarContext: () => ({ config: mockConfig }),
  parseAccountResponse: vi.fn((raw) => raw),
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

const PUBLIC_KEY = "GBRPYHIL2CI3WHZDTOOQFC6EB4PSJ2BUMTOJ4ONKJMK646ARTICONX2";

describe("useStellarAccountQuery", () => {
  it("returns standard query fields", () => {
    const result = useStellarAccountQuery(PUBLIC_KEY);

    expect(result).toHaveProperty("data");
    expect(result).toHaveProperty("isLoading");
    expect(result).toHaveProperty("error");
    expect(result).toHaveProperty("refetch");
  });

  it("uses publicKey in query key", () => {
    const result = useStellarAccountQuery(PUBLIC_KEY) as any;

    expect(result._queryKey).toContain(PUBLIC_KEY);
    expect(result._queryKey[0]).toBe("stellarAccount");
  });

  it("is disabled when publicKey is null", () => {
    const result = useStellarAccountQuery(null) as any;

    expect(result._enabled).toBe(false);
  });

  it("respects enabled:false option", () => {
    const result = useStellarAccountQuery(PUBLIC_KEY, { enabled: false }) as any;

    expect(result._enabled).toBe(false);
  });
});
