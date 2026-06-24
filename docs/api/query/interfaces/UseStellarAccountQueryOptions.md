[**@stellar-hooks/query v0.1.0**](../README.md)

***

[@stellar-hooks/query](../README.md) / UseStellarAccountQueryOptions

# Interface: UseStellarAccountQueryOptions

Options for useStellarAccountQuery

## Extends

- `Omit`\<`UseQueryOptions`\<`StellarAccountData` \| `null`\>, `"queryKey"` \| `"queryFn"`\>

## Properties

### enabled?

> `optional` **enabled?**: `boolean`

Set this to `false` to disable automatic refetching when the query mounts or changes query keys.
To refetch the query, use the `refetch` method returned from the `useQuery` instance.
Defaults to `true`.

#### Overrides

`Omit.enabled`

***

### refetchInterval?

> `optional` **refetchInterval?**: `number`

If set to a number, the query will continuously refetch at this frequency in milliseconds.
If set to a function, the function will be executed with the latest data and query to compute a frequency
Defaults to `false`.

#### Overrides

`Omit.refetchInterval`
