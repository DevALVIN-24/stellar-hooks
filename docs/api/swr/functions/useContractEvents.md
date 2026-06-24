[**@stellar-hooks/swr v0.1.0**](../README.md)

***

[@stellar-hooks/swr](../README.md) / useContractEvents

# Function: useContractEvents()

> **useContractEvents**(`options`): `any`

Fetches Soroban contract events via the `getEvents` RPC endpoint,
powered by SWR.

Use SWR's `refreshInterval` option for polling.

## Parameters

### options

[`UseContractEventsSWROptions`](../interfaces/UseContractEventsSWROptions.md)

## Returns

`any`

## Example

```tsx
const { data: events, isLoading } = useContractEvents({
  contractId: "CXXX...",
  topics: [["AAAADwAAAAh0cmFuc2Zlcg=="]],
  refreshInterval: 5000,
});
```
