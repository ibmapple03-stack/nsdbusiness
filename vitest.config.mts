import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { testEnv } from "./tests/test-env";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(dirname, "src"),
      // `server-only` throws outside a React Server environment; tests run in Node.
      "server-only": path.resolve(dirname, "tests/stubs/empty.ts"),
    },
  },
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"],
    env: testEnv,
    globalSetup: ["tests/global-setup.ts"],
    // Integration tests share one database.
    fileParallelism: false,
    testTimeout: 20_000,
  },
});
