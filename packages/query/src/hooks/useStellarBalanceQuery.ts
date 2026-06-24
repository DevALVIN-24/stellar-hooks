/**
 * @file useStellarBalanceQuery.ts
 * @description React Query hook for fetching Stellar account balances.
 * @package @stellar-hooks/query
 * @license MIT
 */

import { useQuery } from "@tanstack/react-query";
import { Horizon } from "@stellar/stellar-sdk";
import { useStellarContext, parseAccountResponse } from "stellar-hooks";
import type { StellarBalance } from "stellar-hooks";
import type { UseStellarBalanceQueryOptions, StellarBalanceQueryData } from "../types";

/**
 * React Query adapter that fetches Stellar account balances directly inside
 * `queryFn`. Returns parsed balances including convenient `xlmBalance` and
 * optional `assetBalance` lookups.
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useStellarBalanceQuery(publicKey, {
 *   assetCode: "USDC",
 *   assetIssuer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
 *   staleTime: 60_000,
 * });
 *
 * console.log(data?.xlmBalance?.balance);
 * console.log(data?.assetBalance?.balance);
 * ```
 */
export function useStellarBalanceQuery(
  publicKey: string | null | undefined,
  options?: UseStellarBalanceQueryOptions
) {
  const { config } = useStellarContext();
  const horizonUrl = options?.horizonUrl ?? config.horizonUrl;
  const { assetCode, assetIssuer, ...queryOptions } = options ?? {};

  return useQuery<StellarBalanceQueryData | null>({
    queryKey: ["stellarBalance", publicKey, horizonUrl, assetCode, assetIssuer],
    queryFn: async () => {
      if (!publicKey) return null;
      const server = new Horizon.Server(horizonUrl);
      const raw = await server.loadAccount(publicKey);
      const { balances } = parseAccountResponse(raw);

      const xlmBalance = balances.find((b: StellarBalance) => b.isNative) ?? null;
      const assetBalance = assetCode
        ? (balances.find(
            (b: StellarBalance) =>
              b.assetCode === assetCode &&
              (!assetIssuer || b.assetIssuer === assetIssuer)
          ) ?? null)
        : null;

      return { balances, xlmBalance, assetBalance };
    },
    enabled: !!publicKey && queryOptions.enabled !== false,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    ...queryOptions,
  });
}
