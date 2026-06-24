# useTransaction

Submit a pre-signed transaction XDR and poll until confirmed. Works with both Soroban (RPC) and classic Stellar (Horizon) transactions.

## Overview

Lower-level hook for submitting transactions that have already been signed externally (hardware wallet, server-side co-signer, etc.).

## Import

```tsx
import { useTransaction } from "stellar-hooks";
```

## Parameters

Takes an optional options object:

| Option | Type | Required | Default | Description |
|---|---|---|---|---|
| `mode` | `"soroban" \| "classic"` | No | `"soroban"` | Use RPC or Horizon for submission |
| `timeoutSeconds` | `number` | No | `60` | Polling timeout |
| `onSuccess` | `(hash: string) => void` | No | — | Success callback |
| `onError` | `(error: Error) => void` | No | — | Error callback |

## Return Value

| Property | Type | Description |
|---|---|---|---|
| `submit` | `(signedXdr: string) => Promise<void>` | Submit the signed transaction |
| `status` | `TransactionStatus` | Current status |
| `hash` | `string \| null` | Transaction hash on success |
| `error` | `Error \| null` | Any error |
| `isLoading` | `boolean` | Whether submission is in progress |
| `isSuccess` | `boolean` | Whether transaction succeeded |
| `isError` | `boolean` | Whether an error occurred |
| `reset` | `() => void` | Reset to idle state |

### `TransactionStatus`

- **Soroban mode**: `"idle"` → `"submitting"` → `"polling"` → `"success"` or `"error"`
- **Classic mode**: `"idle"` → `"submitting"` → `"success"` or `"error"` (Horizon resolves immediately)

## Basic Example

```tsx
import { useTransaction } from "stellar-hooks";

function SubmitPanel() {
  const { submit, status, hash, error } = useTransaction({ mode: "soroban" });

  async function handleSubmit(signedXdr: string) {
    await submit(signedXdr);
  }

  return (
    <div>
      <p>Status: {status}</p>
      {hash && <p>Hash: {hash}</p>}
      {error && <p style={{ color: "red" }}>{error.message}</p>}
    </div>
  );
}
```

## Classic Horizon Example

```tsx
const { submit } = useTransaction({ mode: "classic" });

const signedXdr = await freighter.signTransaction(builtXdr);
await submit(signedXdr);
```

## Notes

- **Polling**: Soroban mode polls via `getTransaction` with exponential backoff. Horizon mode resolves immediately.
- **Network Configuration**: Uses the network configured in `<StellarProvider>`.
- **Error Recovery**: Call `reset()` to clear error state and retry.

## See Also

- [usePayment](/api/hooks/use-payment) — Higher-level payment hook
- [useSorobanContract](/api/hooks/use-soroban-contract) — Handles Soroban signing internally
