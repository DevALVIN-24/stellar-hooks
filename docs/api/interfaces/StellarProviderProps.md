[**stellar-hooks v0.1.0**](../README.md)

***

[stellar-hooks](../README.md) / StellarProviderProps

# Interface: StellarProviderProps

## Properties

### children

> **children**: `ReactNode`

***

### customConfig?

> `optional` **customConfig?**: [`CustomNetworkConfig`](CustomNetworkConfig.md)

Required when `network` is `"custom"`. Describes Horizon, Soroban RPC, and the
network passphrase for your deployment.

***

### network?

> `optional` **network?**: [`StellarNetwork`](../type-aliases/StellarNetwork.md)

Built-in preset (`testnet`, `mainnet`, `futurenet`) or `"custom"` for a private network.

#### Default

```ts
"testnet"
```
