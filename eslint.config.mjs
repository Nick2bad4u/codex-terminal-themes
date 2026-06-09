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
];

export default config;
