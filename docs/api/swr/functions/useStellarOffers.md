[**@stellar-hooks/swr v0.1.0**](../README.md)

***

[@stellar-hooks/swr](../README.md) / useStellarOffers

# Function: useStellarOffers()

> **useStellarOffers**(`publicKey`, `options?`): `any`

Fetches open buy/sell offers from Horizon for a given account, powered by SWR.

## Parameters

### publicKey

`string` \| `null` \| `undefined`

### options?

[`UseStellarOffersSWROptions`](../interfaces/UseStellarOffersSWROptions.md) = `{}`

## Returns

`any`

## Example

```tsx
const { data: offers, isLoading } = useStellarOffers("G...");
```
