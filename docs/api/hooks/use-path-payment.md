# usePathPayment

Build, sign, and submit a Stellar path payment operation (strict send or strict receive).

## Overview

Path payments allow sending one asset while the recipient receives a different asset, with automatic conversion via the Stellar DEX.

## Import

```tsx
import { usePathPayment } from "stellar-hooks";
```

## Parameters

Takes a single options object:

| Option | Type | Required | Description |
|---|---|---|---|
| `mode` | `"strict-send" \| "strict-receive"` | Yes | Payment mode |
| `sendAsset` | `PathPaymentAsset` | Yes | Asset being sent |
| `sendAmount` | `string` | Yes | strict-send: exact amount to send<br>strict-receive: max willing to send |
| `destination` | `string` | Yes | Recipient address (G...) |
| `destAsset` | `PathPaymentAsset` | Yes | Asset to be received |
| `destMin` | `string` | Yes | strict-send: min amount destination receives<br>strict-receive: exact amount destination receives |
| `path` | `PathPaymentAsset[]` | No | Intermediate assets (default: `[]` = Horizon auto-selects) |
| `fee` | `number` | No | Fee in stroops (default: `100`) |
| `timeoutSeconds` | `number` | No | Polling timeout (default: `60`) |
| `onSuccess` | `(hash: string) => void` | No | Success callback |
| `onError` | `(error: Error) => void` | No | Error callback |

### `PathPaymentAsset`

```ts
// For XLM
{ type: "native" }

// For any other asset
{ type: "credit"; code: string; issuer: string }
```

## Return Value

Same as `usePayment`: `submit`, `status`, `hash`, `error`, `isLoading`, `isSuccess`, `isError`, `reset`.

## Strict Send Example

Send exactly 10 XLM, receive at least 9 USDC:

```tsx
import { usePathPayment } from "stellar-hooks";

const { submit, status, hash } = usePathPayment({
  mode: "strict-send",
  sendAsset: { type: "native" },
  sendAmount: "10",
  destination: "GBXXX...",
  destAsset: {
    type: "credit",
    code: "USDC",
    issuer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
  },
  destMin: "9",
});

return <button onClick={submit}>Send</button>;
```

## Strict Receive Example

Receive exactly 10 USDC, send at most 11 XLM:

```tsx
const { submit } = usePathPayment({
  mode: "strict-receive",
  sendAsset: { type: "native" },
  sendAmount: "11", // max to send
  destination: "GBXXX...",
  destAsset: {
    type: "credit",
    code: "USDC",
    issuer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
  },
  destMin: "10", // exact amount to receive
});
```

## Notes

- **Path Selection**: Leave `path` empty (default) for Horizon to auto-select the best path.
- **Slippage**: The difference between `sendAmount` and `destMin` represents your slippage tolerance.
- **Freighter Required**: Uses `useFreighter` for signing.

## See Also

- [usePayment](/api/hooks/use-payment) — Simple direct payments
