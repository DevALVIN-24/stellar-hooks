/**
 * @file StellarProvider.test.tsx
 * @description Integration tests for StellarProvider network config propagation.
 * @package stellar-hooks
 * @license MIT
 */

import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { StellarProvider, useStellarContext } from "../context";
import { NETWORK_CONFIGS } from "../types";
import type { CustomNetworkConfig } from "../types";

const TEST_CUSTOM_CONFIG: CustomNetworkConfig = {
  network: "custom",
  horizonUrl: "https://my-horizon.example.com",
  sorobanRpcUrl: "https://my-rpc.example.com",
  networkPassphrase: "My Custom Network ; 2024",
};

const NETWORK_STORAGE_KEY = "stellar-hooks:network";
const CUSTOM_CONFIG_STORAGE_KEY = "stellar-hooks:custom-config";

function renderWithProvider(
  providerProps: Record<string, unknown> = {}
) {
  return renderHook(() => useStellarContext(), {
    wrapper: ({ children }) => (
      <StellarProvider {...providerProps}>{children}</StellarProvider>
    ),
  });
}

describe("StellarProvider", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("network config propagation", () => {
    it("defaults to testnet when no network prop is provided", () => {
      const { result } = renderWithProvider();

      expect(result.current.network).toBe("testnet");
      expect(result.current.config).toEqual(NETWORK_CONFIGS.testnet);
    });

    it("propagates mainnet config when network='mainnet'", () => {
      const { result } = renderWithProvider({ network: "mainnet" });

      expect(result.current.network).toBe("mainnet");
      expect(result.current.config).toEqual(NETWORK_CONFIGS.mainnet);
    });

    it("propagates futurenet config when network='futurenet'", () => {
      const { result } = renderWithProvider({ network: "futurenet" });

      expect(result.current.network).toBe("futurenet");
      expect(result.current.config).toEqual(NETWORK_CONFIGS.futurenet);
    });

    it("propagates custom config when network='custom' with customConfig", () => {
      const { result } = renderWithProvider({
        network: "custom",
        customConfig: TEST_CUSTOM_CONFIG,
      });

      expect(result.current.network).toBe("custom");
      expect(result.current.config).toEqual(TEST_CUSTOM_CONFIG);
    });
  });

  describe("switchNetwork", () => {
    it("switches to mainnet and updates the config", () => {
      const { result } = renderWithProvider({ network: "testnet" });

      act(() => {
        result.current.switchNetwork("mainnet");
      });

      expect(result.current.network).toBe("mainnet");
      expect(result.current.config).toEqual(NETWORK_CONFIGS.mainnet);
    });

    it("switches to a custom network with the provided config", () => {
      const { result } = renderWithProvider({ network: "testnet" });

      act(() => {
        result.current.switchNetwork("custom", TEST_CUSTOM_CONFIG);
      });

      expect(result.current.network).toBe("custom");
      expect(result.current.config).toEqual(TEST_CUSTOM_CONFIG);
    });

    it("persists the selected network to localStorage", () => {
      const { result } = renderWithProvider({ network: "testnet" });

      act(() => {
        result.current.switchNetwork("futurenet");
      });

      expect(localStorage.getItem(NETWORK_STORAGE_KEY)).toBe("futurenet");
    });
  });

  describe("localStorage hydration", () => {
    it("restores a saved preset network on mount", () => {
      localStorage.setItem(NETWORK_STORAGE_KEY, "mainnet");

      const { result } = renderWithProvider({ network: "testnet" });

      expect(result.current.network).toBe("mainnet");
      expect(result.current.config).toEqual(NETWORK_CONFIGS.mainnet);
    });

    it("restores a saved custom network config on mount", () => {
      localStorage.setItem(NETWORK_STORAGE_KEY, "custom");
      localStorage.setItem(
        CUSTOM_CONFIG_STORAGE_KEY,
        JSON.stringify(TEST_CUSTOM_CONFIG)
      );

      const { result } = renderWithProvider({ network: "testnet" });

      expect(result.current.network).toBe("custom");
      expect(result.current.config).toEqual(TEST_CUSTOM_CONFIG);
    });

    it("does not restore from localStorage when no saved values exist", () => {
      const { result } = renderWithProvider({ network: "futurenet" });

      expect(result.current.network).toBe("futurenet");
      expect(result.current.config).toEqual(NETWORK_CONFIGS.futurenet);
    });

    it("gracefully handles corrupted JSON in custom config storage", () => {
      localStorage.setItem(NETWORK_STORAGE_KEY, "custom");
      localStorage.setItem(CUSTOM_CONFIG_STORAGE_KEY, "not-valid-json");

      const { result } = renderWithProvider({ network: "testnet" });

      // network is restored as "custom" from localStorage, but parsing the
      // custom config fails → config falls back to the testnet preset
      expect(result.current.network).toBe("custom");
      expect(result.current.config).toEqual(NETWORK_CONFIGS.testnet);
    });
  });

  describe("error handling", () => {
    it("throws when useStellarContext is used outside StellarProvider", () => {
      expect(() => renderHook(() => useStellarContext())).toThrow(
        "[stellar-hooks] useStellarContext must be used inside <StellarProvider>."
      );
    });
  });
});
