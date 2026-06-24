[**stellar-hooks v0.1.0**](../README.md)

***

[stellar-hooks](../README.md) / usePathPayment

# Function: usePathPayment()

> **usePathPayment**(`options`): [`UsePathPaymentReturn`](../interfaces/UsePathPaymentReturn.md)

Builds a Stellar path payment operation (strict send or strict receive),
signs it via Freighter, and submits it through Horizon.

Wraps `useTransaction({ mode: "classic" })` for submission and polling.

## Parameters

### options

[`UsePathPaymentOptions`](../interfaces/UsePathPaymentOptions.md)

## Returns

[`UsePathPaymentReturn`](../interfaces/UsePathPaymentReturn.md)

## Example

```tsx
// Strict send — send exactly 10 XLM, receive at least 9 USDC
const { submit, status, hash } = usePathPayment({
  mode: "strict-send",
  sendAsset: { type: "native" },
  sendAmount: "10",
  destination: "GBXXX...",
  destAsset: { type: "credit", code: "USDC", issuer: "GISSUER..." },
  destMin: "9",
});

// Strict receive — receive exactly 10 USDC, send at most 11 XLM
const { submit, status, hash } = usePathPayment({
  mode: "strict-receive",
  sendAsset: { type: "native" },
  sendAmount: "11",
  destination: "GBXXX...",
  destAsset: { type: "credit", code: "USDC", issuer: "GISSUER..." },
  destMin: "10",
});
```
