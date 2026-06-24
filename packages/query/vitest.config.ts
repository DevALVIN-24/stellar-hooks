import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
  resolve: {
    alias: {
      "stellar-hooks": path.resolve(__dirname, "../../src/index.ts"),
      "@stellar/freighter-api": path.resolve(
        __dirname,
        "../../src/__mocks__/@stellar/freighter-api.ts"
      ),
    },
  },
});
