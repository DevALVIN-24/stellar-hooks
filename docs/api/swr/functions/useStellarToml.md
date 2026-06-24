[**@stellar-hooks/swr v0.1.0**](../README.md)

***

[@stellar-hooks/swr](../README.md) / useStellarToml

# Function: useStellarToml()

> **useStellarToml**(`domain`, `options?`): `any`

Fetches and parses a domain's stellar.toml file via the SEP-1 standard,
powered by SWR.

## Parameters

### domain

`string` \| `null` \| `undefined`

### options?

[`UseStellarTomlSWROptions`](../interfaces/UseStellarTomlSWROptions.md) = `{}`

## Returns

`any`

## Example

```tsx
const { data: toml, isLoading } = useStellarToml("stellar.org");
```
