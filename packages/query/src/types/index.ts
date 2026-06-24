/**
 * @file index.ts
 * @description Type definitions for the @stellar-hooks/query package.
 * @package @stellar-hooks/query
 * @license MIT
 */

import type { UseMutationOptions, UseQueryOptions } from "@tanstack/react-query";
import type { StellarAccountData, StellarBalance, FreighterState } from "stellar-hooks";
import type { rpc, xdr } from "@stellar/stellar-sdk";

/**
 * Options for useFreighterQuery — extends useMutation options for the connect action.
 */
export interface UseFreighterQueryOptions
  extends Omit<UseMutationOptions<void, Error, void>, "mutationFn"> {}

/**
 * Options for useStellarAccountQuery.
 */
export interface UseStellarAccountQueryOptions
  extends Omit<UseQueryOptions<StellarAccountData | null>, "queryKey" | "queryFn"> {
  /** Horizon base URL override. Falls back to the StellarProvider config. */
  horizonUrl?: string;
}

/**
 * Options for useStellarBalanceQuery.
 */
export interface UseStellarBalanceQueryOptions
  extends Omit<UseQueryOptions<StellarBalanceQueryData | null>, "queryKey" | "queryFn"> {
  /** Optionally filter for a specific non-native asset. */
  assetCode?: string;
  assetIssuer?: string;
  /** Horizon base URL override. Falls back to the StellarProvider config. */
  horizonUrl?: string;
}

/** Shape returned in `data` by useStellarBalanceQuery. */
export interface StellarBalanceQueryData {
  balances: StellarBalance[];
  xlmBalance: StellarBalance | null;
  assetBalance: StellarBalance | null;
}

/**
 * Options for useLedgerEntryQuery.
 */
export interface UseLedgerEntryQueryOptions
  extends Omit<UseQueryOptions<rpc.Api.LedgerEntryResult | null>, "queryKey" | "queryFn"> {
  /** Soroban RPC URL override. Falls back to the StellarProvider config. */
  sorobanRpcUrl?: string;
}

/** Return value of useFreighterQuery — mutation state plus the full wallet state. */
export interface UseFreighterQueryReturn {
  /** Trigger the wallet connection. */
  connect: () => void;
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  error: Error | null;
  /** Full Freighter wallet state. */
  wallet: FreighterState & {
    signTransaction: (xdr: string, opts?: Record<string, unknown>) => Promise<string>;
    signAuthEntry: (entryPreimageXdr: string) => Promise<string>;
    signBlob: (blob: string, opts?: Record<string, unknown>) => Promise<string>;
    disconnect: () => void;
  };
}
