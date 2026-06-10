import { XMLParser } from "fast-xml-parser";
import { SyntaxValidator } from "fast-xml-validator";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import * as path from "node:path";

const rootDirectory = process.cwd();
const metadataDirectory = path.join(rootDirectory, "metadata");
const manifestPath = path.join(metadataDirectory, "themes.json");
const schemaPath = path.join(metadataDirectory, "themes.schema.json");
const themeDirectory = path.join(rootDirectory, "themes");
const shouldCheck = process.argv.includes("--check");
const shouldWrite = process.argv.includes("--write");

const parser = new XMLParser({
    ignoreAttributes: false,
    preserveOrder: true,
    trimValues: false,
});

/**
 * @typedef {{
 *     readonly background: string | null;
 *     readonly caret: string | null;
 *     readonly foreground: string | null;
 *     readonly invisibles: string | null;
 *     readonly lineHighlight: string | null;
 *     readonly selection: string | null;
 * }} ThemeColors
 *
 * @typedef {{
 *     readonly colorReferences: number;
 *     readonly scopedSettings: number;
 *     readonly settings: number;
 *     readonly uniqueScopes: number;
 * }} ThemeStatistics
 *
 * @typedef {{
 *     readonly appearance: "dark" | "light" | "unknown";
 *     readonly author: string | null;
 *     readonly colorSpace: string | null;
 *     readonly colors: ThemeColors;
 *     readonly fileName: string;
 *     readonly id: string;
 *     readonly name: string;
 *     readonly path: string;
 *     readonly scopes: readonly string[];
 *     readonly semanticClass: string | null;
 *     readonly statistics: ThemeStatistics;
 *     readonly uuid: string;
 * }} ThemeMetadata
 */

/**
 * @param {readonly ThemeMetadata[]} themes
 *
 * @returns {Record<string, readonly string[]>}
 */
function buildDuplicateUuidGroups(themes) {
    /** @type {Map<string, string[]>} */
    const groupedPaths = new Map();

    for (const theme of themes) {
        const existingPaths = groupedPaths.get(theme.uuid) ?? [];
        existingPaths.push(theme.path);
        groupedPaths.set(theme.uuid, existingPaths);
    }

    /** @type {Record<string, readonly string[]>} */
    const duplicateGroups = {};

    for (const [uuid, paths] of groupedPaths) {
        if (paths.length > 1) {
            duplicateGroups[uuid] = paths.toSorted((left, right) =>
                left.localeCompare(right)
            );
        }
    }

    return Object.fromEntries(
        Object.entries(duplicateGroups).toSorted(([left], [right]) =>
            left.localeCompare(right)
        )
    );
}

/**
 * @returns {Promise<Record<string, unknown>>}
 */
async function buildManifest() {
    const filePaths = await getThemeFiles(themeDirectory);
    const themes = await parseThemes(filePaths);
    const duplicateUuidGroups = buildDuplicateUuidGroups(themes);

    return {
        $schema: "./themes.schema.json",
        consumers: [
            "bat",
            "Codex terminal",
            "TextMate-compatible syntax highlighters",
        ],
        description:
            "Generated metadata for the TextMate themes in this repository.",
        duplicateUuidGroups,
        generatedBy: "npm run metadata:write",
        name: "codex-terminal-themes",
        schemaVersion: 1,
        themeCount: themes.length,
        themeDirectory: "themes",
        themes,
    };
}

/**
 * @param {string} color
 *
 * @returns {number | null}
 */
