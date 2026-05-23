# stellar-hooks

[![CI](https://github.com/dark-princezz/stellar-hooks/actions/workflows/ci.yml/badge.svg)](https://github.com/dark-princezz/stellar-hooks/actions/workflows/ci.yml)

> React hooks for Stellar and Soroban. The `wagmi` you've been waiting for.

```bash
npm install stellar-hooks
```

`stellar-hooks` wires the [Stellar JS SDK v13](https://github.com/stellar/js-stellar-sdk) and the Freighter wallet API into a set of ergonomic React hooks so you can build Stellar dApps without copy-pasting the same boilerplate across 576 Wave repos.

---

## Quick start

```tsx
// main.tsx
import { StellarProvider } from "stellar-hooks";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StellarProvider network="testnet">
    <App />
  </StellarProvider>
);
```

```tsx
// App.tsx
import { useFreighter, useStellarBalance } from "stellar-hooks";

export function App() {
  const { isConnected, publicKey, connect } = useFreighter();
  const { xlmBalance } = useStellarBalance(publicKey);

  if (!isConnected) {
    return <button onClick={connect}>Connect Freighter</button>;
  }

  return (
    <p>
      {publicKey} · {xlmBalance?.balance ?? "..."} XLM
    </p>
  );
}
```

---

## Hooks

### `useFreighter()`

Connect to and interact with the [Freighter](https://freighter.app) browser extension wallet.

```ts
const {
  isInstalled,       // boolean — is Freighter installed?
  isConnected,       // boolean — has the user granted access?
  publicKey,         // string | null
  network,           // string | null  e.g. "TESTNET"
  networkPassphrase, // string | null
  isLoading,
  error,

  connect,           // () => Promise<void>
  disconnect,        // () => void
  signTransaction,   // (xdr: string, opts?) => Promise<string>
  signAuthEntry,     // (entryPreimageXdr: string) => Promise<string>
} = useFreighter();
```

---

### `useStellarAccount(publicKey, options?)`

Fetch (and optionally poll) a full Stellar account from Horizon.

```ts
const {
  data,           // StellarAccountData | null
  isLoading,
  error,
  lastFetchedAt,  // Date | null
  refetch,
} = useStellarAccount("G...", {
  enabled: true,         // default: true
  refetchInterval: 5000, // poll every 5 s; 0 = disabled (default)
});

// data.balances   → StellarBalance[]
// data.sequence   → string
// data.raw        → raw Horizon.AccountResponse
```

---

### `useStellarBalance(publicKey, options?)`

Convenience wrapper around `useStellarAccount` that surfaces the XLM balance at the top level.

```ts
const {
  balances,    // StellarBalance[]
  xlmBalance,  // StellarBalance | null  (the native XLM entry)
  isLoading,
  error,
  refetch,
} = useStellarBalance("G...");
```

---

### `useSorobanContract(options)`

Simulate → sign (via Freighter) → submit → poll a Soroban contract call. Full lifecycle in one hook.

```ts
const { call, status, result, hash, error, reset } = useSorobanContract({
  contractId: "CABC...XYZ",   // Soroban C... contract address
  method: "increment",
  args: [nativeToScVal(1, { type: "u32" })],
  fee: "100",                 // stroops (default: BASE_FEE)
  timeoutSeconds: 30,         // default: 30
});

// Statuses: "idle" | "building" | "signing" | "submitting" | "polling" | "success" | "error"
<button onClick={() => call()} disabled={status !== "idle"}>
  {status}
</button>
```

`result` contains the raw `xdr.ScVal` return value. Parse it with `scValToNative` from the SDK.

---

### `useTransaction(options?)`

Submit a pre-signed XDR and poll for confirmation. Useful when you sign outside React (e.g. hardware wallet, server-side).

```ts
const { submit, status, hash, isSuccess, isError, error, reset } = useTransaction({
  mode: "soroban",    // "soroban" (default) | "classic"
  timeoutSeconds: 60,
});

await submit(signedXdr);
```

---

### `useLedgerEntry(ledgerKey, options?)`

Read a raw Soroban ledger entry by its `xdr.LedgerKey` without constructing a contract call.

```ts
import { xdr, Address, Contract } from "@stellar/stellar-sdk";

const key = xdr.LedgerKey.contractData(
  new xdr.LedgerKeyContractData({
    contract: new Address(CONTRACT_ID).toScAddress(),
    key: xdr.ScVal.scvSymbol("Counter"),
    durability: xdr.ContractDataDurability.persistent(),
  })
);

const { data, isLoading, error, refetch } = useLedgerEntry(key, {
  refetchInterval: 3000,
});
```

---

## Provider

Wrap your app with `<StellarProvider>` to configure the network.

```tsx
// Testnet (default)
<StellarProvider network="testnet">...</StellarProvider>

// Mainnet
<StellarProvider network="mainnet">...</StellarProvider>

// Custom RPC
<StellarProvider
  network="custom"
  customConfig={{
    network: "custom",
    horizonUrl: "https://my-horizon.example.com",
    sorobanRpcUrl: "https://my-rpc.example.com",
    networkPassphrase: "My Network ; 2024",
  }}
>
  ...
</StellarProvider>
```

---

## Types

All types are exported and fully documented via JSDoc.

```ts
import type {
  StellarNetwork,
  NetworkConfig,
  StellarAccountData,
  StellarBalance,
  FreighterState,
  UseFreighterReturn,
  TransactionStatus,
  ContractCallOptions,
} from "stellar-hooks";
```

---

## Requirements

| Peer dependency | Version |
|---|---|
| react | ≥ 18 |
| react-dom | ≥ 18 |

The library ships with `@stellar/stellar-sdk` v13 and `@stellar/freighter-api` v2 as direct dependencies — you don't need to install them separately unless you need a different version.

---

## Contributing

1. `git clone https://github.com/YOUR_USERNAME/stellar-hooks`
2. `npm install`
3. `npm run dev` — builds in watch mode
4. Edit hooks in `src/hooks/`, types in `src/types/`
5. Open a PR

---

## Roadmap

- [ ] `usePayment()` — send XLM / SAT payments with one hook
- [ ] `useClaimableBalance()` — list and claim claimable balances
- [ ] `useContractEvents()` — subscribe to Soroban contract events via streaming
- [ ] `usePathPayment()` — strict send / receive path payment hook
- [ ] `useStellarToml()` — fetch and parse a domain's `stellar.toml`
- [ ] React Query / SWR adapter (optional peer dependency)

---

## License

MIT
