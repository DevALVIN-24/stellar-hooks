import { expectType, expectError } from "tsd";
import {
  asPublicKey,
  asContractId,
  asXdrString,
  type StellarPublicKey,
  type StellarContractId,
  type StellarXdrString,
} from "./branded";

// ✅ Valid: factory returns branded type
expectType<StellarPublicKey>(
  asPublicKey("GAAZI4BCE7Y5L7S25K2LJKBJHW7X2UHLW4XY5R2DZPHFBUHE5PQ7L2UQ")
);

expectType<StellarContractId>(
  asContractId("CA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJUWDA")
);

expectType<StellarXdrString>(asXdrString("AAAAAg=="));

// ❌ Error: branded types are not interchangeable
expectError<StellarPublicKey>(
  asContractId("CA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJUWDA")
);

expectError<StellarContractId>(
  asPublicKey("GAAZI4BCE7Y5L7S25K2LJKBJHW7X2UHLW4XY5R2DZPHFBUHE5PQ7L2UQ")
);

// ❌ Error: plain string is not assignable to branded type
const plainString = "GAAZI4BCE7Y5L7S25K2LJKBJHW7X2UHLW4XY5R2DZPHFBUHE5PQ7L2UQ";
expectError<StellarPublicKey>(plainString);