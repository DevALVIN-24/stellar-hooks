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
    },
  },
});