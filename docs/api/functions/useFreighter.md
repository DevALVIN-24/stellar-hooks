[**stellar-hooks v0.1.0**](../README.md)

***

[stellar-hooks](../README.md) / useFreighter

# Function: useFreighter()

> **useFreighter**(): [`UseFreighterReturn`](../interfaces/UseFreighterReturn.md)

Connect to and interact with the Freighter browser wallet.

## Returns

[`UseFreighterReturn`](../interfaces/UseFreighterReturn.md)

## Example

```tsx
const { isConnected, publicKey, connect } = useFreighter();

if (!isConnected) return <button onClick={connect}>Connect Wallet</button>;
return <p>Connected: {publicKey}</p>;
```