function calculateLuminance(color) {
    const parsedColor = parseColor(color);

    if (parsedColor === null) {
        return null;
    }

    const [
        red,
        green,
        blue,
    ] = parsedColor.map((channel) => {
        const normalizedChannel = channel / 255;
        return normalizedChannel <= 0.03928
            ? normalizedChannel / 12.92
            : ((normalizedChannel + 0.055) / 1.055) ** 2.4;
    });

    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

/**
 * @param {string} fileName
 *
 * @returns {string}
 */
function createThemeId(fileName) {
    const baseName = fileName.replace(/\.tmTheme$/v, "");
    const id = baseName
        .normalize("NFKD")
        .replaceAll(/[^\dA-Za-z]+/gv, "-")
        .replaceAll(/^-|-$/gv, "")
        .toLowerCase();

    return id.length > 0 ? id : "theme";
}

/**
 * @param {string | null} background
 *
 * @returns {"dark" | "light" | "unknown"}
 */
function detectAppearance(background) {
    if (background === null) {
        return "unknown";
    }

    const luminance = calculateLuminance(background);

    if (luminance === null) {
        return "unknown";
    }

    return luminance < 0.5 ? "dark" : "light";
}

/**
 * @param {Record<string, unknown>} record
 * @param {string} key
 *
 * @returns {readonly unknown[] | undefined}
 */
function getArrayProperty(record, key) {
    const value = record[key];
    return isUnknownArray(value) ? value : undefined;
}

/**
 * @param {string} manifestJson
 *
 * @returns {Promise<number>}
 */
async function getCheckExitCode(manifestJson) {
    const existingManifest = await readExistingManifest();

    if (existingManifest === manifestJson) {
        process.stdout.write("Theme metadata manifest is up to date.\n");
        return 0;
    }

    process.stderr.write(
        "Theme metadata manifest is stale. Run `npm run metadata:write`.\n"
    );
    return 1;
}

/**
 * @param {ReadonlyMap<string, unknown>} settings
 * @param {string} key
 *
 * @returns {string | null}
 */
function getColorValue(settings, key) {
    const value = settings.get(key);
    const color = getStringValue(value);
    return color ?? null;
}

/**
 * @param {readonly unknown[]} dictChildren
 *
 * @returns {ReadonlyMap<string, unknown>}
 */
function getDictionaryEntries(dictChildren) {
    /** @type {Map<string, unknown>} */
    const entries = new Map();
    /** @type {string | undefined} */
    let currentKey;

    for (const child of dictChildren) {
        if (hasOwnRecordKey(child, "key")) {
            currentKey = getTextNodeValue(child.key);
            continue;
        }

        if (currentKey !== undefined && !hasOwnRecordKey(child, "#text")) {
            entries.set(currentKey, child);
            currentKey = undefined;
        }
    }

    return entries;
}

/**
 * @param {ReadonlyMap<string, unknown>} entries
 * @param {string} key
 *
 * @returns {ReadonlyMap<string, unknown>}
 */
function getDictionaryValue(entries, key) {
    const value = entries.get(key);

    if (!isRecord(value)) {
        return new Map();
    }

    const dictChildren = getArrayProperty(value, "dict");
    return dictChildren === undefined
        ? new Map()
        : getDictionaryEntries(dictChildren);
}

/**
 * @param {Record<string, unknown>} manifest
 *
 * @returns {string}
 */
function getManifestJson(manifest) {
    return `${JSON.stringify(manifest, null, 4)}\n`;
}

/**
 * @param {unknown} value
 *
 * @returns {string | undefined}
 */
function getStringValue(value) {
    if (!isRecord(value)) {
        return undefined;
    }

    return getTextNodeValue(value.string);
}

/**
 * @param {unknown} value
 *
 * @returns {string | undefined}
 */
function getTextNodeValue(value) {
    if (!isUnknownArray(value)) {
        return undefined;
    }

    const firstValue = value[0];
    if (!isRecord(firstValue)) {
        return undefined;
    }

    const textValue = firstValue["#text"];
    return typeof textValue === "string" ? textValue : undefined;
}

/**
 * @param {readonly unknown[]} settingsArray
 *
 * @returns {ThemeColors}
 */
function getThemeColors(settingsArray) {
    const firstSettingsItem = settingsArray.find((item) =>
        hasOwnRecordKey(item, "dict")
    );

    if (!isRecord(firstSettingsItem)) {
        return {
            background: null,
            caret: null,
            foreground: null,
            invisibles: null,
            lineHighlight: null,
            selection: null,
        };
    }

    const firstSettingsDict = getArrayProperty(firstSettingsItem, "dict");
    const firstSettingsEntries =
        firstSettingsDict === undefined
            ? new Map()
            : getDictionaryEntries(firstSettingsDict);
    const globalSettings = getDictionaryValue(firstSettingsEntries, "settings");

    return {
        background: getColorValue(globalSettings, "background"),
        caret: getColorValue(globalSettings, "caret"),
        foreground: getColorValue(globalSettings, "foreground"),
        invisibles: getColorValue(globalSettings, "invisibles"),
        lineHighlight: getColorValue(globalSettings, "lineHighlight"),
        selection: getColorValue(globalSettings, "selection"),
    };
}

/**
 * @param {string} directory
 *
 * @returns {Promise<readonly string[]>}
 */
async function getThemeFiles(directory) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- The generator intentionally reads the repo-local themes directory.
    const directoryEntries = await readdir(directory, { withFileTypes: true });

    return directoryEntries
        .filter(
            (directoryEntry) =>
                directoryEntry.isFile() &&
                directoryEntry.name.endsWith(".tmTheme")
        )
        .map((directoryEntry) => directoryEntry.name)
        .toSorted((left, right) => left.localeCompare(right))
        .map((fileName) => path.join(directory, fileName));
}

