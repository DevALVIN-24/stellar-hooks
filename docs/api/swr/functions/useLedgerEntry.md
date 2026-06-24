[**@stellar-hooks/swr v0.1.0**](../README.md)

***

[@stellar-hooks/swr](../README.md) / useLedgerEntry

# Function: useLedgerEntry()

> **useLedgerEntry**(`ledgerKey`, `options?`): `any`

Read a raw Soroban ledger entry by its XDR key, powered by SWR.

Returns `null` when the entry is not found (instead of erroring).

## Parameters

### ledgerKey

`LedgerKey` \| `null` \| `undefined`

### options?

[`UseLedgerEntrySWROptions`](../interfaces/UseLedgerEntrySWROptions.md) = `{}`

## Returns

`any`

## Example

```tsx
const { data: entry, isLoading } = useLedgerEntry(ledgerKey);
```
