[**stellar-hooks v0.1.0**](../README.md)

***

[stellar-hooks](../README.md) / UsePathPaymentOptions

# Interface: UsePathPaymentOptions

## Properties

### destAsset

> **destAsset**: [`PathPaymentAsset`](../type-aliases/PathPaymentAsset.md)

Asset to be received

***

### destination

> **destination**: `string`

Recipient Stellar address (G...)

***

### destMin

> **destMin**: `string`

strict-send: minimum amount the destination must receive.
strict-receive: exact amount the destination will receive.

***

### fee?

> `optional` **fee?**: `number`

Fee in stroops. Default: 100

***

### mode

> **mode**: `"strict-send"` \| `"strict-receive"`

"strict-send" fixes the send amount; "strict-receive" fixes the receive amount

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

### path?

> `optional` **path?**: [`PathPaymentAsset`](../type-aliases/PathPaymentAsset.md)[]

Intermediate assets for the payment path. Default: [] (Horizon auto-selects)

***

### sendAmount

> **sendAmount**: `string`

strict-send: exact amount to send.
strict-receive: maximum amount willing to send.

***

### sendAsset

> **sendAsset**: [`PathPaymentAsset`](../type-aliases/PathPaymentAsset.md)

Asset being sent

***

### timeoutSeconds?

> `optional` **timeoutSeconds?**: `number`

Polling timeout in seconds. Default: 60
