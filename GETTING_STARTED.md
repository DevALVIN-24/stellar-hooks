# Getting Started with stellar-hooks

Build a Stellar dApp in minutes. This guide walks you through installing the library, setting up your first dApp, and using all the core hooks.

## Installation

```bash
npm install stellar-hooks
```

Requirements:
- React ≥ 18
- react-dom ≥ 18
- [Freighter wallet](https://freighter.app) browser extension (for wallet interactions)

The library includes `@stellar/stellar-sdk` v13 and `@stellar/freighter-api` v2 as dependencies.

## 5-Minute Setup

### 1. Wrap your app with `StellarProvider`

```tsx
// main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { StellarProvider } from "stellar-hooks";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <StellarProvider network="testnet">
      <App />
    </StellarProvider>
  </React.StrictMode>
);
```

### 2. Connect to Freighter and fetch balances

```tsx
// App.tsx
import { useFreighter, useStellarBalance } from "stellar-hooks";

export default function App() {
  const { isConnected, publicKey, connect } = useFreighter();
  const { xlmBalance, isLoading } = useStellarBalance(publicKey || "");

  if (!isConnected) {
    return <button onClick={connect}>Connect Freighter</button>;
  }

  return (
    <div>
      <p>Connected: {publicKey}</p>
      <p>XLM Balance: {isLoading ? "…" : xlmBalance?.balance}</p>
    </div>
  );
}
```

Done. Your dApp is live.

---

## Complete Working dApp Example

This example demonstrates:
- ✅ Wallet connection
- ✅ Fetching account balances
- ✅ Calling a Soroban contract
- ✅ Sending payments
- ✅ Automatic polling and error handling

### Project Setup

```bash
npm create vite@latest stellar-dapp -- --template react-ts
cd stellar-dapp
npm install stellar-hooks
npm run dev
```

### File Structure

```
src/
├── main.tsx
├── App.tsx
├── components/
│   ├── WalletConnect.tsx
│   ├── AccountBalance.tsx
│   ├── ContractCall.tsx
│   └── PaymentForm.tsx
└── config.ts
```

### 1. Config

```tsx
// src/config.ts
// Replace with your deployed contract ID from testnet
export const COUNTER_CONTRACT_ID = "CABC...XYZ";

export const TESTNET_CONFIG = {
  network: "testnet" as const,
  horizonUrl: "https://horizon-testnet.stellar.org",
  sorobanRpcUrl: "https://soroban-testnet.stellar.org",
};
```

### 2. Entry point

```tsx
// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { StellarProvider } from "stellar-hooks";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <StellarProvider network="testnet">
      <App />
    </StellarProvider>
  </React.StrictMode>
);
```

### 3. Main App Component

```tsx
// src/App.tsx
import { useFreighter } from "stellar-hooks";
import WalletConnect from "./components/WalletConnect";
import AccountBalance from "./components/AccountBalance";
import ContractCall from "./components/ContractCall";
import PaymentForm from "./components/PaymentForm";

export default function App() {
  const { isConnected, publicKey } = useFreighter();

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "2rem" }}>
      <h1>💫 Stellar dApp</h1>

      <WalletConnect />

      {isConnected && publicKey && (
        <>
          <AccountBalance publicKey={publicKey} />
          <ContractCall />
          <PaymentForm />
        </>
      )}
    </div>
  );
}
```

### 4. Components

**WalletConnect.tsx** — Handle connection/disconnection

```tsx
// src/components/WalletConnect.tsx
import { useFreighter } from "stellar-hooks";

export default function WalletConnect() {
  const { isInstalled, isConnected, publicKey, isLoading, error, connect, disconnect } =
    useFreighter();

  if (!isInstalled) {
    return (
      <div style={{ padding: "1rem", background: "#fee", borderRadius: 4 }}>
        <p>⚠️ Freighter wallet not detected.</p>
        <a href="https://freighter.app" target="_blank">
          Install Freighter
        </a>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <button
        onClick={connect}
        disabled={isLoading}
        style={{ padding: "0.5rem 1rem", cursor: isLoading ? "not-allowed" : "pointer" }}
      >
        {isLoading ? "Connecting…" : "Connect Freighter"}
      </button>
    );
  }

  return (
    <div style={{ padding: "1rem", background: "#efe", borderRadius: 4, marginBottom: "1rem" }}>
      <p>✅ Connected: <code>{publicKey}</code></p>
      <button onClick={disconnect}>Disconnect</button>
      {error && <p style={{ color: "red" }}>{error.message}</p>}
    </div>
  );
}
```

**AccountBalance.tsx** — Display balances with auto-polling

```tsx
// src/components/AccountBalance.tsx
import { useStellarBalance } from "stellar-hooks";

export default function AccountBalance({ publicKey }: { publicKey: string }) {
  const { xlmBalance, balances, isLoading, refetch } = useStellarBalance(publicKey, {
    refetchInterval: 10_000, // Poll every 10 seconds
  });

  return (
    <section style={{ marginBottom: "2rem", padding: "1rem", border: "1px solid #ccc" }}>
      <h2>💰 Balances</h2>
      {isLoading ? (
        <p>Loading…</p>
      ) : (
        <>
          <p>
            <strong>XLM:</strong> {xlmBalance?.balance || "0"} ✓
          </p>
          {balances.length > 1 && (
            <details>
              <summary>Other assets ({balances.length - 1})</summary>
              <ul>
                {balances
                  .filter((b) => !b.isNative)
                  .map((b, i) => (
                    <li key={i}>
                      {b.assetCode}/{b.assetIssuer?.slice(0, 12)}… — {b.balance}
                    </li>
                  ))}
              </ul>
            </details>
          )}
        </>
      )}
      <button onClick={refetch} style={{ marginTop: "0.5rem" }}>
        🔄 Refresh
      </button>
    </section>
  );
}
```

**ContractCall.tsx** — Call a Soroban contract

```tsx
// src/components/ContractCall.tsx
import { useSorobanContract } from "stellar-hooks";
import { nativeToScVal } from "@stellar/stellar-sdk";
import { COUNTER_CONTRACT_ID } from "../config";

export default function ContractCall() {
  const { call, status, result, error, reset } = useSorobanContract({
    contractId: COUNTER_CONTRACT_ID,
    method: "increment",
    args: [nativeToScVal(1, { type: "u32" })],
  });

  if (!COUNTER_CONTRACT_ID || COUNTER_CONTRACT_ID === "CABC...XYZ") {
    return (
      <section style={{ marginBottom: "2rem", padding: "1rem", background: "#ffd" }}>
        <h2>⚡ Soroban Contract</h2>
        <p>⚠️ Update <code>COUNTER_CONTRACT_ID</code> in config.ts with your contract ID.</p>
      </section>
    );
  }

  return (
    <section style={{ marginBottom: "2rem", padding: "1rem", border: "1px solid #ccc" }}>
      <h2>⚡ Soroban Contract Call</h2>
      <p>Status: <strong>{status}</strong></p>
      {result && <p>✅ Result: {result.toString()}</p>}
      {error && <p style={{ color: "red" }}>❌ {error.message}</p>}
      <button
        onClick={() => call()}
        disabled={status !== "idle" && status !== "error"}
        style={{
          padding: "0.5rem 1rem",
          cursor: status === "idle" || status === "error" ? "pointer" : "not-allowed",
        }}
      >
        {status === "idle" ? "Call Contract" : `${status}…`}
      </button>
      {status !== "idle" && (
        <button onClick={reset} style={{ marginLeft: "0.5rem" }}>
          Clear
        </button>
      )}
    </section>
  );
}
```

**PaymentForm.tsx** — Send XLM payments

```tsx
// src/components/PaymentForm.tsx
import { useState } from "react";
import { usePayment } from "stellar-hooks";

export default function PaymentForm() {
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("1");
  const [memo, setMemo] = useState("");

  const { submit, status, hash, isLoading, error, reset } = usePayment({
    destination,
    asset: { type: "native" },
    amount,
    memo,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination || !amount) return;
    await submit();
  };

  return (
    <section style={{ marginBottom: "2rem", padding: "1rem", border: "1px solid #ccc" }}>
      <h2>📤 Send Payment</h2>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <input
          type="text"
          placeholder="Destination address (G...)"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Amount (XLM)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          step="0.0000001"
          min="0"
          required
        />
        <input
          type="text"
          placeholder="Memo (optional, max 28 bytes)"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          maxLength={28}
        />

        <button
          type="submit"
          disabled={isLoading || !destination || !amount}
          style={{
            padding: "0.5rem 1rem",
            cursor: isLoading ? "not-allowed" : "pointer",
          }}
        >
          {isLoading ? `${status}…` : "Send XLM"}
        </button>
      </form>

      {hash && <p style={{ color: "green" }}>✅ Sent! Hash: {hash.slice(0, 16)}…</p>}
      {error && <p style={{ color: "red" }}>❌ {error.message}</p>}

      {status !== "idle" && (
        <button onClick={reset} style={{ marginTop: "0.5rem" }}>
          Reset
        </button>
      )}
    </section>
  );
}
```

### 5. Styling (optional)

```css
/* src/index.css */
* {
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: #f5f5f5;
  margin: 0;
  padding: 0;
}

button {
  font-size: 1rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  background: #007acc;
  color: white;
  cursor: pointer;
  transition: background 0.2s;
}

button:hover:not(:disabled) {
  background: #005a9e;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

input {
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

section {
  background: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

code {
  background: #f0f0f0;
  padding: 0.2em 0.4em;
  border-radius: 2px;
  font-size: 0.9em;
}
```

## Running the Example

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

1. Install [Freighter](https://freighter.app)
2. Create or import a testnet account
3. Click "Connect Freighter"
4. View your balance (auto-refreshes every 10s)
5. Request testnet XLM at [stellar.org/developers/testnet](https://developers.stellar.org/docs/tutorials/create-account)
6. Try sending a payment
7. Deploy a contract and update `COUNTER_CONTRACT_ID` to test contract calls

## Common Tasks

### Polling for Changes

```tsx
const { data, refetch } = useStellarAccount(publicKey, {
  refetchInterval: 5000, // Poll every 5 seconds
});
```

### Custom Network

```tsx
<StellarProvider
  network="custom"
  customConfig={{
    network: "custom",
    horizonUrl: "https://my-horizon.example.com",
    sorobanRpcUrl: "https://my-rpc.example.com",
    networkPassphrase: "My Network ; 2024",
  }}
>
  <App />
</StellarProvider>
```

### Sign Arbitrary Data

```tsx
const { signBlob } = useFreighter();

const signature = await signBlob("hello world");
```

### Simulating a Transaction

All contract calls are simulated before signing. If simulation fails, the hook returns an error immediately.

```tsx
const { status, error } = useSorobanContract({
  contractId: "CA...",
  method: "transfer",
  args: [...],
  // Simulation happens automatically on mount
  // Errors appear immediately
});
```

## Troubleshooting

**"Freighter wallet not detected"**
- Install the [Freighter browser extension](https://freighter.app)
- Ensure you're on a supported network (testnet, mainnet, futurenet)

**"Network mismatch"**
- Check that your `<StellarProvider network>` matches Freighter's selected network
- Use testnet for development

**"Contract call fails in simulation"**
- Verify the contract ID is correct and deployed
- Check that contract arguments match the expected types
- View detailed errors in the browser console

**"Balance doesn't update"**
- Increase `refetchInterval` or click the manual refresh button
- Check your internet connection
- Verify the account address is valid

## Next Steps

- Read the [API documentation](./README.md) for all available hooks
- Explore [advanced patterns](#advanced-patterns) below
- Join the [Stellar Discord](https://discord.gg/stellar)

## Advanced Patterns

### Reading ledger entries directly

```tsx
import { useLedgerEntry } from "stellar-hooks";
import { xdr, Address, Contract } from "@stellar/stellar-sdk";

export function ReadCounter({ contractId }: { contractId: string }) {
  const key = xdr.LedgerKey.contractData(
    new xdr.LedgerKeyContractData({
      contract: new Address(contractId).toScAddress(),
      key: xdr.ScVal.scvSymbol("Counter"),
      durability: xdr.ContractDataDurability.persistent(),
    })
  );

  const { data, isLoading } = useLedgerEntry(key, {
    refetchInterval: 5000,
  });

  return <p>Counter: {data ? data.val.toString() : "…"}</p>;
}
```

### Read-only account fetching (no wallet required)

```tsx
// Works without Freighter or StellarProvider
const { data, isLoading } = useStellarAccount(
  "GBUQWP3BOUZX34ULNQG23RQ6F4YUSXHTGSNLAHBGTZW5FZK4QBY6MV7W"
);
```

### Signing outside React

For hardware wallets or server-side signing, sign the XDR manually and use `useTransaction`:

```tsx
const { submit, status } = useTransaction({ mode: "soroban" });

// Sign elsewhere
const signedXdr = await hardwareWallet.sign(unsignedXdr);

// Submit and poll
await submit(signedXdr);
```

## Support

- [GitHub Issues](https://github.com/dark-princezz/stellar-hooks/issues)
- [Stellar Developers Discord](https://discord.gg/stellar)
- [Stellar Documentation](https://developers.stellar.org)
