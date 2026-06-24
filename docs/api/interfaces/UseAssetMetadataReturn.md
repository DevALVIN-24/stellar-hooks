[**stellar-hooks v0.1.0**](../README.md)

***

[stellar-hooks](../README.md) / UseAssetMetadataReturn

# Interface: UseAssetMetadataReturn

## Example

```tsx
const {
  metadata,  // AssetMetadata | null — matched CURRENCIES entry from stellar.toml
  isLoading, // boolean
  error,     // Error | null
} = useAssetMetadata("USDC", "GISSUER...");

// metadata.name  → human-readable asset name
// metadata.image → logo URL
// metadata.desc  → description
```

## Properties

### error

> **error**: `Error` \| `null`

***

### isLoading

> **isLoading**: `boolean`

***

### metadata

> **metadata**: [`AssetMetadata`](AssetMetadata.md) \| `null`
