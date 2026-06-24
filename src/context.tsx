/**
 * @file context.tsx
 * @description React Context and Provider for Stellar configuration.
 * @package stellar-hooks
 * @license MIT
 */

import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from "react";
import type { StellarContextValue, StellarProviderProps, StellarNetwork, CustomNetworkConfig, NetworkConfig } from "./types";
import { NETWORK_CONFIGS } from "./types";

const NETWORK_STORAGE_KEY = "stellar-hooks:network";
const CUSTOM_CONFIG_STORAGE_KEY = "stellar-hooks:custom-config";

interface StellarContextInternalValue extends StellarContextValue {
  switchNetwork: (newNetwork: StellarNetwork, newCustomConfig?: CustomNetworkConfig) => void;
}

const StellarContext = createContext<StellarContextInternalValue | null>(null);

/**
 * Wrap your app (or the portion that needs Stellar) with this provider.
 *
 * @example
 * ```tsx
 * <StellarProvider network="testnet">
 *   <App />
 * </StellarProvider>
 * ```
 */
export function StellarProvider({
  network: initialNetwork = "testnet",
  customConfig: initialCustomConfig,
  children,
}: StellarProviderProps) {
  const [network, setNetwork] = useState<StellarNetwork>(initialNetwork);
  const [customConfig, setCustomConfig] = useState<CustomNetworkConfig | null>(
    initialCustomConfig || null
  );

  useEffect(() => {
    const savedNetwork = localStorage.getItem(NETWORK_STORAGE_KEY) as StellarNetwork;
    if (savedNetwork) setNetwork(savedNetwork);

    const savedCustomConfig = localStorage.getItem(CUSTOM_CONFIG_STORAGE_KEY);
    if (savedCustomConfig) {
      try {
        setCustomConfig(JSON.parse(savedCustomConfig));
      } catch { /* ignore invalid JSON in localStorage */ }
    }
  }, []);

  const switchNetwork = useCallback((newNetwork: StellarNetwork, newCustomConfig?: CustomNetworkConfig) => {
    setNetwork(newNetwork);
    localStorage.setItem(NETWORK_STORAGE_KEY, newNetwork);

    if (newNetwork === "custom" && newCustomConfig) {
      setCustomConfig(newCustomConfig);
      localStorage.setItem(CUSTOM_CONFIG_STORAGE_KEY, JSON.stringify(newCustomConfig));
    }
  }, []);

  const config = useMemo<NetworkConfig>(() => {
    if (network === "custom" && customConfig) {
      return customConfig;
    }
    return NETWORK_CONFIGS[network as keyof typeof NETWORK_CONFIGS] || NETWORK_CONFIGS.testnet;
  }, [network, customConfig]);

  const value = useMemo<StellarContextInternalValue>(
    () => ({ config, network, switchNetwork }),
    [config, network, switchNetwork]
  );

  return (
    <StellarContext.Provider value={value}>{children}</StellarContext.Provider>
  );
}

/**
 * Optional context reader — returns null when rendered outside {@link StellarProvider}.
 */
export function useOptionalStellarContext(): StellarContextInternalValue | null {
  return useContext(StellarContext);
}

/**
 * Internal hook — consume the Stellar context inside other hooks.
 */
export function useStellarContext(): StellarContextInternalValue {
  const ctx = useContext(StellarContext);
  if (!ctx) {
    throw new Error(
      "[stellar-hooks] useStellarContext must be used inside <StellarProvider>."
    );
  }
  return ctx;
}
