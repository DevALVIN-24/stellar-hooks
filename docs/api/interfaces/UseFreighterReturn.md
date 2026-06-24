[**stellar-hooks v0.1.0**](../README.md)

***

[stellar-hooks](../README.md) / UseFreighterReturn

# Interface: UseFreighterReturn

## Extends

- [`FreighterState`](FreighterState.md)

## Properties

### connect

> **connect**: () => `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

***

### disconnect

> **disconnect**: () => `void`

#### Returns

`void`

***

### error

> **error**: `Error` \| `null`

#### Inherited from

[`FreighterState`](FreighterState.md).[`error`](FreighterState.md#error)

***

### isConnected

> **isConnected**: `boolean`

#### Inherited from

[`FreighterState`](FreighterState.md).[`isConnected`](FreighterState.md#isconnected)

***

### isInstalled

> **isInstalled**: `boolean`

#### Inherited from

[`FreighterState`](FreighterState.md).[`isInstalled`](FreighterState.md#isinstalled)

***

### isLoading

> **isLoading**: `boolean`

#### Inherited from

[`FreighterState`](FreighterState.md).[`isLoading`](FreighterState.md#isloading)

***

### network

> **network**: `string` \| `null`

#### Inherited from

[`FreighterState`](FreighterState.md).[`network`](FreighterState.md#network)

***

### networkPassphrase

> **networkPassphrase**: `string` \| `null`

#### Inherited from

[`FreighterState`](FreighterState.md).[`networkPassphrase`](FreighterState.md#networkpassphrase)

***

### publicKey

> **publicKey**: `string` \| `null`

#### Inherited from

[`FreighterState`](FreighterState.md).[`publicKey`](FreighterState.md#publickey)

***

### signAuthEntry

> **signAuthEntry**: (`entryPreimageXdr`) => `Promise`\<`string`\>

#### Parameters

##### entryPreimageXdr

`string`

#### Returns

`Promise`\<`string`\>

***

### signBlob

> **signBlob**: (`blob`, `opts?`) => `Promise`\<`string`\>

#### Parameters

##### blob

`string`

##### opts?

###### accountToSign?

`string`

#### Returns

`Promise`\<`string`\>

***

### signTransaction

> **signTransaction**: (`xdr`, `opts?`) => `Promise`\<`string`\>

#### Parameters

##### xdr

`string`

##### opts?

[`SignTransactionOptions`](SignTransactionOptions.md)

#### Returns

`Promise`\<`string`\>
