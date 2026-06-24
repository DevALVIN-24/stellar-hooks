[**stellar-hooks v0.1.0**](../README.md)

***

[stellar-hooks](../README.md) / useStellarBalance

# Function: useStellarBalance()

> **useStellarBalance**(`publicKey`, `assetOrOptions?`, `options?`): `UseStellarBalanceReturn`

Convenience wrapper around useStellarAccount that surfaces the native XLM balance
and optionally a specific asset balance.

## Parameters

### publicKey

`string` \| `null` \| `undefined`

The public key of the account to fetch.

### assetOrOptions?

`UseStellarAccountOptions` \| \{ `code`: `string`; `issuer`: `string`; \} \| `null`

Specific asset to find, or configuration options.

### options?

`UseStellarAccountOptions`

Configuration options (if asset is provided as 2nd arg).

## Returns

`UseStellarBalanceReturn`

## Examples

```tsx
const { xlmBalance, isLoading } = useStellarBalance(publicKey);
return <p>Balance: {xlmBalance?.balance ?? "0"} XLM</p>;
```

```tsx
const { assetBalance } = useStellarBalance(publicKey, { code: "USDC", issuer: "G..." });
return <p>USDC Balance: {assetBalance?.balance ?? "0"}</p>;
```
