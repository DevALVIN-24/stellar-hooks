[**stellar-hooks v0.1.0**](../README.md)

***

[stellar-hooks](../README.md) / CustomNetworkConfig

# Interface: CustomNetworkConfig

Endpoint configuration for a private or self-hosted Stellar network.

Pass this object to the `customConfig` prop when [StellarProviderProps.network](StellarProviderProps.md#network)
is `"custom"`.

## Example

```tsx
<StellarProvider
  network="custom"
  customConfig={{
    network: "custom",
    horizonUrl: "https://my-horizon.example.com",
    sorobanRpcUrl: "https://my-rpc.example.com",
    networkPassphrase: "My Network ; 2024",
  }}
>
  ...
</StellarProvider>
```

## Properties

### horizonUrl

> **horizonUrl**: `string`

Horizon REST API base URL for this network.

#### Example

```ts
"https://my-horizon.example.com"
```

***

### network

> **network**: `"custom"`

Must be `"custom"` when supplying a custom network configuration.

***

### networkPassphrase

> **networkPassphrase**: `string`

Stellar network passphrase used when signing transactions.

#### Example

```ts
"My Network ; 2024"
```

***

### sorobanRpcUrl

> **sorobanRpcUrl**: `string`

Soroban RPC endpoint URL for contract simulation and submission.

#### Example

```ts
"https://my-rpc.example.com"
```
