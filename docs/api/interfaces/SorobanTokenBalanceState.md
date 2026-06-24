[**stellar-hooks v0.1.0**](../README.md)

***

[stellar-hooks](../README.md) / SorobanTokenBalanceState

# Interface: SorobanTokenBalanceState

## Properties

### balance

> **balance**: `bigint` \| `null`

Raw token balance as a BigInt (SAC balances are i128)

***

### error

> **error**: `Error` \| `null`

***

### formatted

> **formatted**: `string` \| `null`

Formatted balance as a string with 7 decimal places (Stellar standard)

***

### isLoading

> **isLoading**: `boolean`

***

### lastFetchedAt

> **lastFetchedAt**: `Date` \| `null`

***

### refetch

> **refetch**: () => `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>
