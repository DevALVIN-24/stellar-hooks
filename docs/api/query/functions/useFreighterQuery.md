[**@stellar-hooks/query v0.1.0**](../README.md)

***

[@stellar-hooks/query](../README.md) / useFreighterQuery

# Function: useFreighterQuery()

> **useFreighterQuery**(`options?`): \{ `freighterState`: \{ \}; \} \| \{ `freighterState`: \{ \}; \} \| \{ `freighterState`: \{ \}; \} \| \{ `freighterState`: \{ \}; \}

React Query adapter for useFreighter — wraps the Freighter connect logic in useMutation.

## Parameters

### options?

[`UseFreighterQueryOptions`](../interfaces/UseFreighterQueryOptions.md)

## Returns

\{ `freighterState`: \{ \}; \} \| \{ `freighterState`: \{ \}; \} \| \{ `freighterState`: \{ \}; \} \| \{ `freighterState`: \{ \}; \}

## Example

```tsx
const { mutate: connect, isPending, isError } = useFreighterQuery();

return (
  <>
    <button onClick={() => connect()} disabled={isPending}>
      {isPending ? "Connecting..." : "Connect Wallet"}
    </button>
    {isError && <p>Failed to connect</p>}
  </>
);
```
