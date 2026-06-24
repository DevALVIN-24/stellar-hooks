/**
 * Branded string types for Stellar identifiers.
 * Uses TypeScript's branding pattern for compile-time type safety
 * without any runtime overhead.
 */

// ─── Core Branding Utility ─────────────────────────────────────────────

/** Internal branding utility — never use directly */
type Brand<K, T> = K & { readonly __brand: T };

// ─── Branded Types ───────────────────────────────────────────────────────

/** A Stellar account public key (G-prefixed strkey, 56 chars) */
export type StellarPublicKey = Brand<string, "StellarPublicKey">;

/** A Soroban smart contract ID (C-prefixed strkey, 56 chars) */
export type StellarContractId = Brand<string, "StellarContractId">;

/** A base64-encoded XDR string */
export type StellarXdrString = Brand<string, "StellarXdrString">;

/** A Stellar transaction hash (hex string, 64 chars) */
export type StellarTxHash = Brand<string, "StellarTxHash">;

/** A Stellar asset issuer public key (G-prefixed strkey) */
export type StellarAssetIssuer = Brand<string, "StellarAssetIssuer">;

// ─── Validation Patterns ─────────────────────────────────────────────────

const PUBLIC_KEY_REGEX = /^G[A-Z2-7]{55}$/;
const CONTRACT_ID_REGEX = /^C[A-Z2-7]{55}$/;
const XDR_REGEX = /^[A-Za-z0-9+/]*={0,2}$/;
const TX_HASH_REGEX = /^[a-f0-9]{64}$/;

// ─── Factory Functions ───────────────────────────────────────────────────

/**
 * Validates and brands a string as a Stellar public key.
 * @throws {Error} if the string is not a valid G-prefixed strkey
 */
export function asPublicKey(value: string): StellarPublicKey {
  if (!PUBLIC_KEY_REGEX.test(value)) {
    throw new Error(
      `Invalid Stellar public key: "${value}". Expected G-prefixed strkey (56 chars).`
    );
  }
  return value as StellarPublicKey;
}

/**
 * Validates and brands a string as a Soroban contract ID.
 * @throws {Error} if the string is not a valid C-prefixed strkey
 */
export function asContractId(value: string): StellarContractId {
  if (!CONTRACT_ID_REGEX.test(value)) {
    throw new Error(
      `Invalid Stellar contract ID: "${value}". Expected C-prefixed strkey (56 chars).`
    );
  }
  return value as StellarContractId;
}

/**
 * Validates and brands a string as a base64-encoded XDR string.
 * @throws {Error} if the string is not valid base64
 */
export function asXdrString(value: string): StellarXdrString {
  if (!XDR_REGEX.test(value) || value.length % 4 !== 0) {
    throw new Error(
      `Invalid XDR string: not valid base64.`
    );
  }
  return value as StellarXdrString;
}

/**
 * Validates and brands a string as a Stellar transaction hash.
 * @throws {Error} if the string is not a valid 64-char hex string
 */
export function asTxHash(value: string): StellarTxHash {
  if (!TX_HASH_REGEX.test(value)) {
    throw new Error(
      `Invalid transaction hash: "${value}". Expected 64-character hex string.`
    );
  }
  return value as StellarTxHash;
}

/**
 * Validates and brands a string as a Stellar asset issuer.
 * Alias for asPublicKey — asset issuers are also G-prefixed strkeys.
 */
export function asAssetIssuer(value: string): StellarAssetIssuer {
  return asPublicKey(value) as unknown as StellarAssetIssuer;
}

// ─── Unsafe Casting (use sparingly) ────────────────────────────────────

/**
 * UNSAFE: Cast a string to StellarPublicKey without validation.
 * Only use when you're 100% sure the value is valid (e.g., from a trusted API).
 */
export function unsafeAsPublicKey(value: string): StellarPublicKey {
  return value as StellarPublicKey;
}

/** UNSAFE: Cast a string to StellarContractId without validation. */
export function unsafeAsContractId(value: string): StellarContractId {
  return value as StellarContractId;
}

/** UNSAFE: Cast a string to StellarXdrString without validation. */
export function unsafeAsXdrString(value: string): StellarXdrString {
  return value as StellarXdrString;
}

/** UNSAFE: Cast a string to StellarTxHash without validation. */
export function unsafeAsTxHash(value: string): StellarTxHash {
  return value as StellarTxHash;
}