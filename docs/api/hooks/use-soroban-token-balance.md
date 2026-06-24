# useSorobanTokenBalance

Read SAC (Stellar Asset Contract) or SEP-41-compatible token balances via Soroban RPC simulation.

## Overview

Queries a Soroban token contract's `balance(address)` method without requiring a signed transaction. Works for SAC tokens and any contract implementing the standard token interface.

## Import

```tsx
import { useSorobanTokenBalance } from "stellar-hooks";
```

## Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `contractId` | `string \| null \| undefined` | Yes | Token contract address (C...) |
| `accountAddress` | `string \| null \| undefined` | Yes | Account to query (G...) |
| `options` | `UseSorobanTokenBalanceOptions` | No | Configuration options |

### Options

| Option | Type | Default | Description |
|---|---|---|---|
| `enabled` | `boolean` | `true` | Whether to fetch automatically |
| `refetchInterval` | `number` | `0` | Polling interval in milliseconds |
| `decimals` | `number` | `7` | Decimal places for formatting (Stellar standard) |
| `cacheTTL` | `number` | `30000` | Cache time-to-live (30 seconds) |

## Return Value

| Property | Type | Description |
|---|---|---|---|
| `balance` | `bigint \| null` | Raw token balance as BigInt |
| `formatted` | `string \| null` | Human-readable balance with decimal places |
| `isLoading` | `boolean` | Whether fetch is in progress |
| `error` | `Error \| null` | Any error |
| `lastFetchedAt` | `Date \| null` | Last fetch timestamp |
| `refetch` | `() => Promise<void>` | Manually refetch |

## Basic Example

```tsx
import { useSorobanTokenBalance } from "stellar-hooks";

function TokenBalance({ publicKey }: { publicKey: string }) {
  const { balance, formatted, isLoading } = useSorobanTokenBalance(
    "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC", // USDC SAC on testnet
    publicKey
  );

  if (isLoading) return <p>Loading balance...</p>;
  return <p>USDC Balance: {formatted ?? "0.0000000"}</p>;
}
```

## Polling Example

```tsx
const { formatted } = useSorobanTokenBalance(contractId, publicKey, {
  refetchInterval: 5000, // poll every 5 seconds
});
```

## Notes

- **Simulation Only**: Uses `simulateTransaction` to read the balance without submitting a transaction or requiring wallet signing.
- **SAC Tokens**: Works with Stellar Asset Contracts, which wrap classic Stellar assets as Soroban tokens.
- **BigInt**: Raw balance is returned as `bigint` to preserve precision. Use `formatted` for display.

## See Also

- [useSorobanContract](/api/hooks/use-soroban-contract) — General contract interactions
- [useLedgerEntry](/api/hooks/use-ledger-entry) — Read raw ledger data
