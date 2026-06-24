[**@stellar-hooks/query v0.1.0**](../README.md)

***

[@stellar-hooks/query](../README.md) / useStellarAccountQuery

# Function: useStellarAccountQuery()

> **useStellarAccountQuery**(`publicKey`, `options?`): `UseQueryResult`\<`StellarAccountData` \| `null`, `unknown`\>

React Query adapter for useStellarAccount — wraps account fetching in useQuery
with proper cache keys.

## Parameters

### publicKey

`string` \| `null` \| `undefined`

### options?

[`UseStellarAccountQueryOptions`](../interfaces/UseStellarAccountQueryOptions.md)

## Returns

`UseQueryResult`\<`StellarAccountData` \| `null`, `unknown`\>

## Example

```tsx
const { data, isLoading, error } = useStellarAccountQuery(publicKey, {
  staleTime: 1000 * 60, // 1 minute
  gcTime: 1000 * 60 * 5, // 5 minutes
});
```
