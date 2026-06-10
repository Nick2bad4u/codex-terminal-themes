import nickTwoBadFourU from "eslint-config-nick2bad4u";

/** @type {import("eslint").Linter.Config[]} */
const config = [
    {
        ignores: ["dist/**", "docs/app.js"],
        name: "Generated build output",
    },

    ...nickTwoBadFourU.configs.all,

    {
        files: [
            "bin/**/*.ts",
            "docs/app.ts",
            "src/**/*.ts",
            "test/**/*.ts",
            "tools/**/*.ts",
        ],
        name: "Migrated TypeScript source",
        rules: {
            "@typescript-eslint/consistent-type-definitions": "off",
            "@typescript-eslint/no-base-to-string": "off",
            "@typescript-eslint/no-unsafe-argument": "off",
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/no-unsafe-call": "off",
            "@typescript-eslint/no-unsafe-member-access": "off",
            "@typescript-eslint/no-unsafe-return": "off",
            "@typescript-eslint/no-unsafe-type-assertion": "off",
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/no-use-before-define": "off",
            "@typescript-eslint/prefer-nullish-coalescing": "off",
            "@typescript-eslint/restrict-plus-operands": "off",
            "@typescript-eslint/restrict-template-expressions": "off",
            "@typescript-eslint/strict-boolean-expressions": "off",
            "jsdoc/no-undefined-types": "off",
            "jsdoc/valid-types": "off",
            "perfectionist/sort-union-types": "off",
            "runtime-cleanup/no-unmanaged-event-listeners": "off",
            "tsdoc/syntax": "off",
            "typedoc/no-duplicate-param-tags": "off",
            "typedoc/no-extra-param-tags": "off",
            "typedoc/require-exported-doc-comment-description": "off",
            "typedoc/require-throws-tag": "off",
            "typefest/prefer-ts-extras-array-first": "off",
            "typefest/prefer-ts-extras-array-includes": "off",
            "typefest/prefer-ts-extras-array-join": "off",
            "typefest/prefer-ts-extras-assert-defined": "off",
            "typefest/prefer-ts-extras-is-defined": "off",
            "typefest/prefer-ts-extras-is-empty": "off",
            "typefest/prefer-ts-extras-key-in": "off",
            "typefest/prefer-ts-extras-object-entries": "off",
            "typefest/prefer-ts-extras-object-has-own": "off",
            "typefest/prefer-ts-extras-safe-cast-to": "off",
            "typefest/prefer-ts-extras-set-has": "off",
            "typefest/prefer-ts-extras-string-split": "off",
        },
    },

    {
        files: ["metadata/themes.json"],
        name: "Generated theme metadata manifest",
        rules: {
            "json/sort-keys": "off",
        },
    },

    {
        files: ["docs/app.ts"],
        name: "Static GitHub Pages browser app source",
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
        files: ["bin/codex-terminal-themes.ts"],
        name: "Published CLI executable",
        rules: {
            "n/hashbang": "off",
            "n/no-process-env": "off",
            "promise/always-return": "off",
            "unicorn/prefer-top-level-await": "off",
        },
    },

    {
        files: ["src/cli.ts"],
        name: "Published CLI implementation",
        rules: {
            "@typescript-eslint/no-dynamic-delete": "off",
            "@typescript-eslint/no-unsafe-argument": "off",
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/no-unsafe-return": "off",
            "@typescript-eslint/prefer-readonly-parameter-types": "off",
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
        files: ["test/**/*.ts"],
        name: "CLI tests",
        rules: {
            "@typescript-eslint/no-unsafe-argument": "off",
            "n/no-process-env": "off",
            "test-signal/require-negative-path": "off",
            "vitest/prefer-expect-assertions": "off",
            "vitest/require-top-level-describe": "off",
        },
    },
];

export default config;
