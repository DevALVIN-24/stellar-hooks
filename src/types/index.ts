/**
 * @file index.ts
 * @description Common type definitions for the stellar-hooks library.
 * @package stellar-hooks
 * @license MIT
 */

import type { Horizon } from "@stellar/stellar-sdk";
import type * as rpc from "@stellar/stellar-sdk/rpc";

// ─── Network ──────────────────────────────────────────────────────────────────

export type StellarNetwork = "mainnet" | "testnet" | "futurenet" | "custom";

export interface NetworkConfig {
  network: StellarNetwork;
  /** Horizon REST API endpoint */
  horizonUrl: string;
  /** Soroban RPC endpoint */
  sorobanRpcUrl: string;
  /** Network passphrase */
  networkPassphrase: string;
}

export {
  // Branded types
  type StellarPublicKey,
  type StellarContractId,
  type StellarXdrString,
  type StellarTxHash,
  type StellarAssetIssuer,
  
  // Factory functions
  asPublicKey,
  asContractId,
  asXdrString,
  asTxHash,
  asAssetIssuer,
  
  // Unsafe casts
  unsafeAsPublicKey,
  unsafeAsContractId,
  unsafeAsXdrString,
  unsafeAsTxHash,
  unsafeAsAssetIssuer,
} from "./branded";

/**
 * Endpoint configuration for a private or self-hosted Stellar network.
 *
 * Pass this object to the `customConfig` prop when {@link StellarProviderProps.network}
 * is `"custom"`.
 *
 * @example
 * ```tsx
 * <StellarProvider
 *   network="custom"
 *   customConfig={{
 *     network: "custom",
 *     horizonUrl: "https://my-horizon.example.com",
 *     sorobanRpcUrl: "https://my-rpc.example.com",
 *     networkPassphrase: "My Network ; 2024",
 *   }}
 * >
 *   ...
 * </StellarProvider>
 * ```
 */
export interface CustomNetworkConfig {
  /** Must be `"custom"` when supplying a custom network configuration. */
  network: "custom";
  /**
   * Horizon REST API base URL for this network.
   * @example "https://my-horizon.example.com"
   */
  horizonUrl: string;
  /**
   * Soroban RPC endpoint URL for contract simulation and submission.
   * @example "https://my-rpc.example.com"
   */
  sorobanRpcUrl: string;
  /**
   * Stellar network passphrase used when signing transactions.
   * @example "My Network ; 2024"
   */
  networkPassphrase: string;
}

export const NETWORK_CONFIGS: Record<Exclude<StellarNetwork, "custom">, NetworkConfig> = {
  mainnet: {
    network: "mainnet",
    horizonUrl: "https://horizon.stellar.org",
    sorobanRpcUrl: "https://mainnet.sorobanrpc.com",
    networkPassphrase: "Public Global Stellar Network ; September 2015",
  },
  testnet: {
    network: "testnet",
    horizonUrl: "https://horizon-testnet.stellar.org",
    sorobanRpcUrl: "https://soroban-testnet.stellar.org",
    networkPassphrase: "Test SDF Network ; September 2015",
  },
  futurenet: {
    network: "futurenet",
    horizonUrl: "https://horizon-futurenet.stellar.org",
    sorobanRpcUrl: "https://rpc-futurenet.stellar.org",
    networkPassphrase: "Test SDF Future Network ; October 2022",
  },
};

// ─── Account ──────────────────────────────────────────────────────────────────

export interface StellarAccountData {
  accountId: StellarPublicKey;
  balances: StellarBalance[];
  sequence: string;
  subentryCount: number;
  numSponsored: number;
  numSponsoring: number;
  thresholds: {
    lowThreshold: number;
    medThreshold: number;
    highThreshold: number;
  };
  flags: {
    authRequired: boolean;
    authRevocable: boolean;
    authImmutable: boolean;
    authClawbackEnabled: boolean;
  };
  raw: Horizon.AccountResponse;
}

export interface StellarBalance {
  assetType: string;
  assetCode?: string;
  assetIssuer?: StellarAssetIssuer;
  balance: string;
  /** Parsed as a float for convenience */
  balanceFloat: number;
  buyingLiabilities: string;
  sellingLiabilities: string;
  limit?: string;
  isNative: boolean;
}

// ─── Wallet / Freighter ───────────────────────────────────────────────────────

export interface FreighterState {
  isInstalled: boolean;
  isConnected: boolean;
  publicKey: StellarPublicKey | null;
  network: string | null;
  networkPassphrase: string | null;
  isLoading: boolean;
  error: Error | null;
}

export interface UseFreighterReturn extends FreighterState {
  connect: () => Promise<void>;
  disconnect: () => void;
  signTransaction: (xdr: StellarXdrString, opts?: SignTransactionOptions) => Promise<StellarXdrString>;
  signAuthEntry: (entryPreimageXdr: StellarXdrString) => Promise<StellarXdrString>;
  signBlob: (blob: string, opts?: { accountToSign?: string }) => Promise<string>;
}

