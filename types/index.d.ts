export type ThemeAppearance = "dark" | "light" | "unknown";

export interface ThemeColors {
    readonly background: null | string;
    readonly caret: null | string;
    readonly foreground: null | string;
    readonly invisibles: null | string;
    readonly lineHighlight: null | string;
    readonly selection: null | string;
}

export interface ThemeMetadata {
    readonly appearance: ThemeAppearance;
    readonly author: null | string;
    readonly colors: ThemeColors;
    readonly colorSpace: null | string;
    readonly fileName: string;
    readonly id: string;
    readonly name: string;
    readonly path: string;
    readonly scopes: readonly string[];
    readonly semanticClass: null | string;
    readonly statistics: ThemeStatistics;
    readonly uuid: string;
}

export interface ThemeMetadataManifest {
    readonly $schema: "./themes.schema.json";
    readonly consumers: readonly string[];
    readonly description: string;
    readonly duplicateUuidGroups: Readonly<Record<string, readonly string[]>>;
    readonly generatedBy: "npm run metadata:write";
    readonly name: "codex-terminal-themes";
    readonly schemaVersion: 1;
    readonly themeCount: number;
    readonly themeDirectory: "themes";
    readonly themes: readonly ThemeMetadata[];
}

export interface ThemeStatistics {
    readonly colorReferences: number;
    readonly scopedSettings: number;
    readonly settings: number;
    readonly uniqueScopes: number;
}

declare const manifest: ThemeMetadataManifest;

export default manifest;
