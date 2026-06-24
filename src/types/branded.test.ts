import { describe, it, expect } from "vitest";
import {
  asPublicKey,
  asContractId,
  asXdrString,
  asTxHash,
  asAssetIssuer,
  unsafeAsPublicKey,
  unsafeAsContractId,
  unsafeAsXdrString,
  unsafeAsTxHash,
  type StellarPublicKey,
  type StellarContractId,
  type StellarXdrString,
} from "./branded";

describe("asPublicKey", () => {
  it("accepts valid G-prefixed strkey", () => {
    const valid = "GAAZI4BCE7Y5L7S25K2LJKBJHW7X2UHLW4XY5R2DZPHFBUHE5PQ7L2UQ";
    expect(() => asPublicKey(valid)).not.toThrow();
    const branded = asPublicKey(valid);
    expect(typeof branded).toBe("string");
  });

  it("rejects invalid public keys", () => {
    expect(() => asPublicKey("")).toThrow();
    expect(() => asPublicKey("notakey")).toThrow();
    expect(() => asPublicKey("CABC")).toThrow(); // contract ID prefix
    expect(() => asPublicKey("GSHORT")).toThrow(); // too short
  });
});

describe("asContractId", () => {
  it("accepts valid C-prefixed strkey", () => {
    const valid = "CA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJUWDA";
    expect(() => asContractId(valid)).not.toThrow();
  });

  it("rejects invalid contract IDs", () => {
    expect(() => asContractId("")).toThrow();
    expect(() => asContractId("GAAZI4BCE7Y5L7S25K2LJKBJHW7X2UHLW4XY5R2DZPHFBUHE5PQ7L2UQ")).toThrow();
  });
});

describe("asXdrString", () => {
  it("accepts valid base64", () => {
    const valid = "AAAAAgAAAADg3G1hcmlzYmxhY2s=";
    expect(() => asXdrString(valid)).not.toThrow();
  });

  it("rejects invalid base64", () => {
    expect(() => asXdrString("not-valid-base64!!!")).toThrow();
    expect(() => asXdrString("abc")).toThrow(); // wrong length
  });
});

describe("asTxHash", () => {
  it("accepts valid 64-char hex", () => {
    const valid = "a".repeat(64);
    expect(() => asTxHash(valid)).not.toThrow();
  });

  it("rejects invalid hashes", () => {
    expect(() => asTxHash("")).toThrow();
    expect(() => asTxHash("abc")).toThrow();
    expect(() => asTxHash("G".repeat(64))).toThrow(); // not hex
  });
});

describe("unsafe casts", () => {
  it("do not validate", () => {
    const invalid = "totally-invalid";
    expect(() => unsafeAsPublicKey(invalid)).not.toThrow();
    expect(() => unsafeAsContractId(invalid)).not.toThrow();
    expect(() => unsafeAsXdrString(invalid)).not.toThrow();
    expect(() => unsafeAsTxHash(invalid)).not.toThrow();
  });
});

// Type-level tests (compile-time only)
describe("type safety", () => {
  it("branded types are not interchangeable", () => {
    const pk: StellarPublicKey = asPublicKey(
      "GAAZI4BCE7Y5L7S25K2LJKBJHW7X2UHLW4XY5R2DZPHFBUHE5PQ7L2UQ"
    );
    const cid: StellarContractId = asContractId(
      "CA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJUWDA"
    );

    // @ts-expect-error — StellarContractId is not assignable to StellarPublicKey
    const _shouldFail: StellarPublicKey = cid;

    // @ts-expect-error — StellarPublicKey is not assignable to StellarContractId
    const _shouldAlsoFail: StellarContractId = pk;

    expect(true).toBe(true); // runtime passes, types checked above
  });
});