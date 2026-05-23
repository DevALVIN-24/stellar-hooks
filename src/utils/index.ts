import { Horizon } from "@stellar/stellar-sdk";
import type { StellarBalance, StellarAccountData } from "../types";

/**
 * Parse a raw Horizon AccountResponse into the friendlier StellarAccountData shape.
 */
export function parseAccountResponse(
  raw: Horizon.AccountResponse
): StellarAccountData {
  const balances: StellarBalance[] = raw.balances.map((b) => {
    const isNative = b.asset_type === "native";
    return {
      assetType: b.asset_type,
      assetCode: "asset_code" in b ? b.asset_code : undefined,
      assetIssuer: "asset_issuer" in b ? b.asset_issuer : undefined,
      balance: b.balance,
      balanceFloat: parseFloat(b.balance),
      buyingLiabilities: "buying_liabilities" in b ? b.buying_liabilities : "0",
      sellingLiabilities: "selling_liabilities" in b ? b.selling_liabilities : "0",
      limit: "limit" in b ? b.limit : undefined,
      isNative,
    };
  });

  return {
    accountId: raw.account_id,
    balances,
    sequence: raw.sequence,
    subentryCount: raw.subentry_count,
    thresholds: {
      lowThreshold: raw.thresholds.low_threshold,
      medThreshold: raw.thresholds.med_threshold,
      highThreshold: raw.thresholds.high_threshold,
    },
    flags: {
      authRequired: raw.flags.auth_required,
      authRevocable: raw.flags.auth_revocable,
      authImmutable: raw.flags.auth_immutable,
      authClawbackEnabled: raw.flags.auth_clawback_enabled ?? false,
    },
    raw,
  };
}

/**
 * Clamp a polling interval between min and max ms with exponential back-off.
 */
export function backoff(attempt: number, baseMs = 1000, maxMs = 10000): number {
  return Math.min(baseMs * 2 ** attempt, maxMs);
}

/**
 * Sleep for `ms` milliseconds.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Type-safe assertion that a value is not null/undefined.
 */
export function assertDefined<T>(
  value: T | null | undefined,
  message: string
): asserts value is T {
  if (value == null) throw new Error(`[stellar-hooks] ${message}`);
}
