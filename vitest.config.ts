import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    alias: {
      "@stellar/freighter-api": new URL(
        "./src/__mocks__/@stellar/freighter-api.ts",
        import.meta.url
      ).pathname,
      "@creit-tech/stellar-wallets-kit/sdk": new URL(
        "./src/__mocks__/@creit-tech/stellar-wallets-kit-sdk.ts",
        import.meta.url
      ).pathname,
      "@walletconnect/sign-client": new URL(
        "./src/__mocks__/@walletconnect/sign-client.ts",
        import.meta.url
      ).pathname,
    },
  },
});
