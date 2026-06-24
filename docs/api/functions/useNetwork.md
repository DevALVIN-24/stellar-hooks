[**stellar-hooks v0.1.0**](../README.md)

***

[stellar-hooks](../README.md) / useNetwork

# Function: useNetwork()

> **useNetwork**(): `object`

## Returns

`object`

### config

> **config**: [`NetworkConfig`](../interfaces/NetworkConfig.md)

### horizonUrl

> **horizonUrl**: `string` = `config.horizonUrl`

### network

> **network**: [`StellarNetwork`](../type-aliases/StellarNetwork.md)

### networkPassphrase

> **networkPassphrase**: `string` = `config.networkPassphrase`

### sorobanRpcUrl

> **sorobanRpcUrl**: `string` = `config.sorobanRpcUrl`

### switchNetwork

> **switchNetwork**: (`newNetwork`, `newCustomConfig?`) => `void`

#### Parameters

##### newNetwork

[`StellarNetwork`](../type-aliases/StellarNetwork.md)

##### newCustomConfig?

[`CustomNetworkConfig`](../interfaces/CustomNetworkConfig.md)

#### Returns

`void`