export interface SignTransactionOptions {
  networkPassphrase?: string;
  address?: string;
  submit?: boolean;
  submitUrl?: string;
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export type TransactionStatus =
  | "idle"
  | "building"
  | "signing"
  | "submitting"
  | "polling"
  | "success"
  | "error";

export interface TransactionState<TResult = unknown> {
  status: TransactionStatus;
  hash: StellarTxHash | null;
  result: TResult | null;
  error: Error | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

// ─── Soroban Contract ─────────────────────────────────────────────────────────

export interface ContractCallOptions<TResult = any> {
  /** Soroban contract address (C...) */
  contractId: StellarContractId;
  method: string;
  args?: unknown[];
  /** Fee in stroops. Defaults to 100 */
  fee?: number;
  /** Timeout in seconds. Defaults to 30 */
  timeoutSeconds?: number;
  /** Custom Soroban RPC server instance. If not provided, one is created from the provider config. */
  sorobanRpcServer?: rpc.Server;
  /** Callback fired when the transaction is successfully confirmed. */
  onSuccess?: (result: TResult) => void;
  /** Callback fired when the transaction fails or an error occurs. */
  onError?: (error: Error) => void;
  /**
   * Optional function to parse the raw xdr.ScVal result to your desired TResult type.
   * If not provided, the raw xdr.ScVal is returned (or tx hash as fallback).
   */
  parseResult?: (scVal: any) => TResult;
}

export interface UseContractCallReturn<TResult = unknown>
  extends TransactionState<TResult> {
  /**
   * Execute the contract call (Simulation -> Signing -> Submission -> Polling).
   */
  call: (
    overrides?: Partial<Omit<ContractCallOptions<TResult>, "contractId">>
  ) => Promise<TResult | null>;
  /**
   * Perform a simulation-only call to read contract state without submitting a transaction.
   * Updates the hook's `result` and `status` upon success.
   */
  query: (
    overrides?: Partial<Omit<ContractCallOptions<TResult>, "contractId">>
  ) => Promise<TResult | null>;
  /**
   * Perform an isolated simulation of the contract call.
   * Returns the raw RPC simulation response including footprint, resource usage, and results.
   * Does not sign or submit a transaction.
   */
  simulate: (
    overrides?: Partial<Omit<ContractCallOptions<TResult>, "contractId">>
  ) => Promise<rpc.Api.SimulateTransactionResponse>;
  reset: () => void;
}

// ─── Ledger Entry ─────────────────────────────────────────────────────────────

export interface LedgerEntryState {
  data: rpc.Api.LedgerEntryResult | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  lastFetchedAt: Date | null;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export interface StellarProviderProps {
  /** Built-in preset (`testnet`, `mainnet`, `futurenet`) or `"custom"` for a private network. @default "testnet" */
  network?: StellarNetwork;
  /**
   * Required when `network` is `"custom"`. Describes Horizon, Soroban RPC, and the
   * network passphrase for your deployment.
   */
  customConfig?: CustomNetworkConfig;
  children: React.ReactNode;
}

export interface StellarContextValue {
  config: NetworkConfig;
  network: StellarNetwork;
}

// ─── WalletConnect v2 ─────────────────────────────────────────────────────────

/** Stellar CAIP-2 chain IDs for WalletConnect namespaces. */
export type WalletConnectChain = "stellar:pubnet" | "stellar:testnet";

/** Init options for useWalletConnect. projectId is required (Reown/WalletConnect dashboard). */
export interface WalletConnectOptions {
  /** WalletConnect / Reown project ID from https://cloud.reown.com */
  projectId: string;
  /** App metadata shown in the wallet during connection. */
  metadata: {
    name: string;
    description: string;
    url: string;
    icons: string[];
  };
  /** Stellar chain to request. Defaults to "stellar:testnet". */
  chain?: WalletConnectChain;
  /** Relay URL. Defaults to wss://relay.walletconnect.com */
  relayUrl?: string;
}

export interface WalletConnectState {
  /** Connected Stellar public key, null when not connected. */
  publicKey: string | null;
  isConnected: boolean;
  /** True while connect() is in-flight (awaiting wallet approval). */
  isConnecting: boolean;
  /** WalletConnect pairing URI — show as QR code or deep-link. */
  uri: string | null;
  error: Error | null;
}

export interface UseWalletConnectReturn extends WalletConnectState {
  /**
   * Initiate a WalletConnect session. Resolves once the wallet approves.
   * Use the `uri` state to display the QR code/deep-link while awaiting approval.
   */
  connect: () => Promise<string | null>;
  /** Disconnect and delete the active WalletConnect session. */
  disconnect: () => Promise<void>;
  /** Sign a Stellar transaction XDR via the connected wallet. */
  signTransaction: (
    xdr: string,
    opts?: { networkPassphrase?: string }
  ) => Promise<string>;
}