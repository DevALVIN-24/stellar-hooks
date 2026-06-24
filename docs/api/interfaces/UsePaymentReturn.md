[**stellar-hooks v0.1.0**](../README.md)

***

[stellar-hooks](../README.md) / UsePaymentReturn

# Interface: UsePaymentReturn

## Example

```tsx
const {
  submit,    // () => Promise<void> — build, sign, and submit the payment
  status,    // "idle" | "submitting" | "polling" | "success" | "error"
  hash,      // string | null — transaction hash on success
  isLoading, // boolean
  isSuccess, // boolean
  isError,   // boolean
  error,     // Error | null
  reset,     // () => void
} = usePayment({
  destination: "GBXXX...",
  asset: { type: "native" },
  amount: "10",
  memo: "Thanks!",
});

return <button onClick={submit} disabled={isLoading}>Send XLM</button>;
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

Call this to build, sign, and submit the payment

#### Returns

`Promise`\<`void`\>
