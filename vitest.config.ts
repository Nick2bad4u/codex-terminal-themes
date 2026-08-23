import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        coverage: {
            clean: true,
            include: ["src/cli.ts"],
            provider: "v8",
            reporter: ["text", "lcov"],
            reportsDirectory: "coverage",
            thresholds: {
                branches: 50,
                functions: 60,
                lines: 58,
                statements: 58,
            },
        },
        environment: "node",
        restoreMocks: true,
        slowTestThreshold: 1000,
    },
});
