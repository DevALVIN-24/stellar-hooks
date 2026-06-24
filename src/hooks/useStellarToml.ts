/**
 * @file useStellarToml.ts
 * @description Hook for fetching and parsing stellar.toml files.
 * @package stellar-hooks
 * @license MIT
 */

import { useCallback, useEffect, useState } from "react";
import { StellarToml } from "@stellar/stellar-sdk";
import { getCache, setCache } from "../utils";

export interface StellarTomlData {
  CURRENCIES?: Array<Record<string, unknown>>;
  VALIDATORS?: Array<Record<string, unknown>>;
  DOCUMENTATION?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface UseStellarTomlOptions {
  /** Time-to-live for cache in milliseconds (default: 300000 = 5 minutes) */
  cacheTTL?: number;
}

/**
 * @example
 * ```tsx
 * const {
 *   data,      // StellarTomlData | null — parsed stellar.toml contents
 *   isLoading, // boolean
 *   error,     // Error | null
 *   refetch,   // () => Promise<void>
 * } = useStellarToml("stellar.org");
 *
 * // data.CURRENCIES → array of supported assets
 * // data.DOCUMENTATION → org info
 * ```
 */
export interface UseStellarTomlReturn {
  data: StellarTomlData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Fetches and parses a domain's stellar.toml file via the SEP-1 standard.
 */
export function useStellarToml(
  domain: string | null | undefined,
  options: UseStellarTomlOptions = {},
): UseStellarTomlReturn {
  const { cacheTTL = 300000 } = options;
  const [data, setData] = useState<StellarTomlData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async (force = false) => {
    if (!domain) return;

    const cacheKey = `stellar-toml-${domain}`;
    if (!force) {
      const cached = getCache<StellarTomlData>(cacheKey);
      if (cached) {
        setData(cached);
        return;
      }
    }

    setIsLoading(true);
    setError(null);
    try {
      const toml = await StellarToml.Resolver.resolve(domain);
      const parsed = toml as StellarTomlData;
      setCache(cacheKey, parsed, cacheTTL);
      setData(parsed);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [domain, cacheTTL]);

  useEffect(() => {
    if (domain) {
      void refetch();
    }
  }, [domain, refetch]);

  return { data, isLoading, error, refetch: () => refetch(true) };
}
