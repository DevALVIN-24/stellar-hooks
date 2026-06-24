# useStellarToml

Fetch and parse a domain's `stellar.toml` file via the SEP-1 standard.

## Overview

Loads issuer metadata, supported currencies, validator nodes, and organization information from a domain's `stellar.toml`.

## Import

```tsx
import { useStellarToml } from "stellar-hooks";
```

## Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `domain` | `string \| null \| undefined` | Yes | Domain to fetch `stellar.toml` from |
| `options` | `UseStellarTomlOptions` | No | Configuration options |

### Options

| Option | Type | Default | Description |
|---|---|---|---|
| `cacheTTL` | `number` | `300000` | Cache time-to-live (5 minutes) |

## Return Value

| Property | Type | Description |
|---|---|---|---|
| `data` | `StellarTomlData \| null` | Parsed TOML contents |
| `isLoading` | `boolean` | Whether fetch is in progress |
| `error` | `Error \| null` | Any error |
| `refetch` | `() => Promise<void>` | Manually refetch |

### `StellarTomlData` Structure

```ts
{
  CURRENCIES?: Array<Record<string, any>>;   // Supported assets
  VALIDATORS?: Array<Record<string, any>>;   // Validator nodes
  DOCUMENTATION?: Record<string, any>;       // Org info
  [key: string]: any;                        // Additional fields
}
```

## Basic Example

```tsx
import { useStellarToml } from "stellar-hooks";

function IssuerInfo() {
  const { data, isLoading } = useStellarToml("stellar.org");

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <h3>{data?.DOCUMENTATION?.ORG_NAME}</h3>
      <p>Currencies: {data?.CURRENCIES?.length ?? 0}</p>
      <ul>
        {data?.CURRENCIES?.map((c, i) => (
          <li key={i}>
            {c.code} — {c.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## See Also

- [useAssetMetadata](/api/hooks/use-asset-metadata) — Resolve asset metadata automatically
