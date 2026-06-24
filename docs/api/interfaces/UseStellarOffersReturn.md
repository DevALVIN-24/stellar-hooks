[**stellar-hooks v0.1.0**](../README.md)

***

[stellar-hooks](../README.md) / UseStellarOffersReturn

# Interface: UseStellarOffersReturn

## Example

```tsx
const {
  offers,        // Horizon.ServerApi.OfferRecord[] — open buy/sell offers
  isLoading,     // boolean
  error,         // Error | null
  lastFetchedAt, // Date | null
  refetch,       // () => Promise<void>
} = useStellarOffers("G...", { refetchInterval: 10_000 });

// Each offer: { id, selling, buying, amount, price, seller, ... }
```

## Properties

### error

> **error**: `Error` \| `null`

***

### isLoading

> **isLoading**: `boolean`

***

### lastFetchedAt

> **lastFetchedAt**: `Date` \| `null`

***

### offers

> **offers**: `OfferRecord`[]

***

### refetch

> **refetch**: () => `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>
