[**stellar-hooks v0.1.0**](../README.md)

***

[stellar-hooks](../README.md) / UseContractCallReturn

# Interface: UseContractCallReturn\<TResult\>

## Extends

- [`TransactionState`](TransactionState.md)\<`TResult`\>

## Type Parameters

### TResult

`TResult` = `unknown`

## Properties

### call

> **call**: (`overrides?`) => `Promise`\<`TResult` \| `null`\>

Execute the contract call (Simulation -> Signing -> Submission -> Polling).

#### Parameters

##### overrides?

`Partial`\<`Omit`\<[`ContractCallOptions`](ContractCallOptions.md)\<`TResult`\>, `"contractId"`\>\>

#### Returns

`Promise`\<`TResult` \| `null`\>

***

### error

> **error**: `Error` \| `null`

#### Inherited from

[`TransactionState`](TransactionState.md).[`error`](TransactionState.md#error)

***

### hash

> **hash**: `string` \| `null`

#### Inherited from

[`TransactionState`](TransactionState.md).[`hash`](TransactionState.md#hash)

***

### isError

> **isError**: `boolean`

#### Inherited from

[`TransactionState`](TransactionState.md).[`isError`](TransactionState.md#iserror)

***

### isLoading

> **isLoading**: `boolean`

#### Inherited from

[`TransactionState`](TransactionState.md).[`isLoading`](TransactionState.md#isloading)

***

### isSuccess

> **isSuccess**: `boolean`

#### Inherited from

[`TransactionState`](TransactionState.md).[`isSuccess`](TransactionState.md#issuccess)

***

### query

> **query**: (`overrides?`) => `Promise`\<`TResult` \| `null`\>

Perform a simulation-only call to read contract state without submitting a transaction.
Updates the hook's `result` and `status` upon success.

#### Parameters

##### overrides?

`Partial`\<`Omit`\<[`ContractCallOptions`](ContractCallOptions.md)\<`TResult`\>, `"contractId"`\>\>

#### Returns

`Promise`\<`TResult` \| `null`\>

***

### reset

> **reset**: () => `void`

#### Returns

`void`

***

### result

> **result**: `TResult` \| `null`

#### Inherited from

[`TransactionState`](TransactionState.md).[`result`](TransactionState.md#result)

***

### simulate

> **simulate**: (`overrides?`) => `Promise`\<`SimulateTransactionResponse`\>

Perform an isolated simulation of the contract call.
Returns the raw RPC simulation response including footprint, resource usage, and results.
Does not sign or submit a transaction.

#### Parameters

##### overrides?

`Partial`\<`Omit`\<[`ContractCallOptions`](ContractCallOptions.md)\<`TResult`\>, `"contractId"`\>\>

#### Returns

`Promise`\<`SimulateTransactionResponse`\>

***

### status

> **status**: [`TransactionStatus`](../type-aliases/TransactionStatus.md)

#### Inherited from

[`TransactionState`](TransactionState.md).[`status`](TransactionState.md#status)
