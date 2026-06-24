# Provider & Context

Configuration and context management for stellar-hooks.

## StellarProvider

The root provider component that configures network settings for all hooks in your application.

### Props

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `network` | `"testnet"` \| `"mainnet"` \| `"futurenet"` \| `"custom"` | No | `"testnet"` | Built-in network preset or custom deployment |
| `customConfig` | `CustomNetworkConfig` | Only if `network="custom"` | — | Horizon URL, Soroban RPC URL, and network passphrase for custom networks |
| `children` | `React.ReactNode` | Yes | — | Your application components |

### Example

```tsx
import { StellarProvider } from "stellar-hooks";

// Testnet (default)
<StellarProvider network="testnet">
  <App />
</StellarProvider>

// Mainnet
<StellarProvider network="mainnet">
  <App />
</StellarProvider>

// Custom network
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

## useNetwork

Access the current network configuration.

### Returns

| Property | Type | Description |
|---|---|---|
| `network` | `StellarNetwork` | Current network: `"testnet"`, `"mainnet"`, `"futurenet"`, or `"custom"` |
| `networkPassphrase` | `string` | Network passphrase used for signing transactions |
| `horizonUrl` | `string` | Horizon REST API endpoint URL |
| `sorobanRpcUrl` | `string` | Soroban RPC endpoint URL |
| `config` | `NetworkConfig` | Full configuration object |
| `switchNetwork` | `(network, customConfig?) => void` | Programmatically switch networks |

### Example

```tsx
import { useNetwork } from "stellar-hooks";

function NetworkDisplay() {
  const { network, horizonUrl, networkPassphrase } = useNetwork();

  return (
    <div>
      <p>Current network: {network}</p>
      <p>Horizon: {horizonUrl}</p>
      <p>Passphrase: {networkPassphrase}</p>
    </div>
  );
}
```

## Type Definitions

### NetworkConfig

```ts
interface NetworkConfig {
  network: StellarNetwork;
  horizonUrl: string;
  sorobanRpcUrl: string;
  networkPassphrase: string;
}
```

### CustomNetworkConfig

```ts
interface CustomNetworkConfig {
  network: "custom";
  horizonUrl: string;
  sorobanRpcUrl: string;
  networkPassphrase: string;
}
```

### Built-in Network Configurations

You can import the built-in configurations for use outside React components:

```tsx
import { NETWORK_CONFIGS } from "stellar-hooks";

const { horizonUrl, sorobanRpcUrl, networkPassphrase } = NETWORK_CONFIGS.mainnet;
```

Available presets:
- `NETWORK_CONFIGS.mainnet` — Public Global Stellar Network
- `NETWORK_CONFIGS.testnet` — Test SDF Network
- `NETWORK_CONFIGS.futurenet` — Test SDF Future Network

## Context Value

The internal context (typically not used directly) provides:

```ts
interface StellarContextValue {
  config: NetworkConfig;
  network: StellarNetwork;
}
```

All hooks consume this context automatically — you don't need to access it manually unless building custom hooks.

## Common Patterns

### Switching Networks Programmatically

```tsx
import { useNetwork } from "stellar-hooks";

function NetworkSwitcher() {
  const { network, switchNetwork } = useNetwork();

  return (
    <div>
      <p>Current: {network}</p>
      <button onClick={() => switchNetwork("testnet")}>Testnet</button>
      <button onClick={() => switchNetwork("mainnet")}>Mainnet</button>
      <button onClick={() => switchNetwork("futurenet")}>Futurenet</button>
    </div>
  );
}
```

### Network Persistence

The provider automatically persists the selected network to `localStorage` and restores it on page reload.

### Multiple Providers

You can nest providers to use different networks in different parts of your app:

```tsx
<StellarProvider network="mainnet">
  <MainnetDashboard />
  <StellarProvider network="testnet">
    <TestnetPlayground />
  </StellarProvider>
</StellarProvider>
```

The innermost provider takes precedence for any hooks inside it.
