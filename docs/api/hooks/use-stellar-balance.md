# useStellarBalance

Convenience wrapper around `useStellarAccount` that surfaces the native XLM balance and optionally a specific asset balance.

## Overview

Fetches account data and extracts balance information. More convenient than manually filtering `useStellarAccount` results.

## Import

```tsx
import { useStellarBalance } from "stellar-hooks";
```

## Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `publicKey` | `string \| null \| undefined` | Yes | The Stellar public key to query |
| `assetOrOptions` | `{ code: string; issuer: string } \| UseStellarAccountOptions` | No | Specific asset to find, or options object |
| `options` | `UseStellarAccountOptions` | No | Options (only if asset is provided as 2nd arg) |

## Return Value

| Property | Type | Description |
|---|---|---|---|
| `balances` | `StellarBalance[]` | Array of all balances on the account |
| `xlmBalance` | `StellarBalance \| null` | The native XLM balance entry |
| `assetBalance` | `StellarBalance \| null` | The specific asset balance (if requested) |
| `data` | `StellarAccountData \| null` | Full account data |
| `isLoading` | `boolean` | Whether data is loading |
| `error` | `Error \| null` | Any error that occurred |
| `lastFetchedAt` | `Date \| null` | Last fetch timestamp |
| `refetch` | `() => Promise<void>` | Manually refetch |

### `StellarBalance` Structure

```ts
{
  assetType: string;          // "native" | "credit_alphanum4" | "credit_alphanum12"
  assetCode?: string;         // Asset code (e.g. "USDC")
  assetIssuer?: string;       // Issuer public key
  balance: string;            // Balance as a string
  balanceFloat: number;       // Parsed float for math operations
  buyingLiabilities: string;
  sellingLiabilities: string;
  limit?: string;             // Trustline limit (for non-native assets)
  isNative: boolean;          // true for XLM
}
```

## Basic Example

```tsx
import { useStellarBalance } from "stellar-hooks";

function Balances({ publicKey }: { publicKey: string }) {
  const { xlmBalance, balances, isLoading } = useStellarBalance(publicKey);

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <h3>XLM: {xlmBalance?.balance ?? "0"}</h3>
      <h4>Other Assets:</h4>
      <ul>
        {balances
          .filter((b) => !b.isNative)
          .map((b) => (
            <li key={`${b.assetCode}:${b.assetIssuer}`}>
              {b.assetCode} — {b.balance}
            </li>
          ))}
      </ul>
    </div>
  );
}
```

## Specific Asset Example

```tsx
const { assetBalance } = useStellarBalance(publicKey, {
  code: "USDC",
  issuer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
});

return <p>USDC Balance: {assetBalance?.balance ?? "0"}</p>;
```

## See Also

- [useStellarAccount](/api/hooks/use-stellar-account) — Full account data fetch
