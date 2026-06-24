# useAssetMetadata

Resolve asset metadata from the issuer's `stellar.toml` file automatically.

## Overview

Composes `useStellarAccount` and `useStellarToml` to load an asset issuer's account, extract the `home_domain`, fetch the TOML file, and return the matching `CURRENCIES` entry.

## Import

```tsx
import { useAssetMetadata } from "stellar-hooks";
```

## Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `assetCode` | `string \| null \| undefined` | Yes | Asset code (e.g. `"USDC"`) |
| `assetIssuer` | `string \| null \| undefined` | Yes | Issuer public key (G...) |

## Return Value

| Property | Type | Description |
|---|---|---|---|
| `metadata` | `AssetMetadata \| null` | Matched TOML currency entry |
| `isLoading` | `boolean` | Whether loading account or TOML |
| `error` | `Error \| null` | Any error from account fetch or TOML fetch |

### `AssetMetadata` Structure

```ts
{
  code?: string;     // Asset code
  issuer?: string;   // Issuer public key
  name?: string;     // Human-readable name
  desc?: string;     // Description
  image?: string;    // Logo URL
  [key: string]: any; // Additional TOML fields
}
```

## Basic Example

```tsx
import { useAssetMetadata } from "stellar-hooks";

function AssetInfo() {
  const { metadata, isLoading } = useAssetMetadata(
    "USDC",
    "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN"
  );

  if (isLoading) return <p>Loading...</p>;
  if (!metadata) return <p>No metadata found</p>;

  return (
    <div>
      {metadata.image && <img src={metadata.image} alt={metadata.name} width={50} />}
      <h3>{metadata.name ?? metadata.code}</h3>
      <p>{metadata.desc}</p>
    </div>
  );
}
```

## Notes

- **Two-Step Fetch**: First loads the issuer account to get `home_domain`, then fetches and parses the TOML.
- **Caching**: Both underlying hooks cache results to minimize network requests.
- **Fallback**: Returns `null` if issuer has no `home_domain` or TOML doesn't list the asset.

## See Also

- [useStellarToml](/api/hooks/use-stellar-toml) — Direct TOML fetching
