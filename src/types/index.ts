import type { Horizon, rpc } from "@stellar/stellar-sdk";

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
  accountId: string;
  balances: StellarBalance[];
  sequence: string;
  subentryCount: number;
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
  assetCode?: string | undefined;
  assetIssuer?: string | undefined;
  balance: string;
  /** Parsed as a float for convenience */
  balanceFloat: number;
  buyingLiabilities: string;
  sellingLiabilities: string;
  limit?: string | undefined;
  isNative: boolean;
}

// ─── Wallet / Freighter ───────────────────────────────────────────────────────

export interface FreighterState {
  isInstalled: boolean;
  isConnected: boolean;
  publicKey: string | null;
  network: string | null;
  networkPassphrase: string | null;
  isLoading: boolean;
  error: Error | null;
}

export interface UseFreighterReturn extends FreighterState {
  connect: () => Promise<void>;
  disconnect: () => void;
  signTransaction: (xdr: string, opts?: SignTransactionOptions) => Promise<string>;
  signAuthEntry: (entryPreimageXdr: string) => Promise<string>;
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
  hash: string | null;
  result: TResult | null;
  error: Error | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

// ─── Soroban Contract ─────────────────────────────────────────────────────────

export interface ContractCallOptions {
  /** Soroban contract address (C...) */
  contractId: string;
  method: string;
  args?: unknown[];
  /** Fee in stroops. Defaults to 100 */
  fee?: number;
  /** Timeout in seconds. Defaults to 30 */
  timeoutSeconds?: number;
}

export interface UseContractCallReturn<TResult = unknown> extends TransactionState<TResult> {
  call: (overrides?: Partial<ContractCallOptions>) => Promise<TResult | null>;
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
  network?: StellarNetwork;
  /** Supply a full config when network === "custom" */
  customConfig?: NetworkConfig;
  children: React.ReactNode;
}

export interface StellarContextValue {
  config: NetworkConfig;
  network: StellarNetwork;
}