/**
 * @param {readonly unknown[]} settingsArray
 *
 * @returns {readonly string[]}
 */
function getThemeScopes(settingsArray) {
    return settingsArray
        .flatMap((item) => {
            if (!hasOwnRecordKey(item, "dict")) {
                return [];
            }

            const dictChildren = getArrayProperty(item, "dict");
            const entries =
                dictChildren === undefined
                    ? new Map()
                    : getDictionaryEntries(dictChildren);
            const scope = getStringValue(entries.get("scope"));

            if (scope === undefined) {
                return [];
            }

            return scope
                .split(",")
                .map((scopePart) => scopePart.trim())
                .filter((scopePart) => scopePart.length > 0);
        })
        .toSorted((left, right) => left.localeCompare(right));
}

/**
 * @param {ReadonlyMap<string, unknown>} topLevelEntries
 *
 * @returns {readonly unknown[]}
 */
function getThemeSettings(topLevelEntries) {
    const settingsNode = topLevelEntries.get("settings");

    if (!isRecord(settingsNode)) {
        return [];
    }

    return getArrayProperty(settingsNode, "array") ?? [];
}

/**
 * @param {readonly unknown[]} settingsArray
 *
 * @returns {ThemeStatistics}
 */
function getThemeStatistics(settingsArray) {
    const settingsCount = settingsArray.filter((item) =>
        hasOwnRecordKey(item, "dict")
    ).length;
    const scopes = getThemeScopes(settingsArray);
    const colorReferences = settingsArray
        .filter((item) => hasOwnRecordKey(item, "dict"))
        .flatMap((item) => {
            if (!isRecord(item)) {
                return [];
            }

            const dictChildren = getArrayProperty(item, "dict");
            const entries =
                dictChildren === undefined
                    ? new Map()
                    : getDictionaryEntries(dictChildren);
            const settings = getDictionaryValue(entries, "settings");

            return [...settings.values()].filter((value) => {
                const stringValue = getStringValue(value);
                return stringValue === undefined
                    ? false
                    : parseColor(stringValue) !== null;
            });
        }).length;

    return {
        colorReferences,
        scopedSettings: scopes.length,
        settings: settingsCount,
        uniqueScopes: new Set(scopes).size,
    };
}

/**
 * @param {unknown} parsedDocument
 *
 * @returns {ReadonlyMap<string, unknown>}
 */
function getTopLevelDictionary(parsedDocument) {
    if (!isUnknownArray(parsedDocument)) {
        return new Map();
    }

    const plistNode = parsedDocument.find((node) =>
        hasOwnRecordKey(node, "plist")
    );

    if (!isRecord(plistNode)) {
        return new Map();
    }

    const plistChildren = getArrayProperty(plistNode, "plist");
    if (plistChildren === undefined) {
        return new Map();
    }

    const dictNode = plistChildren.find((node) =>
        hasOwnRecordKey(node, "dict")
    );

    if (!isRecord(dictNode)) {
        return new Map();
    }

    const dictChildren = getArrayProperty(dictNode, "dict");
    return dictChildren === undefined
        ? new Map()
        : getDictionaryEntries(dictChildren);
}

/**
 * @param {unknown} value
 * @param {string} key
 *
 * @returns {value is Record<string, unknown>}
 */
function hasOwnRecordKey(value, key) {
    return isRecord(value) && Object.hasOwn(value, key);
}

/**
 * @param {unknown} value
 *
 * @returns {value is Record<string, unknown>}
 */
function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * @param {unknown} value
 *
 * @returns {value is readonly unknown[]}
 */
function isUnknownArray(value) {
    return Array.isArray(value);
}

/**
 * @returns {Promise<number>}
 */
async function main() {
    if (shouldCheck === shouldWrite) {
        process.stderr.write("Specify exactly one of --check or --write.\n");
        return 1;
    }

    const manifest = await buildManifest();
    const manifestJson = getManifestJson(manifest);

    if (shouldCheck) {
        return getCheckExitCode(manifestJson);
    }

    await writeManifest(manifestJson);
    process.stdout.write("Wrote metadata/themes.json.\n");
    return 0;
}

