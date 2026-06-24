/**
 * @file useStellarBalance.ts
 * @description Hook for fetching Stellar account balances.
 * @package stellar-hooks
 * @license MIT
 */

import { useMemo } from "react";
import { useStellarAccount, type UseStellarAccountOptions } from "./useStellarAccount";
import type { StellarBalance, StellarAccountData, StellarPublicKey } from "../types";

export interface UseStellarBalanceReturn {
  balances: StellarBalance[];
  xlmBalance: StellarBalance | null;
  assetBalance: StellarBalance | null;
  data: StellarAccountData | null;
  isLoading: boolean;
  error: Error | null;
  lastFetchedAt: Date | null;
  refetch: () => Promise<void>;
}

/**
 * Convenience wrapper around useStellarAccount that surfaces the native XLM balance
 * and optionally a specific asset balance.
 *
 * @param {StellarPublicKey | null | undefined} publicKey - The public key of the account to fetch.
 * @param {{ code: string; issuer: string } | UseStellarAccountOptions} [assetOrOptions] - Specific asset to find, or configuration options.
 * @param {UseStellarAccountOptions} [options] - Configuration options (if asset is provided as 2nd arg).
 * @returns {UseStellarBalanceReturn}
 *
 * @example
 * ```tsx
 * const { xlmBalance, isLoading } = useStellarBalance(publicKey);
 * return <p>Balance: {xlmBalance?.balance ?? "0"} XLM</p>;
 * ```
 *
 * @example
 * ```tsx
 * const { assetBalance } = useStellarBalance(publicKey, { code: "USDC", issuer: "G..." });
 * return <p>USDC Balance: {assetBalance?.balance ?? "0"}</p>;
 * ```
 */
export function useStellarBalance(
  publicKey: StellarPublicKey | null | undefined,
  assetOrOptions?: { code: string; issuer: string } | UseStellarAccountOptions | null,
  options?: UseStellarAccountOptions
): UseStellarBalanceReturn {
  const isAsset =
    !!assetOrOptions &&
    typeof assetOrOptions === "object" &&
    "code" in assetOrOptions &&
    "issuer" in assetOrOptions;

  const asset = isAsset ? (assetOrOptions as { code: string; issuer: string }) : null;
  const accountOptions = isAsset ? options : (assetOrOptions as UseStellarAccountOptions);

  const { data: account, isLoading, error, lastFetchedAt, refetch } = useStellarAccount(
    publicKey,
    accountOptions
  );

  const balances = useMemo(() => account?.balances ?? [], [account?.balances]);
  const xlmBalance = useMemo(
    () => balances.find((b) => b.isNative) ?? null,
    [balances]
  );

  const assetBalance = useMemo(() => {
    if (!asset) return null;
    return (
      balances.find((b) => b.assetCode === asset.code && b.assetIssuer === asset.issuer) ?? null
    );
  }, [balances, asset?.code, asset?.issuer]);

  return {
    balances,
    xlmBalance,
    assetBalance,
    data: account,
    isLoading,
    error,
    lastFetchedAt,
    refetch,
  };
}