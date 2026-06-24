[**stellar-hooks v0.1.0**](../README.md)

***

[stellar-hooks](../README.md) / ContractCallOptions

# Interface: ContractCallOptions\<TResult\>

## Type Parameters

### TResult

`TResult` = `any`

## Properties

### args?

> `optional` **args?**: `unknown`[]

***

### contractId

> **contractId**: `string`

Soroban contract address (C...)

***

### fee?

> `optional` **fee?**: `number`

Fee in stroops. Defaults to 100

***

### method

> **method**: `string`

***

### onError?

> `optional` **onError?**: (`error`) => `void`

Callback fired when the transaction fails or an error occurs.

#### Parameters

##### error

`Error`

#### Returns

`void`

***

### onSuccess?

> `optional` **onSuccess?**: (`result`) => `void`

Callback fired when the transaction is successfully confirmed.

#### Parameters

##### result

`TResult`

#### Returns

`void`

***

### parseResult?

> `optional` **parseResult?**: (`scVal`) => `TResult`

Optional function to parse the raw xdr.ScVal result to your desired TResult type.
If not provided, the raw xdr.ScVal is returned (or tx hash as fallback).

#### Parameters

##### scVal

`any`

#### Returns

`TResult`

***

### sorobanRpcServer?

> `optional` **sorobanRpcServer?**: `RpcServer`

Custom Soroban RPC server instance. If not provided, one is created from the provider config.

***

### timeoutSeconds?

> `optional` **timeoutSeconds?**: `number`

Timeout in seconds. Defaults to 30
