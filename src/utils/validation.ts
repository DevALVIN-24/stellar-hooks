import { StrKey } from "@stellar/stellar-sdk";

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export function validatePublicKey(
  value: string | null | undefined,
  label = "publicKey"
): asserts value is string {
  if (!value || !StrKey.isValidEd25519PublicKey(value)) {
    throw new ValidationError(
      `Invalid ${label}: "${String(value)}" is not a valid Stellar public key (G...).`
    );
  }
}

export function validateContractId(
  value: string | null | undefined,
  label = "contractId"
): asserts value is string {
  if (!value || !StrKey.isValidContract(value)) {
    throw new ValidationError(
      `Invalid ${label}: "${String(value)}" is not a valid Stellar contract ID (C...).`
    );
  }
}

export function validateOptionalPublicKey(
  value: string | null | undefined,
  label = "publicKey"
): void {
  if (value != null && !StrKey.isValidEd25519PublicKey(value)) {
    throw new ValidationError(
      `Invalid ${label}: "${value}" is not a valid Stellar public key (G...).`
    );
  }
}

export function validateOptionalContractId(
  value: string | null | undefined,
  label = "contractId"
): void {
  if (value != null && !StrKey.isValidContract(value)) {
    throw new ValidationError(
      `Invalid ${label}: "${value}" is not a valid Stellar contract ID (C...).`
    );
  }
}
