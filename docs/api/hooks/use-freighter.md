# useFreighter

Connect to and interact with the [Freighter](https://freighter.app) browser extension wallet.

## Overview

`useFreighter` manages wallet connection state, handles account and network switches automatically, and provides methods for signing transactions, auth entries, and arbitrary data blobs.

## Import

```tsx
import { useFreighter } from "stellar-hooks";
```

## Parameters

None. This hook takes no parameters.

## Return Value

| Property | Type | Description |
|---|---|---|
| `isInstalled` | `boolean` | Whether Freighter is installed in the browser |
| `isConnected` | `boolean` | Whether the user has granted wallet access |
| `publicKey` | `string \| null` | The connected account's public key (G... address), or null if not connected |
| `network` | `string \| null` | The network the wallet is currently on (e.g. `"TESTNET"`, `"PUBLIC"`) |
| `networkPassphrase` | `string \| null` | The wallet's current network passphrase |
| `isLoading` | `boolean` | Whether the hook is currently checking connection status or performing an action |
| `error` | `Error \| null` | Any error that occurred during connection or signing |
| `connect` | `() => Promise<void>` | Request wallet access from the user. Opens Freighter permission dialog. |
| `disconnect` | `() => void` | Clear the connection state locally (does not revoke permissions in Freighter) |
| `signTransaction` | `(xdr: string, opts?) => Promise<string>` | Sign a transaction XDR and return the signed XDR |
| `signAuthEntry` | `(entryPreimageXdr: string) => Promise<string>` | Sign a Soroban authorization entry for contract auth |
| `signBlob` | `(blob: string, opts?) => Promise<string>` | Sign arbitrary data (e.g. for login proof or off-chain signatures) |

### `signTransaction` Options

```ts
{
  networkPassphrase?: string;  // Override network passphrase
  address?: string;            // Sign with a specific account (if multiple connected)
}
```

### `signBlob` Options

```ts
{
  accountToSign?: string;      // Sign with a specific account
}
```

## Basic Example

```tsx
import { useFreighter } from "stellar-hooks";

function WalletButton() {
  const {
    isInstalled,
    isConnected,
    publicKey,
    isLoading,
    error,
    connect,
    disconnect,
  } = useFreighter();

  if (!isInstalled) {
    return (
      <p>
        Please install <a href="https://freighter.app">Freighter</a> to continue.
      </p>
    );
  }

  if (!isConnected) {
    return (
      <button onClick={connect} disabled={isLoading}>
        {isLoading ? "Connecting..." : "Connect Freighter"}
      </button>
    );
  }

  return (
    <div>
      <p>Connected: {publicKey}</p>
      {error && <p style={{ color: "red" }}>Error: {error.message}</p>}
      <button onClick={disconnect}>Disconnect</button>
    </div>
  );
}
```

## Signing Examples

### Sign a Transaction

```tsx
import { TransactionBuilder, Asset, Operation } from "@stellar/stellar-sdk";
import { useFreighter } from "stellar-hooks";

function SendPayment() {
  const { publicKey, signTransaction } = useFreighter();

  async function handleSend() {
    // 1. Build the transaction (using Horizon or custom logic)
    const tx = new TransactionBuilder(sourceAccount, {
      fee: "100",
      networkPassphrase: "Test SDF Network ; September 2015",
    })
      .addOperation(
        Operation.payment({
          destination: "GBXXX...",
          asset: Asset.native(),
          amount: "10",
        })
      )
      .setTimeout(60)
      .build();

    // 2. Sign via Freighter
    const signedXdr = await signTransaction(tx.toXDR());

    // 3. Submit (using useTransaction or Horizon directly)
    console.log("Signed XDR:", signedXdr);
  }

  return <button onClick={handleSend}>Send 10 XLM</button>;
}
```

### Sign a Blob (Arbitrary Data)

```tsx
import { useFreighter } from "stellar-hooks";

function SignMessage() {
  const { signBlob, publicKey } = useFreighter();

  async function handleSign() {
    const message = "Hello, Stellar!";
    const base64Message = btoa(message);
    
    const signature = await signBlob(base64Message);
    console.log("Signature:", signature);
  }

  return <button onClick={handleSign}>Sign Message</button>;
}
```

## Notes

- **Session Persistence**: The hook checks for an existing connection on mount and restores it automatically from `localStorage`.
- **Wallet Changes**: The hook does **not** automatically react to account or network switches in Freighter by default. If you need live updates, you can poll or listen to Freighter events manually (Freighter v6+ emits custom events).
- **Error Handling**: If `signTransaction` or `signBlob` fails (user rejects, network mismatch, etc.), the promise rejects and the error is captured in the `error` property.
- **Multiple Accounts**: If the user has multiple accounts in Freighter, `publicKey` reflects the currently active one. Use the `address` option in `signTransaction` to sign with a specific account.

## Type Definitions

```ts
interface UseFreighterReturn {
  isInstalled: boolean;
  isConnected: boolean;
  publicKey: string | null;
  network: string | null;
  networkPassphrase: string | null;
  isLoading: boolean;
  error: Error | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  signTransaction: (xdr: string, opts?: SignTransactionOptions) => Promise<string>;
  signAuthEntry: (entryPreimageXdr: string) => Promise<string>;
  signBlob: (blob: string, opts?: { accountToSign?: string }) => Promise<string>;
}

interface SignTransactionOptions {
  networkPassphrase?: string;
  address?: string;
}
```

## See Also

- [usePayment](/api/hooks/use-payment) — Higher-level hook for sending payments without manual transaction building
- [useSorobanContract](/api/hooks/use-soroban-contract) — Handles contract call signing internally
- [useTransaction](/api/hooks/use-transaction) — Submit and poll signed transactions
