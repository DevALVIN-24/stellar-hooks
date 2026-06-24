[**@stellar-hooks/swr v0.1.0**](../README.md)

***

[@stellar-hooks/swr](../README.md) / useClaimableBalances

# Function: useClaimableBalances()

> **useClaimableBalances**(`publicKey`, `options?`): `any`

Fetches all claimable balances for a given public key from Horizon,
powered by SWR.

## Parameters

### publicKey

`string` \| `null` \| `undefined`

### options?

[`UseClaimableBalancesSWROptions`](../interfaces/UseClaimableBalancesSWROptions.md) = `{}`

## Returns

`any`

## Example

```tsx
const { data: balances, isLoading, mutate } = useClaimableBalances("G...");
```
