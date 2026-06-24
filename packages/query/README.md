# @stellar-hooks/query

Optional React Query adapter for [stellar-hooks](../). Wraps data-fetching hooks in `@tanstack/react-query` v5 `useQuery` / `useMutation` for caching, deduplication, and background refetch.

## Installation

```bash
npm install @stellar-hooks/query @tanstack/react-query stellar-hooks
```

Wrap your app with both providers:

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StellarProvider } from "stellar-hooks";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <StellarProvider network="testnet">
        <YourApp />
      </StellarProvider>
    </QueryClientProvider>
  );
}
```

---

## Hooks

### `useFreighterQuery`

Wraps `useFreighter`'s `connect` in `useMutation`. Exposes the full wallet state via `wallet`.

```tsx
import { useFreighterQuery } from "@stellar-hooks/query";

export function ConnectWallet() {
  const { connect, isPending, wallet } = useFreighterQuery();

  return (
    <button onClick={connect} disabled={isPending || wallet.isConnected}>
      {wallet.isConnected ? wallet.publicKey : "Connect Wallet"}
    </button>
  );
}
```

---

### `useStellarAccountQuery`

Fetches a full Stellar account via Horizon directly inside `queryFn`.

```tsx
import { useStellarAccountQuery } from "@stellar-hooks/query";

export function AccountInfo({ publicKey }: { publicKey: string }) {
  const { data, isLoading, error } = useStellarAccountQuery(publicKey, {
    staleTime: 60_000,       // 1 min
    refetchInterval: 5_000,  // background poll every 5 s
  });

  if (isLoading) return <p>Loading…</p>;
  if (error) return <p>Error: {error.message}</p>;

  return <p>Sequence: {data?.sequence}</p>;
}
```

---

### `useStellarBalanceQuery`

Fetches balances and surfaces `xlmBalance` / `assetBalance` helpers.

```tsx
import { useStellarBalanceQuery } from "@stellar-hooks/query";

export function Balance({ publicKey }: { publicKey: string }) {
  const { data, isLoading } = useStellarBalanceQuery(publicKey, {
    assetCode: "USDC",
    assetIssuer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
    staleTime: 60_000,
  });

  if (isLoading) return <p>Loading…</p>;

  return (
    <>
      <p>XLM: {data?.xlmBalance?.balance}</p>
      <p>USDC: {data?.assetBalance?.balance ?? "0"}</p>
    </>
  );
}
```

---

### `useLedgerEntryQuery`

Reads a raw Soroban ledger entry by its XDR key. Useful for reading persistent contract storage without a full contract call.

```tsx
import { xdr, Address } from "@stellar/stellar-sdk";
import { useLedgerEntryQuery } from "@stellar-hooks/query";

const key = xdr.LedgerKey.contractData(
  new xdr.LedgerKeyContractData({
    contract: new Address(CONTRACT_ID).toScAddress(),
    key: xdr.ScVal.scvSymbol("Counter"),
    durability: xdr.ContractDataDurability.persistent(),
  })
);

export function Counter() {
  const { data, isLoading } = useLedgerEntryQuery(key, {
    refetchInterval: 3_000,
  });

  const value = data ? scValToNative(data.val.contractData().val()) : null;
  return <p>Counter: {isLoading ? "…" : value}</p>;
}
```

---

## Cache Keys

| Hook | Query Key |
|------|-----------|
| `useStellarAccountQuery` | `["stellarAccount", publicKey, horizonUrl]` |
| `useStellarBalanceQuery` | `["stellarBalance", publicKey, horizonUrl, assetCode?, assetIssuer?]` |
| `useLedgerEntryQuery` | `["ledgerEntry", keyXdr, sorobanRpcUrl]` |

---

## Default Options

All query hooks default to:

| Option | Default |
|--------|---------|
| `staleTime` | 60 000 ms (1 min) |
| `gcTime` | 300 000 ms (5 min) |
| `enabled` | `true` when key is present |

All standard `@tanstack/react-query` v5 options (`refetchInterval`, `retry`, `select`, …) are forwarded.

---

## License

MIT
