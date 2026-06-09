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
];

export default config;
