[**stellar-hooks v0.1.0**](../README.md)

***

[stellar-hooks](../README.md) / useSorobanContract

# Function: useSorobanContract()

> **useSorobanContract**\<`TResult`\>(`contractId`, `options`): [`UseContractCallReturn`](../interfaces/UseContractCallReturn.md)\<`TResult`\>

Invoke a Soroban smart-contract method. Handles simulation, auth, submission,
and status polling in one hook.

## Type Parameters

### TResult

`TResult` = `unknown`

## Parameters

### contractId

`string`

### options

`Omit`\<[`ContractCallOptions`](../interfaces/ContractCallOptions.md)\<`TResult`\>, `"contractId"`\>

## Returns

[`UseContractCallReturn`](../interfaces/UseContractCallReturn.md)\<`TResult`\>

## Example

```tsx
const { call, query, status, result } = useSorobanContract(
  "CABC...XYZ",
  {
    method: "increment",
    args: [nativeToScVal(1, { type: "u32" })],
  }
);

return (
  <button onClick={() => call()} disabled={status !== "idle" && status !== "error"}>
    {status === "success" ? `Done! Hash: ${hash}` : "Increment"}
  </button>
);
```
