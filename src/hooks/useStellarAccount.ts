import { useState, useEffect, useCallback, useRef } from "react";
import { Horizon } from "@stellar/stellar-sdk";
import { useStellarContext } from "../context/StellarContext";
import type { StellarAccountData, StellarBalance } from "../types";

export interface UseStellarAccountOptions {
  enabled?: boolean;
  refetchInterval?: number;
}

export interface UseStellarAccountReturn {
  data: StellarAccountData | null;
  isLoading: boolean;
  error: Error | null;
  lastFetchedAt: Date | null;
  refetch: () => Promise<void>;
}

function mapBalances(raw: Horizon.HorizonApi.BalanceLine[]): StellarBalance[] {
  return raw.map((b) => {
    if (b.asset_type === "native") {
      return { asset_type: "native", balance: b.balance };
    }
    return {
      asset_type: b.asset_type as "credit_alphanum4" | "credit_alphanum12",
      balance: b.balance,
      asset_code: (b as Horizon.HorizonApi.BalanceLineAsset).asset_code,
      asset_issuer: (b as Horizon.HorizonApi.BalanceLineAsset).asset_issuer,
    };
  });
}

export function useStellarAccount(
  publicKey: string | null | undefined,
  options: UseStellarAccountOptions = {}
): UseStellarAccountReturn {
  const { enabled = true, refetchInterval = 0 } = options;
  const { server } = useStellarContext();

  const [data, setData] = useState<StellarAccountData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchAccount = useCallback(async () => {
    if (!publicKey || !enabled) return;
    setIsLoading(true);
    setError(null);
    try {
      const raw = await server.loadAccount(publicKey);
      setData({
        balances: mapBalances(raw.balances),
        sequence: raw.sequenceNumber(),
        raw,
      });
      setLastFetchedAt(new Date());
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, enabled, server]);

  useEffect(() => {
    fetchAccount();
  }, [fetchAccount]);

  useEffect(() => {
    if (refetchInterval > 0) {
      intervalRef.current = setInterval(fetchAccount, refetchInterval);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchAccount, refetchInterval]);

  return { data, isLoading, error, lastFetchedAt, refetch: fetchAccount };
}
