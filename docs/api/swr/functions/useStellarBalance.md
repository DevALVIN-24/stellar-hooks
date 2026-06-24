[**@stellar-hooks/swr v0.1.0**](../README.md)

***

[@stellar-hooks/swr](../README.md) / useStellarBalance

# Function: useStellarBalance()

> **useStellarBalance**(`publicKey`, `options?`): `object`

Convenience hook — fetches all balances for a public key via SWR and
surfaces the XLM (native) balance at the top level.

## Parameters

### publicKey

`string` \| `null` \| `undefined`

### options?

[`UseStellarAccountSWROptions`](../interfaces/UseStellarAccountSWROptions.md)

## Returns

`object`

### balances

> **balances**: `StellarBalance`[]

### data

> **data**: `any`

### error

> **error**: `any`

### isLoading

> **isLoading**: `any`

### isValidating

> **isValidating**: `any`

### mutate

> **mutate**: `any`

### xlmBalance

> **xlmBalance**: `any`

## Example

```tsx
const { xlmBalance, balances, isLoading } = useStellarBalance("G...");
console.log(`XLM: ${xlmBalance?.balance}`);
```
