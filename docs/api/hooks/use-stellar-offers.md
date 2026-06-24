# useStellarOffers

Fetch open buy/sell offers from Horizon for a given account.

## Overview

Queries all active offers (buy and sell orders) created by a Stellar account on the decentralized exchange.

## Import

```tsx
import { useStellarOffers } from "stellar-hooks";
```

## Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `publicKey` | `string \| null \| undefined` | Yes | Account public key (G...) |
| `options` | `UseStellarOffersOptions` | No | Configuration options |

### Options

| Option | Type | Default | Description |
|---|---|---|---|
| `enabled` | `boolean` | `true` | Whether to fetch automatically |
| `refetchInterval` | `number` | `0` | Polling interval in milliseconds |

## Return Value

| Property | Type | Description |
|---|---|---|---|
| `offers` | `Horizon.ServerApi.OfferRecord[]` | Array of open offers |
| `isLoading` | `boolean` | Whether fetch is in progress |
| `error` | `Error \| null` | Any error |
| `lastFetchedAt` | `Date \| null` | Last fetch timestamp |
| `refetch` | `() => Promise<void>` | Manually refetch |

### `OfferRecord` Structure

Each offer includes:
- `id` — Offer ID
- `selling` — Asset being sold
- `buying` — Asset being bought
- `amount` — Amount of `selling` asset
- `price` — Price per unit
- `seller` — Account that created the offer

## Basic Example

```tsx
import { useStellarOffers } from "stellar-hooks";

function OfferList({ publicKey }: { publicKey: string }) {
  const { offers, isLoading, refetch } = useStellarOffers(publicKey, {
    refetchInterval: 10_000, // poll every 10 seconds
  });

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <h3>Open Offers ({offers.length})</h3>
      <button onClick={refetch}>Refresh</button>
      <ul>
        {offers.map((o) => (
          <li key={o.id}>
            Sell {o.amount} {o.selling.asset_type} for {o.buying.asset_type} @ {o.price}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## See Also

- [useStellarAccount](/api/hooks/use-stellar-account) — Full account data
