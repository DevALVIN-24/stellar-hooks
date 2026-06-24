/**
 * @file useLedgerEntryQuery.ts
 * @description React Query hook for reading raw Soroban ledger entries.
 * @package @stellar-hooks/query
 * @license MIT
 */

import { useQuery } from "@tanstack/react-query";
import { rpc, xdr } from "@stellar/stellar-sdk";
import { useStellarContext } from "stellar-hooks";
import type { UseLedgerEntryQueryOptions } from "../types";

/**
 * React Query adapter for reading a raw Soroban ledger entry by its XDR key.
 * Fetches directly inside `queryFn` so React Query controls caching and
 * background refetch.
 *
 * @example
 * ```tsx
 * const key = xdr.LedgerKey.contractData(
 *   new xdr.LedgerKeyContractData({
 *     contract: new Address(CONTRACT_ID).toScAddress(),
 *     key: xdr.ScVal.scvSymbol("Counter"),
 *     durability: xdr.ContractDataDurability.persistent(),
 *   })
 * );
 *
 * const { data, isLoading } = useLedgerEntryQuery(key, {
 *   refetchInterval: 3_000,
 * });
 *
 * const value = data ? scValToNative(data.val.contractData().val()) : null;
 * ```
 */
export function useLedgerEntryQuery(
  ledgerKey: xdr.LedgerKey | null | undefined,
  options?: UseLedgerEntryQueryOptions
) {
  const { config } = useStellarContext();
  const sorobanRpcUrl = options?.sorobanRpcUrl ?? config.sorobanRpcUrl;

  // Stable serialisation for the cache key
  const keyXdr = ledgerKey ? ledgerKey.toXDR("base64") : null;

  return useQuery<rpc.Api.LedgerEntryResult | null>({
    queryKey: ["ledgerEntry", keyXdr, sorobanRpcUrl],
    queryFn: async () => {
      if (!ledgerKey) return null;
      const server = new rpc.Server(sorobanRpcUrl);
      const result = await server.getLedgerEntries(ledgerKey);
      return result.entries[0] ?? null;
    },
    enabled: !!ledgerKey && options?.enabled !== false,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    ...options,
  });
}
