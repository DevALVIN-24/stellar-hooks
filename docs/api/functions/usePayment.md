[**stellar-hooks v0.1.0**](../README.md)

***

[stellar-hooks](../README.md) / usePayment

# Function: usePayment()

> **usePayment**(`options`): [`UsePaymentReturn`](../interfaces/UsePaymentReturn.md)

Builds a classic Stellar payment operation, signs it via Freighter,
and submits it through Horizon with polling for confirmation.

Wraps `useTransaction({ mode: "classic" })` for submission and polling.

## Parameters

### options

[`UsePaymentOptions`](../interfaces/UsePaymentOptions.md)

## Returns

[`UsePaymentReturn`](../interfaces/UsePaymentReturn.md)

## Example

```tsx
const { submit, status, hash, error } = usePayment({
  destination: "GBXXX...",
  asset: { type: "native" },
  amount: "10",
  memo: "Thanks!",
});

return <button onClick={submit}>Send XLM</button>;
```
