[**stellar-hooks v0.1.0**](../README.md)

***

[stellar-hooks](../README.md) / UsePaymentOptions

# Interface: UsePaymentOptions

## Properties

### amount

> **amount**: `string`

Amount as a string, e.g. "10.5"

***

### asset

> **asset**: [`PaymentAsset`](../type-aliases/PaymentAsset.md)

Asset to send

***

### destination

> **destination**: `string`

Recipient Stellar address (G...)

***

### fee?

> `optional` **fee?**: `number`

Fee in stroops. Default: 100

***

### memo?

> `optional` **memo?**: `string`

Optional memo text (max 28 bytes)

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

> `optional` **onSuccess?**: (`hash`) => `void`

Callback fired when the transaction is successfully confirmed.

#### Parameters

##### hash

`string`

#### Returns

`void`

***

### timeoutSeconds?

> `optional` **timeoutSeconds?**: `number`

Polling timeout in seconds. Default: 60
