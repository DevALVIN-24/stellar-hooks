import { describe, it, expect, vi } from "vitest";
import { useStellarBalanceQuery } from "../hooks/useStellarBalanceQuery";

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

describe("useStellarBalanceQuery", () => {
  it("returns standard query fields", () => {
    const result = useStellarBalanceQuery(PUBLIC_KEY);

    expect(result).toHaveProperty("data");
    expect(result).toHaveProperty("isLoading");
    expect(result).toHaveProperty("error");
    expect(result).toHaveProperty("refetch");
  });

  it("uses stellarBalance as query key prefix", () => {
    const result = useStellarBalanceQuery(PUBLIC_KEY) as any;

    expect(result._queryKey[0]).toBe("stellarBalance");
    expect(result._queryKey).toContain(PUBLIC_KEY);
  });

  it("includes assetCode and assetIssuer in cache key when provided", () => {
    const result = useStellarBalanceQuery(PUBLIC_KEY, {
      assetCode: "USDC",
      assetIssuer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
    }) as any;

    expect(result._queryKey).toContain("USDC");
    expect(result._queryKey).toContain("GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN");
  });

  it("is disabled when publicKey is null", () => {
    const result = useStellarBalanceQuery(null) as any;

    expect(result._enabled).toBe(false);
  });
});
