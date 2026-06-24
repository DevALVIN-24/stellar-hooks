[**stellar-hooks v0.1.0**](../README.md)

***

[stellar-hooks](../README.md) / useLedgerEntry

# Function: useLedgerEntry()

> **useLedgerEntry**(`ledgerKey`, `options?`): [`LedgerEntryState`](../interfaces/LedgerEntryState.md)

Read a raw Soroban ledger entry by its XDR key.
Useful for reading persistent contract data without constructing a full
contract call.

## Parameters

### ledgerKey

`LedgerKey` \| `null` \| `undefined`

### options?

`UseLedgerEntryOptions` = `{}`

## Returns

[`LedgerEntryState`](../interfaces/LedgerEntryState.md)

## Example

```tsx
// Build the ledger key for a persistent "Counter" entry
const key = xdr.LedgerKey.contractData(
  new xdr.LedgerKeyContractData({
    contract: new Address(CONTRACT_ID).toScAddress(),
    key: xdr.ScVal.scvSymbol("Counter"),
    durability: xdr.ContractDataDurability.persistent(),
  })
);

const {
  data,          // SorobanRpc.Api.LedgerEntryResult | null
  isLoading,     // boolean
  error,         // Error | null
  lastFetchedAt, // Date | null
  refetch,       // () => Promise<void>
} = useLedgerEntry(key, { refetchInterval: 3000 });

const value = data
  ? scValToNative(data.val.contractData().val())
  : null;
```
