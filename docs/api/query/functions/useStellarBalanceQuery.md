[**@stellar-hooks/query v0.1.0**](../README.md)

***

[@stellar-hooks/query](../README.md) / useStellarBalanceQuery

# Function: useStellarBalanceQuery()

> **useStellarBalanceQuery**(`publicKey`, `options?`): [`UseStellarBalanceQueryReturn`](../interfaces/UseStellarBalanceQueryReturn.md)

React Query adapter for useStellarBalance — wraps balance fetching in useQuery
with proper cache keys.

## Parameters

### publicKey

`string` \| `null` \| `undefined`

### options?

[`UseStellarBalanceQueryOptions`](../interfaces/UseStellarBalanceQueryOptions.md)

## Returns

[`UseStellarBalanceQueryReturn`](../interfaces/UseStellarBalanceQueryReturn.md)

## Example

```tsx
const { data } = useStellarBalanceQuery(publicKey, {
  staleTime: 1000 * 60, // 1 minute
  gcTime: 1000 * 60 * 5, // 5 minutes
});

console.log(`XLM: ${data?.xlmBalance?.balance}`);
```
