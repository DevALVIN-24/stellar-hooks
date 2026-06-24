# useNetwork

Access the current network configuration from the `<StellarProvider>`.

## Overview

Provides read access to the active network settings and a method to programmatically switch networks.

## Import

```tsx
import { useNetwork } from "stellar-hooks";
```

## Parameters

None. This hook takes no parameters.

## Return Value

| Property | Type | Description |
|---|---|---|---|
| `network` | `StellarNetwork` | Current network: `"testnet"`, `"mainnet"`, `"futurenet"`, or `"custom"` |
| `networkPassphrase` | `string` | Network passphrase for transaction signing |
| `horizonUrl` | `string` | Horizon REST API endpoint URL |
| `sorobanRpcUrl` | `string` | Soroban RPC endpoint URL |
| `config` | `NetworkConfig` | Full configuration object |
| `switchNetwork` | `(network, customConfig?) => void` | Programmatically change networks |

## Basic Example

```tsx
import { useNetwork } from "stellar-hooks";

function NetworkDisplay() {
  const { network, horizonUrl, networkPassphrase } = useNetwork();

  return (
    <div>
      <h3>Current Network: {network}</h3>
      <p>Horizon: {horizonUrl}</p>
      <p>Passphrase: {networkPassphrase}</p>
    </div>
  );
}
```

## Network Switcher Example

```tsx
import { useNetwork } from "stellar-hooks";

function NetworkSwitcher() {
  const { network, switchNetwork } = useNetwork();

  return (
    <div>
      <p>Active: {network}</p>
      <button onClick={() => switchNetwork("testnet")}>Testnet</button>
      <button onClick={() => switchNetwork("mainnet")}>Mainnet</button>
      <button onClick={() => switchNetwork("futurenet")}>Futurenet</button>
    </div>
  );
}
```

## Notes

- **Persistence**: Network selection is persisted to `localStorage` automatically.
- **Provider Required**: This hook must be used inside a `<StellarProvider>`.

## See Also

- [Provider & Context](/api/provider) — Full provider documentation
