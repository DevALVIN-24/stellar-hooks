# useLedgerEntry

Read a raw Soroban ledger entry by its XDR key without constructing a full contract call.

## Overview

Lower-level hook for reading persistent or temporary contract data, account entries, or any ledger state via Soroban RPC.

## Import

```tsx
import { useLedgerEntry } from "stellar-hooks";
```

## Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `ledgerKey` | `xdr.LedgerKey \| null \| undefined` | Yes | XDR ledger key to query |
| `options` | `UseLedgerEntryOptions` | No | Configuration options |

### Options

| Option | Type | Default | Description |
|---|---|---|---|
| `enabled` | `boolean` | `true` | Whether to fetch automatically |
| `refetchInterval` | `number` | `0` | Polling interval in milliseconds |
| `cacheTTL` | `number` | `60000` | Cache time-to-live (1 minute) |

## Return Value

| Property | Type | Description |
|---|---|---|---|
| `data` | `rpc.Api.LedgerEntryResult \| null` | Raw ledger entry result |
| `isLoading` | `boolean` | Whether fetch is in progress |
| `error` | `Error \| null` | Any error |
| `lastFetchedAt` | `Date \| null` | Last fetch timestamp |
| `refetch` | `() => Promise<void>` | Manually refetch |

## Basic Example

```tsx
import { useLedgerEntry } from "stellar-hooks";
import { xdr, Address, scValToNative } from "@stellar/stellar-sdk";

const CONTRACT_ID = "CABC...XYZ";

// Build the ledger key for a persistent "Counter" entry
const key = xdr.LedgerKey.contractData(
  new xdr.LedgerKeyContractData({
    contract: new Address(CONTRACT_ID).toScAddress(),
    key: xdr.ScVal.scvSymbol("Counter"),
    durability: xdr.ContractDataDurability.persistent(),
  })
);

function CounterDisplay() {
  const { data, isLoading, refetch } = useLedgerEntry(key, {
    refetchInterval: 3000, // poll every 3 s
  });

  const value = data ? scValToNative(data.val.contractData().val()) : null;

  if (isLoading) return <p>Loading...</p>;
  return (
    <div>
      <p>Counter: {value ?? "–"}</p>
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

## Notes

- **Manual Key Construction**: You must build the `xdr.LedgerKey` manually. See [Stellar SDK docs](https://stellar.github.io/js-stellar-sdk/) for details.
- **Caching**: Results are cached by default to avoid redundant RPC calls.
- **Polling**: Use `refetchInterval` for live data updates.

## See Also

- [useSorobanContract](/api/hooks/use-soroban-contract) — Higher-level contract interaction
- [useSorobanTokenBalance](/api/hooks/use-soroban-token-balance) — Specialized token balance reader
