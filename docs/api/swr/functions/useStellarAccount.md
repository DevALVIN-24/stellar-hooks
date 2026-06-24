[**@stellar-hooks/swr v0.1.0**](../README.md)

***

[@stellar-hooks/swr](../README.md) / useStellarAccount

# Function: useStellarAccount()

> **useStellarAccount**(`publicKey`, `options?`): `any`

Fetch a Stellar account by its public key, powered by SWR.

Returns SWR's full response object, including `data`, `error`, `isLoading`,
`isValidating`, and `mutate` for manual revalidation.

## Parameters

### publicKey

`string` \| `null` \| `undefined`

### options?

[`UseStellarAccountSWROptions`](../interfaces/UseStellarAccountSWROptions.md) = `{}`

## Returns

`any`

## Example

```tsx
const { data, error, isLoading, mutate } = useStellarAccount("G...");
```
