/**
 * @file index.ts
 * @description Main entry point for stellar-hooks library.
 * @package stellar-hooks
 * @license MIT
 */

// Provider & context
export { StellarProvider, useStellarContext } from "./context";

// Hooks
export { useNetwork } from "./hooks/useNetwork";
export { useFreighter } from "./hooks/useFreighter";
export { useStellarAccount } from "./hooks/useStellarAccount";
export { useStellarBalance } from "./hooks/useStellarBalance";
export { useSorobanContract } from "./hooks/useSorobanContract";
export { useTransaction } from "./hooks/useTransaction";
export { useLedgerEntry } from "./hooks/useLedgerEntry";
export { useStellarToml } from "./hooks/useStellarToml";
export { useAssetMetadata } from "./hooks/useAssetMetadata";
export { useStellarOffers } from "./hooks/useStellarOffers";
export { useEffects } from "./hooks/useEffects";
export { usePayment } from "./hooks/usePayment";
export type {
  PaymentAsset,
  UsePaymentOptions,
  UsePaymentReturn,
} from "./hooks/usePayment";
export { usePathPayment } from "./hooks/usePathPayment";
export type {
  PathPaymentAsset,
  UsePathPaymentOptions,
  UsePathPaymentReturn,
} from "./hooks/usePathPayment";

export { useSorobanTokenBalance } from "./hooks/useSorobanTokenBalance";
export type {
  SorobanTokenBalanceState,
  UseSorobanTokenBalanceOptions,
} from "./hooks/useSorobanTokenBalance";

// Types
export type {
  // Network
  StellarNetwork,
  NetworkConfig,
  CustomNetworkConfig,
  // Account
  StellarAccountData,
  StellarBalance,
  // Wallet
  FreighterState,
  UseFreighterReturn,
  SignTransactionOptions,
  // Transactions
  TransactionStatus,
  TransactionState,
  // Contract
  ContractCallOptions,
  UseContractCallReturn,
  // Ledger
  LedgerEntryState,
  // Provider
  StellarProviderProps,
  StellarContextValue,
} from "./types";

// Hook-specific Types
export type { StellarTomlData, UseStellarTomlReturn } from "./hooks/useStellarToml";
export type { AssetMetadata, UseAssetMetadataReturn } from "./hooks/useAssetMetadata";
export type { UseStellarOffersOptions, UseStellarOffersReturn } from "./hooks/useStellarOffers";
export type { UseEffectsOptions, UseEffectsReturn } from "./hooks/useEffects";

// Network presets (useful for custom configs)
export { NETWORK_CONFIGS } from "./types";

// Utilities
export { parseAccountResponse, getCache, setCache } from "./utils";
