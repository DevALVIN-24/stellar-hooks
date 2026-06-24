[**stellar-hooks v0.1.0**](../README.md)

***

[stellar-hooks](../README.md) / useSorobanTokenBalance

# Function: useSorobanTokenBalance()

> **useSorobanTokenBalance**(`contractId`, `accountAddress`, `options?`): [`SorobanTokenBalanceState`](../interfaces/SorobanTokenBalanceState.md)

Read a SAC (Stellar Asset Contract) or any SEP-41-compatible token balance
for a given account by calling the `balance(address)` contract method via
Soroban RPC simulation — no transaction signing required.

## Parameters

### contractId

`string` \| `null` \| `undefined`

The SAC / token contract address (C...).

### accountAddress

`string` \| `null` \| `undefined`

The account whose balance to query (G...).

### options?

[`UseSorobanTokenBalanceOptions`](../interfaces/UseSorobanTokenBalanceOptions.md) = `{}`

Optional configuration.

## Returns

[`SorobanTokenBalanceState`](../interfaces/SorobanTokenBalanceState.md)

## Example

```tsx
const { balance, formatted, isLoading } = useSorobanTokenBalance(
  "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC", // USDC SAC on testnet
  publicKey,
);

return <p>Balance: {formatted ?? "…"} USDC</p>;
```
