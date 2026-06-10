import nickTwoBadFourU from "eslint-config-nick2bad4u";

/** @type {import("eslint").Linter.Config[]} */
const config = [
    ...nickTwoBadFourU.configs.all,

    {
        files: ["metadata/themes.json"],
        name: "Generated theme metadata manifest",
        rules: {
            "json/sort-keys": "off",
        },
    },

    {
        files: ["docs/app.js"],
        name: "Static GitHub Pages browser app",
        rules: {
            "import-x/unambiguous": "off",
            "listeners/no-inline-function-event-listener": "off",
            "listeners/no-missing-remove-event-listener": "off",
            "perfectionist/sort-modules": "off",
            "unicorn/prefer-top-level-await": "off",
        },
    },

    {
        files: ["docs/index.html"],
        name: "Static GitHub Pages HTML shell",
        rules: {
            "@html-eslint/no-extra-spacing-tags": "off",
        },
    },

    {
        files: ["bin/codex-terminal-themes.mjs"],
        name: "Published CLI executable",
        rules: {
            "n/no-process-env": "off",
            "promise/always-return": "off",
            "unicorn/prefer-top-level-await": "off",
        },
    },

    {
        files: ["src/cli.mjs"],
        name: "Published CLI implementation",
        rules: {
            "@typescript-eslint/no-dynamic-delete": "off",
            "@typescript-eslint/no-unsafe-argument": "off",
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/no-unsafe-return": "off",
            "@typescript-eslint/return-await": "off",
            "de-morgan/no-negated-conjunction": "off",
            "jsdoc/no-undefined-types": "off",
            "jsdoc/valid-types": "off",
            "listeners/no-inline-function-event-listener": "off",
            "listeners/no-missing-remove-event-listener": "off",
            "no-await-in-loop": "off",
            "perfectionist/sort-modules": "off",
            "security/detect-non-literal-fs-filename": "off",
            "unicorn/no-await-expression-member": "off",
            "unicorn/prefer-switch": "off",
            "unicorn/prefer-type-error": "off",
        },
    },

    {
        files: ["test/**/*.mjs"],
        name: "CLI tests",
        rules: {
            "@typescript-eslint/no-unsafe-argument": "off",
            "n/no-process-env": "off",
            "test-signal/require-negative-path": "off",
        },
    },
];

export default config;