/**
 * @param {string} color
 *
 * @returns {readonly [number, number, number] | null}
 */
function parseColor(color) {
    const normalizedColor = color.trim();
    const hexMatch = /^#(?<hex>[\da-f]{3}|[\da-f]{6}|[\da-f]{8})$/iv.exec(
        normalizedColor
    );

    if (hexMatch?.groups === undefined) {
        return null;
    }

    const { hex } = hexMatch.groups;

    if (hex.length === 3) {
        return [
            Number.parseInt(`${hex[0]}${hex[0]}`, 16),
            Number.parseInt(`${hex[1]}${hex[1]}`, 16),
            Number.parseInt(`${hex[2]}${hex[2]}`, 16),
        ];
    }

    return [
        Number.parseInt(hex.slice(0, 2), 16),
        Number.parseInt(hex.slice(2, 4), 16),
        Number.parseInt(hex.slice(4, 6), 16),
    ];
}

/**
 * @param {string} filePath
 *
 * @returns {Promise<ThemeMetadata>}
 */
async function parseThemeFile(filePath) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- Theme paths come from the repo-local themes directory listing.
    const text = await readFile(filePath, "utf8");
    const xmlValidation = SyntaxValidator.validate(text);

    if (xmlValidation !== true) {
        const { col, line, msg } = xmlValidation.err;
        throw new Error(
            `${filePath}: XML parse error at ${line}:${col}: ${msg}`
        );
    }

    const parsedDocument = /** @type {unknown} */ parser.parse(text);
    const topLevelEntries = getTopLevelDictionary(parsedDocument);
    const name = getStringValue(topLevelEntries.get("name"));
    const uuid = getStringValue(topLevelEntries.get("uuid"));

    if (name === undefined || uuid === undefined) {
        throw new Error(`${filePath}: missing top-level name or uuid`);
    }

    const settingsArray = getThemeSettings(topLevelEntries);
    const colors = getThemeColors(settingsArray);
    const fileName = path.basename(filePath);
    const relativePath = path
        .relative(rootDirectory, filePath)
        .replaceAll(path.sep, "/");
    const scopes = [...new Set(getThemeScopes(settingsArray))];

    return {
        appearance: detectAppearance(colors.background),
        author: getStringValue(topLevelEntries.get("author")) ?? null,
        colors,
        colorSpace: getStringValue(topLevelEntries.get("colorSpace")) ?? null,
        fileName,
        id: createThemeId(fileName),
        name,
        path: relativePath,
        scopes,
        semanticClass:
            getStringValue(topLevelEntries.get("semanticClass")) ?? null,
        statistics: getThemeStatistics(settingsArray),
        uuid,
    };
}

/**
 * @param {readonly string[]} filePaths
 *
 * @returns {Promise<readonly ThemeMetadata[]>}
 */
async function parseThemes(filePaths) {
    const themes = await Promise.all(
        filePaths.map((filePath) => parseThemeFile(filePath))
    );
    /** @type {Map<string, number>} */
    const idCounts = new Map();

    return themes.map((theme) => {
        const idCount = idCounts.get(theme.id) ?? 0;
        idCounts.set(theme.id, idCount + 1);

        if (idCount === 0) {
            return theme;
        }

        return {
            ...theme,
            id: `${theme.id}-${idCount + 1}`,
        };
    });
}

/**
 * @returns {Promise<string>}
 */
async function readExistingManifest() {
    try {
        return await readFile(manifestPath, "utf8");
    } catch {
        return "";
    }
}

/**
 * @returns {Promise<void>}
 */
async function run() {
    try {
        process.exitCode = await main();
    } catch (error) {
        process.stderr.write(`${String(error)}\n`);
        process.exitCode = 1;
    }
}

/**
 * @param {string} manifestJson
 *
 * @returns {Promise<void>}
 */
async function writeManifest(manifestJson) {
    await mkdir(metadataDirectory, { recursive: true });

    await writeFile(manifestPath, manifestJson, "utf8");
    process.stdout.write(
        `Schema location: ${path.relative(rootDirectory, schemaPath)}\n`
    );
}

// eslint-disable-next-line unicorn/prefer-top-level-await -- This published-module config also enforces n/no-top-level-await.
void run();
