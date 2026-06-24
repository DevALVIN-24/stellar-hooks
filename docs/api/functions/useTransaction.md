[**stellar-hooks v0.1.0**](../README.md)

***

[stellar-hooks](../README.md) / useTransaction

# Function: useTransaction()

> **useTransaction**(`options?`): `UseTransactionReturn`

Submit a pre-signed transaction XDR and poll until it is confirmed.
Works with both Soroban (RPC) and classic Stellar (Horizon) transactions.

## Parameters

### options?

`UseTransactionOptions` = `{}`

## Returns

`UseTransactionReturn`

## Example

```tsx
const { submit, status, hash, isLoading } = useTransaction();

async function handleSend() {
  const signedXdr = await freighter.signTransaction(builtXdr);
  await submit(signedXdr);
}
```
