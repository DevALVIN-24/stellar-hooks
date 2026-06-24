[**stellar-hooks v0.1.0**](../README.md)

***

[stellar-hooks](../README.md) / UsePathPaymentReturn

# Interface: UsePathPaymentReturn

## Example

```tsx
// Strict send — send exactly 10 XLM, receive at least 9 USDC
const {
  submit,    // () => Promise<void>
  status,    // "idle" | "submitting" | "polling" | "success" | "error"
  hash,      // string | null
  isLoading, // boolean
  isSuccess, // boolean
  isError,   // boolean
  error,     // Error | null
  reset,     // () => void
} = usePathPayment({
  mode: "strict-send",
  sendAsset: { type: "native" },
  sendAmount: "10",
  destination: "GBXXX...",
  destAsset: { type: "credit", code: "USDC", issuer: "GISSUER..." },
  destMin: "9",
});
```

## Properties

### error

> **error**: `Error` \| `null`

***

### hash

> **hash**: `string` \| `null`

***

### isError

> **isError**: `boolean`

***

### isLoading

> **isLoading**: `boolean`

***

### isSuccess

> **isSuccess**: `boolean`

***

### reset

> **reset**: () => `void`

#### Returns

`void`

***

### status

> **status**: [`TransactionStatus`](../type-aliases/TransactionStatus.md)

***

### submit

> **submit**: () => `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>
