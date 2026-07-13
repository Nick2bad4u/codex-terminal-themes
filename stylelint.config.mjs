import sharedConfig from "stylelint-config-nick2bad4u";

/** @type {import("stylelint").Config} */
const config = {
    ...sharedConfig,
    rules: {
        ...sharedConfig.rules,
        "color-no-invalid-hex": true,
        "declaration-block-no-duplicate-properties": true,
        "font-family-no-duplicate-names": true,
        "no-descending-specificity": null,
        "property-no-unknown": true,
        "selector-type-no-unknown": true,
    },
};

export default config;
