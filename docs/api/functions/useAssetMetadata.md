[**stellar-hooks v0.1.0**](../README.md)

***

[stellar-hooks](../README.md) / useAssetMetadata

# Function: useAssetMetadata()

> **useAssetMetadata**(`assetCode`, `assetIssuer`): [`UseAssetMetadataReturn`](../interfaces/UseAssetMetadataReturn.md)

Resolves asset issuer info via stellar.toml.
Composes useStellarAccount and useStellarToml to fetch the issuer's home_domain and metadata.

## Parameters

### assetCode

`string` \| `null` \| `undefined`

### assetIssuer

`string` \| `null` \| `undefined`

## Returns

[`UseAssetMetadataReturn`](../interfaces/UseAssetMetadataReturn.md)
