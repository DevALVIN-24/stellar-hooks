# usePayment

Build, sign, and submit a classic Stellar payment operation via Freighter in one hook.

## Overview

High-level payment hook that handles transaction building, Freighter signing, Horizon submission, and confirmation polling automatically.

## Import

```tsx
import { usePayment } from "stellar-hooks";
```

## Parameters

Takes a single options object:

| Option | Type | Required | Default | Description |
|---|---|---|---|---|
| `destination` | `string` | Yes | — | Recipient Stellar address (G...) |
| `asset` | `PaymentAsset` | Yes | — | Asset to send (`{ type: "native" }` for XLM) |
| `amount` | `string` | Yes | — | Amount as a string (e.g. `"10.5"`) |
| `memo` | `string` | No | — | Optional memo text (max 28 bytes) |
| `fee` | `number` | No | `100` | Fee in stroops |
| `timeoutSeconds` | `number` | No | `60` | Polling timeout |
| `onSuccess` | `(hash: string) => void` | No | — | Callback on success |
| `onError` | `(error: Error) => void` | No | — | Callback on error |

### `PaymentAsset`

```ts
// For XLM
{ type: "native" }

// For any other asset
{ type: "credit"; code: string; issuer: string }
```

## Return Value

| Property | Type | Description |
|---|---|---|---|
| `submit` | `() => Promise<void>` | Build, sign, and submit the payment |
| `status` | `TransactionStatus` | Current status (see below) |
| `hash` | `string \| null` | Transaction hash on success |
| `error` | `Error \| null` | Any error that occurred |
| `isLoading` | `boolean` | Whether a submission is in progress |
| `isSuccess` | `boolean` | Whether the payment succeeded |
| `isError` | `boolean` | Whether an error occurred |
| `reset` | `() => void` | Reset state to idle |

### `TransactionStatus`

`"idle"` → `"submitting"` → `"polling"` → `"success"` or `"error"`

## Basic Example

```tsx
import { usePayment } from "stellar-hooks";

function SendButton() {
  const { submit, status, hash, error, isLoading } = usePayment({
    destination: "GBXXX...",
    asset: { type: "native" },
    amount: "10",
    memo: "Thanks!",
  });

  return (
    <div>
      <button onClick={submit} disabled={isLoading}>
        {isLoading ? status : "Send 10 XLM"}
      </button>
      {status === "success" && <p>Sent! Hash: {hash}</p>}
      {error && <p style={{ color: "red" }}>{error.message}</p>}
    </div>
  );
}
```

## Non-Native Asset Example

```tsx
const { submit } = usePayment({
  destination: "GBXXX...",
  asset: {
    type: "credit",
    code: "USDC",
    issuer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
  },
  amount: "50",
});
```

## Notes

- **Freighter Required**: This hook uses `useFreighter` internally. The wallet must be connected before calling `submit`.
- **Horizon Submission**: Uses classic Horizon transaction submission (not Soroban RPC).
- **Sequence Management**: Automatically loads the source account to get the current sequence number.

## See Also

- [usePathPayment](/api/hooks/use-path-payment) — For path payments
- [useTransaction](/api/hooks/use-transaction) — Lower-level transaction submission
