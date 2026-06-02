# @stellar-hooks/swr

SWR adapter for [stellar-hooks](https://github.com/dark-princezz/stellar-hooks) — use Stellar and Soroban React hooks with [SWR](https://swr.vercel.app) caching, revalidation, and deduplication.

## Why?

The core `stellar-hooks` library manages its own fetch/cache lifecycle with `useReducer` and `useEffect`. If your project already uses SWR, this adapter lets you:

- **Deduplicate requests** — multiple components fetching the same account share a single in-flight request.
- **Cache across mounts** — navigating away and back serves stale data instantly while revalidating in the background.
- **Use SWR features** — `refreshInterval`, `revalidateOnFocus`, `mutate()`, and more work out of the box.

## Install

```bash
npm install @stellar-hooks/swr stellar-hooks swr
# or
pnpm add @stellar-hooks/swr stellar-hooks swr
```

> `react`, `react-dom`, `swr`, and `stellar-hooks` are **peer dependencies**.

## Quick start

```tsx
import { SWRConfig } from "swr";
import {
  StellarProvider,
  useStellarAccount,
  useStellarBalance,
  useFreighter,
} from "@stellar-hooks/swr";

function App() {
  return (
    <StellarProvider network="testnet">
      <SWRConfig value={{ refreshInterval: 10000 }}>
        <Wallet />
      </SWRConfig>
    </StellarProvider>
  );
}

function Wallet() {
  const { publicKey, connect, isConnected } = useFreighter();
  const { data: account, isLoading } = useStellarAccount(publicKey);
  const { xlmBalance } = useStellarBalance(publicKey);

  if (!isConnected) return <button onClick={connect}>Connect</button>;
  if (isLoading) return <p>Loading…</p>;

  return (
    <div>
      <p>Account: {account?.accountId}</p>
      <p>XLM: {xlmBalance?.balance}</p>
    </div>
  );
}
```

## Hooks

### Read hooks (SWR-powered)

These hooks replace the core library's manual state management with SWR. Each returns the standard SWR response (`data`, `error`, `isLoading`, `isValidating`, `mutate`).

| Hook | Description |
|------|-------------|
| `useStellarAccount(publicKey, options?)` | Fetch account data from Horizon |
| `useStellarBalance(publicKey, asset?, options?)` | Convenience wrapper with `xlmBalance` and `assetBalance` |
| `useStellarOffers(publicKey, options?)` | Fetch open offers from Horizon |
| `useStellarToml(domain, options?)` | Fetch & parse a domain's stellar.toml |
| `useLedgerEntry(ledgerKey, options?)` | Read a Soroban ledger entry |
| `useContractEvents(options)` | Fetch Soroban contract events |
| `useClaimableBalances(publicKey, options?)` | Fetch claimable balances |
| `useAssetMetadata(assetCode, assetIssuer)` | Resolve asset metadata via stellar.toml |

All read hooks accept SWR configuration options (`refreshInterval`, `revalidateOnFocus`, `dedupingInterval`, etc.) as part of their options object.

### Mutation hooks (re-exported from stellar-hooks)

These imperative hooks don't benefit from SWR's cache model and are re-exported directly for convenience:

- `useFreighter()` — wallet connection
- `useSorobanContract()` — smart contract calls
- `useTransaction()` — submit pre-signed XDR
- `usePayment()` — classic payments
- `usePathPayment()` — path payments

## SWR configuration

Pass SWR options through each hook's options parameter or use `<SWRConfig>` for global defaults:

```tsx
// Per-hook polling
const { data } = useStellarAccount(publicKey, {
  refreshInterval: 5000,
  revalidateOnFocus: true,
});

// Contract events with polling
const { data: events } = useContractEvents({
  contractId: "CXXX...",
  refreshInterval: 3000,
});

// Global config
<SWRConfig value={{ dedupingInterval: 5000, revalidateOnFocus: false }}>
  <App />
</SWRConfig>
```

## Manual revalidation

Every SWR hook returns a `mutate` function for manual cache invalidation:

```tsx
const { data, mutate } = useStellarAccount(publicKey);

// After a transaction, refresh the account
async function handleTransfer() {
  await submitPayment();
  await mutate(); // revalidate account data
}
```

## License

MIT
