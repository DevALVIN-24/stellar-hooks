# stellar-hooks

[![npm version](https://img.shields.io/badge/npm-v0.1.0-blue?style=flat-square)](https://www.npmjs.com/package/stellar-hooks)
[![license](https://img.shields.io/github/license/dark-princezz/stellar-hooks.svg?style=flat-square)](LICENSE)
[![bundle size](https://img.shields.io/badge/bundle%20size-12.5%20KB-blue?style=flat-square)](https://github.com/dark-princezz/stellar-hooks)


> React hooks for Stellar and Soroban. The `wagmi` you've been waiting for.


```bash
npm install stellar-hooks
```

`stellar-hooks` wires the [Stellar JS SDK v13](https://github.com/stellar/js-stellar-sdk) and the Freighter wallet API into a set of ergonomic React hooks so you can build Stellar dApps without copy-pasting the same boilerplate across repos.

---

## Features

- **Freighter Integration**: Seamlessly connect and interact with the Freighter wallet.
- **Horizon Data Fetching**: Easy access to account balances, offers, and more.
- **Soroban Support**: Call smart contracts with built-in simulation and auth handling.
- **Transaction Helpers**: Simplified submission and polling for both classic and Soroban.
- **Modular Adapters**: First-class support for React Query and SWR.
- **Type-Safe**: Written in TypeScript with full type definitions.

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

### `useNetwork()`

Read the active network configuration and switch networks at runtime from anywhere inside `<StellarProvider>`.

### `useFreighter()`

Connect to and interact with the [Freighter](https://freighter.app) browser extension wallet, including arbitrary data signing via `signBlob`.

### `useStellarAccount(publicKey)`

Fetch and subscribe to a Stellar account's data, including balances, sequence number, and thresholds.

### `useSorobanContract(options)`

Invoke a Soroban smart-contract method. Handles simulation, auth, submission, and status polling in one hook.

### `useTransaction(options)`

Submit a pre-signed transaction XDR and poll until it is confirmed. Works with both Soroban (RPC) and classic Stellar (Horizon) transactions.

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
  signBlob,          // (blob: string, opts?) => Promise<string>
} = useFreighter();
```

---

### `useNetwork()`

Read the active network configuration and switch networks at runtime. All values reflect the currently active network — including any network switch made via `switchNetwork`.

```ts
const {
  network,            // StellarNetwork — "testnet" | "mainnet" | "futurenet" | "custom"
  networkPassphrase,  // string — e.g. "Test SDF Network ; September 2015"
  horizonUrl,         // string — active Horizon REST API endpoint
  sorobanRpcUrl,      // string — active Soroban RPC endpoint
  config,             // NetworkConfig — full { network, horizonUrl, sorobanRpcUrl, networkPassphrase }
  switchNetwork,      // (network: StellarNetwork, customConfig?: CustomNetworkConfig) => void
} = useNetwork();
```

Switch networks at runtime (e.g. a settings UI):

```tsx
import { useNetwork } from "stellar-hooks";
import type { StellarNetwork } from "stellar-hooks";

function NetworkSwitcher() {
  const { network, switchNetwork } = useNetwork();

  return (
    <select
      value={network}
      onChange={(e) => switchNetwork(e.target.value as StellarNetwork)}
    >
      <option value="testnet">Testnet</option>
      <option value="mainnet">Mainnet</option>
      <option value="futurenet">Futurenet</option>
    </select>
  );
}
```

When switching to a custom network, pass the full `CustomNetworkConfig` as the second argument:

```ts
switchNetwork("custom", {
  network: "custom",
  horizonUrl: "https://my-horizon.example.com",
  sorobanRpcUrl: "https://my-rpc.example.com",
  networkPassphrase: "My Network ; 2024",
});
```

The selected network is persisted to `localStorage` and survives page reloads.

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
// data.subentryCount → number
// data.numSponsored  → number
// data.numSponsoring → number
// data.raw        → raw Horizon.AccountResponse
```

---

### `useStellarBalance(publicKey, options?)`

Convenience wrapper around `useStellarAccount` that surfaces the XLM balance and optionally a specific asset balance.

```ts
const {
  balances,     // StellarBalance[]
  xlmBalance,   // StellarBalance | null  (the native XLM entry)
  assetBalance, // StellarBalance | null  (the specific asset requested, if any)
  isLoading,
  error,
  refetch,
} = useStellarBalance("G...", { code: "USDC", issuer: "G..." });
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

You may also pass a pre-configured `rpc.Server` instance via the `sorobanRpcServer` option to reuse an existing connection or custom transport:

```ts
const { call, status } = useSorobanContract({
  contractId: "CABC...XYZ",
  method: "hello",
  args: [nativeToScVal("world")],
  sorobanRpcServer: myCustomServer,
});
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

### `usePayment(options)`

Build, sign, and submit a classic Stellar payment (native XLM or any Stellar asset) via Freighter in one hook.

```ts
const {
  submit,    // () => Promise<void> — build, sign, and submit the payment
  status,    // "idle" | "submitting" | "polling" | "success" | "error"
  hash,      // string | null — transaction hash on success
  isLoading, // boolean
  isSuccess, // boolean
  isError,   // boolean
  error,     // Error | null
  reset,     // () => void
} = usePayment({
  destination: "GBXXX...",
  asset: { type: "native" },        // XLM
  // asset: { type: "credit", code: "USDC", issuer: "G..." }, // any asset
  amount: "10",
  memo: "Thanks!",                  // optional, max 28 bytes
  fee: 100,                         // optional, stroops (default: 100)
  timeoutSeconds: 60,               // optional (default: 60)
  onSuccess: (hash) => console.log("Sent!", hash),
  onError:   (err)  => console.error(err),
});

return <button onClick={submit} disabled={isLoading}>Send XLM</button>;
```

---

## Provider

Wrap your app (or the portion that needs Stellar) with `<StellarProvider>` to configure the network. Every hook that reads blockchain data consumes endpoint configuration from this provider.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `network` | `StellarNetwork` | `"testnet"` | The network to connect to. One of `"testnet"`, `"mainnet"`, `"futurenet"`, or `"custom"`. |
| `customConfig` | `CustomNetworkConfig` | — | Required when `network` is `"custom"`. Supplies Horizon URL, Soroban RPC URL, and the network passphrase for your deployment. |
| `children` | `React.ReactNode` | — | The component tree that will have access to Stellar context. |

### Built-in network presets

| Network | Horizon URL | Soroban RPC URL | Network Passphrase |
|---------|-------------|-----------------|-------------------|
| `testnet` | `https://horizon-testnet.stellar.org` | `https://soroban-testnet.stellar.org` | `Test SDF Network ; September 2015` |
| `mainnet` | `https://horizon.stellar.org` | `https://mainnet.sorobanrpc.com` | `Public Global Stellar Network ; September 2015` |
| `futurenet` | `https://horizon-futurenet.stellar.org` | `https://rpc-futurenet.stellar.org` | `Test SDF Future Network ; October 2022` |

These presets are also exported as `NETWORK_CONFIGS` if you need them outside React:

```ts
import { NETWORK_CONFIGS } from "stellar-hooks";

const { horizonUrl } = NETWORK_CONFIGS.mainnet;
```

### Usage examples

```tsx
// Testnet (default)
<StellarProvider network="testnet">
  <App />
</StellarProvider>

// Mainnet
<StellarProvider network="mainnet">
  <App />
</StellarProvider>

// Futurenet
<StellarProvider network="futurenet">
  <App />
</StellarProvider>

// Custom / self-hosted network
<StellarProvider
  network="custom"
  customConfig={{
    network: "custom",
    horizonUrl: "https://my-horizon.example.com",
    sorobanRpcUrl: "https://my-rpc.example.com",
    networkPassphrase: "My Network ; 2024",
  }}
>
  <App />
</StellarProvider>
```

### `CustomNetworkConfig`

Use this interface when connecting to a private or self-hosted Stellar network.

| Field | Type | Description |
|-------|------|-------------|
| `network` | `"custom"` | Must be `"custom"`. |
| `horizonUrl` | `string` | Horizon REST API base URL for this network. |
| `sorobanRpcUrl` | `string` | Soroban RPC endpoint for contract simulation and submission. |
| `networkPassphrase` | `string` | Network passphrase used when signing transactions. |

### Network persistence

`<StellarProvider>` automatically persists the active network in `localStorage` under the keys `stellar-hooks:network` and `stellar-hooks:custom-config`. On subsequent page loads the persisted choice is restored, overriding the `network` prop. To switch networks at runtime and persist the change, use [`useNetwork().switchNetwork`](#usenetwork).

---

## Types

All types are exported and fully documented via JSDoc.

```ts
import type {
  StellarNetwork,
  NetworkConfig,
  CustomNetworkConfig,
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
6. Run `npm run changeset` to create a changeset note for your change.
7. If your PR includes code changes, run `npm run build` before opening the PR.

Please review our Contributing Guide and Code of Conduct for more details before opening a pull request.

---

## Release process

This repository uses Changesets for automated changelog generation, version bumps, and npm publishing.

- Use `npm run changeset` to add a release note to your PR.
- After a changeset is merged into `main`, the GitHub Actions release workflow will publish the package automatically.
- To enable automated publishing, add `NPM_TOKEN` to repository secrets.

---

## Roadmap

- [x] `usePayment()` — send XLM / SAT payments with one hook
- [x] `useClaimableBalance()` — list and claim claimable balances
- [x] `useContractEvents()` — subscribe to Soroban contract events via streaming
- [x] `usePathPayment()` — strict send / receive path payment hook
- [ ] `useStellarToml()` — fetch and parse a domain's `stellar.toml`
- [x] `useStellarToml()` — fetch and parse a domain's `stellar.toml`
- [ ] React Query / SWR adapter (optional peer dependency)

---

## FAQ

### Which Stellar networks are supported?

`testnet` (default), `mainnet`, `futurenet`, and any custom network via the `custom` mode with a `customConfig` prop on `<StellarProvider>`.

### Do I need to install `@stellar/stellar-sdk` separately?

No — it ships as a direct dependency. You only need to install it separately if you require a version different from the bundled one.

### Do I need Freighter to use these hooks?

Most hooks that interact with user accounts (`useFreighter`, `useSorobanContract`, `useStellarBalance`, etc.) rely on a Freighter-connected wallet. `useStellarAccount` and `useLedgerEntry` are read-only and work without a wallet.

### Can I use these hooks with React Native?

`useFreighter` depends on the Freighter browser extension API, so it works in web environments only. The other hooks should work anywhere you can run `@stellar/stellar-sdk`.

### What is the difference between `useStellarAccount` and `useStellarBalance`?

`useStellarBalance` is a lightweight wrapper around `useStellarAccount` that surfaces the native XLM balance at the top level for convenience.

### How do I poll for account or ledger changes?

Both `useStellarAccount` and `useLedgerEntry` accept a `refetchInterval` option (in ms). Set it to `5000` to poll every 5 seconds, or `0` (default) to disable polling.

### Can I use these hooks without a `<StellarProvider>`?

No — the hooks consume configuration from the provider context. Wrap your app with `<StellarProvider>` at the root.

---

## License

MIT
