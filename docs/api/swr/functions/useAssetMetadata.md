[**@stellar-hooks/swr v0.1.0**](../README.md)

***

[@stellar-hooks/swr](../README.md) / useAssetMetadata

# Function: useAssetMetadata()

> **useAssetMetadata**(`assetCode`, `assetIssuer`): `object`

Resolves asset issuer info via stellar.toml, powered by SWR.

Composes `useStellarAccount` (SWR) and `useStellarToml` (SWR) to fetch the
issuer's home_domain and metadata. Both layers benefit from SWR caching.

## Parameters

### assetCode

`string` \| `null` \| `undefined`

### assetIssuer

`string` \| `null` \| `undefined`

## Returns

`object`

### error

> **error**: `any`

### isLoading

> **isLoading**: `any`

### metadata

> **metadata**: [`AssetMetadata`](../interfaces/AssetMetadata.md) \| `null`

## Example

```tsx
const { metadata, isLoading, error } = useAssetMetadata("USDC", "GISSUER...");
```
