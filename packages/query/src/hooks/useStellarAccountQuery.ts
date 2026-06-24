/**
 * @file useStellarAccountQuery.ts
 * @description React Query hook for fetching Stellar account data directly via Horizon.
 * @package @stellar-hooks/query
 * @license MIT
 */

import { useQuery } from "@tanstack/react-query";
import { Horizon } from "@stellar/stellar-sdk";
import { useStellarContext, parseAccountResponse } from "stellar-hooks";
import type { StellarAccountData } from "stellar-hooks";
import type { UseStellarAccountQueryOptions } from "../types";

/**
 * React Query adapter that fetches a Stellar account directly inside `queryFn`
 * so React Query owns the lifecycle: caching, deduplication, background refetch,
 * and window-focus invalidation all work out of the box.
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useStellarAccountQuery(publicKey, {
 *   staleTime: 60_000,
 *   refetchInterval: 5_000,
 * });
 * ```
 */
export function useStellarAccountQuery(
  publicKey: string | null | undefined,
  options?: UseStellarAccountQueryOptions
) {
  const { config } = useStellarContext();
  const horizonUrl = options?.horizonUrl ?? config.horizonUrl;

  return useQuery<StellarAccountData | null>({
    queryKey: ["stellarAccount", publicKey, horizonUrl],
    queryFn: async () => {
      if (!publicKey) return null;
      const server = new Horizon.Server(horizonUrl);
      const raw = await server.loadAccount(publicKey);
      return parseAccountResponse(raw);
    },
    enabled: !!publicKey && options?.enabled !== false,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    ...options,
  });
}
