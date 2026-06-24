/**
 * @file useAssetMetadata.ts
 * @description Hook for fetching asset metadata from stellar.toml files.
 * @package stellar-hooks
 */

import { useMemo } from "react";
import { useStellarAccount } from "./useStellarAccount";
import { useStellarToml } from "./useStellarToml";
import { asPublicKey } from "../types";

export interface AssetMetadata {
  code?: string;
  issuer?: string;
  name?: string;
  desc?: string;
  image?: string;
  [key: string]: unknown;
}

/**
 * @example
 * ```tsx
 * const {
 *   metadata,  // AssetMetadata | null — matched CURRENCIES entry from stellar.toml
 *   isLoading, // boolean
 *   error,     // Error | null
 * } = useAssetMetadata("USDC", "GISSUER...");
 *
 * // metadata.name  → human-readable asset name
 * // metadata.image → logo URL
 * // metadata.desc  → description
 * ```
 */
export interface UseAssetMetadataReturn {
  metadata: AssetMetadata | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Resolves asset issuer info via stellar.toml.
 * Composes useStellarAccount and useStellarToml to fetch the issuer's home_domain and metadata.
 */
export function useAssetMetadata(
  assetCode: string | null | undefined,
  assetIssuer: string | null | undefined
): UseAssetMetadataReturn {
  const {
    data: accountData,
    isLoading: isAccountLoading,
    error: accountError,
  } = useStellarAccount(assetIssuer ? asPublicKey(assetIssuer) : null, { enabled: !!assetIssuer });

  const homeDomain = accountData?.raw?.home_domain;
  const { data: tomlData, isLoading: isTomlLoading, error: tomlError } = useStellarToml(homeDomain);

  const metadata = useMemo(() => {
    if (!tomlData || !tomlData.CURRENCIES || !assetCode || !assetIssuer) return null;
    
    return tomlData.CURRENCIES.find((c) => c.code === assetCode && c.issuer === assetIssuer) || null;
  }, [tomlData, assetCode, assetIssuer]);

  return {
    metadata,
    isLoading: isAccountLoading || isTomlLoading,
    error: accountError || tomlError,
  };
}