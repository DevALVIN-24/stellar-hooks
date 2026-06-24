[**stellar-hooks v0.1.0**](../README.md)

***

[stellar-hooks](../README.md) / UseStellarTomlReturn

# Interface: UseStellarTomlReturn

## Example

```tsx
const {
  data,      // StellarTomlData | null — parsed stellar.toml contents
  isLoading, // boolean
  error,     // Error | null
  refetch,   // () => Promise<void>
} = useStellarToml("stellar.org");

// data.CURRENCIES → array of supported assets
// data.DOCUMENTATION → org info
```

## Properties

### data

> **data**: [`StellarTomlData`](StellarTomlData.md) \| `null`

***

### error

> **error**: `Error` \| `null`

***

### isLoading

> **isLoading**: `boolean`

***

### refetch

> **refetch**: () => `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>
