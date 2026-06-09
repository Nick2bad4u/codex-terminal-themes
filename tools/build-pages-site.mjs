import { XMLParser } from "fast-xml-parser";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import * as path from "node:path";

const rootDirectory = process.cwd();
const docsDirectory = path.join(rootDirectory, "docs");
const metadataPath = path.join(rootDirectory, "metadata", "themes.json");
const siteDataPath = path.join(docsDirectory, "site-data.json");
const shouldCheck = process.argv.includes("--check");
const shouldWrite = process.argv.includes("--write");

const parser = new XMLParser({
    ignoreAttributes: false,
    preserveOrder: true,
    trimValues: false,
});

/**
 * @typedef {{
 *     readonly background?: string;
 *     readonly fontStyle?: string;
 *     readonly foreground?: string;
 *     readonly scope: string;
 * }} PreviewRule
 *
 * @typedef {{
 *     readonly appearance: string;
 *     readonly author: null | string;
 *     readonly colors: Record<string, null | string>;
 *     readonly fileName: string;
 *     readonly id: string;
 *     readonly name: string;
 *     readonly path: string;
 *     readonly rules: readonly PreviewRule[];
 *     readonly statistics: Record<string, number>;
 *     readonly uuid: string;
 * }} PreviewTheme
 */

/**
 * @returns {Promise<Record<string, unknown>>}
 */
async function buildSiteData() {
    const metadata = await readJson(metadataPath);
    const themes = getThemes(metadata);
    const previewThemes = await Promise.all(
        themes.map((theme) => buildThemePreview(theme))
    );

    return {
        generatedBy: "npm run pages:build",
        sourceManifest: "metadata/themes.json",
        themeCount: previewThemes.length,
        themes: previewThemes,
    };
}

/**
 * @param {Record<string, unknown>} theme
 *
 * @returns {Promise<PreviewTheme>}
 */
async function buildThemePreview(theme) {
    const themePath = getRequiredString(theme, "path");
    const absoluteThemePath = path.join(rootDirectory, themePath);
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- Theme paths come from the committed metadata manifest.
    const text = await readFile(absoluteThemePath, "utf8");
    const parsedDocument = /** @type {unknown} */ (parser.parse(text));
    const topLevelEntries = getTopLevelDictionary(parsedDocument);
    const settings = getThemeSettings(topLevelEntries);

    return {
        appearance: getRequiredString(theme, "appearance"),
        author: getNullableString(theme, "author"),
        colors: getRecord(theme, "colors"),
        fileName: getRequiredString(theme, "fileName"),
        id: getRequiredString(theme, "id"),
        name: getRequiredString(theme, "name"),
        path: themePath,
        rules: getPreviewRules(settings),
        statistics: getNumberRecord(theme, "statistics"),
        uuid: getRequiredString(theme, "uuid"),
    };
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
 * @param {string} siteDataJson
 *
 * @returns {Promise<number>}
 */
async function getCheckExitCode(siteDataJson) {
    const existingSiteData = await readExistingSiteData();

    if (existingSiteData === siteDataJson) {
        process.stdout.write("GitHub Pages site data is up to date.\n");
        return 0;
    }

    process.stderr.write(
        "GitHub Pages site data is stale. Run `npm run pages:build`.\n"
    );
    return 1;
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
 * @param {Record<string, unknown>} record
 * @param {string} key
 *
 * @returns {null | string}
 */
function getNullableString(record, key) {
    const value = record[key];

    if (value === null || typeof value === "string") {
        return value;
    }

    return null;
}

/**
 * @param {Record<string, unknown>} record
 * @param {string} key
 *
 * @returns {Record<string, number>}
 */
function getNumberRecord(record, key) {
    const value = record[key];

    if (!isRecord(value)) {
        return {};
    }

    return Object.fromEntries(
        Object.entries(value).filter((entry) => typeof entry[1] === "number")
    );
}

/**
 * @param {ReadonlyMap<string, unknown>} settings
 * @param {string} key
 *
 * @returns {string | undefined}
 */
function getOptionalString(settings, key) {
    const value = settings.get(key);

    if (!isRecord(value)) {
        return undefined;
    }

    return getTextNodeValue(value.string);
}

/**
 * @param {readonly unknown[]} settingsArray
 *
 * @returns {readonly PreviewRule[]}
 */
function getPreviewRules(settingsArray) {
    return settingsArray.flatMap((item) => {
        if (!hasOwnRecordKey(item, "dict")) {
            return [];
        }

        const dictChildren = getArrayProperty(item, "dict");
        const entries =
            dictChildren === undefined
                ? new Map()
                : getDictionaryEntries(dictChildren);
        const scope = getOptionalString(entries, "scope");

        if (scope === undefined) {
            return [];
        }

        const settings = getDictionaryValue(entries, "settings");
        const foreground = getOptionalString(settings, "foreground");
        const background = getOptionalString(settings, "background");
        const fontStyle = getOptionalString(settings, "fontStyle");

        return scope
            .split(",")
            .map((scopePart) => scopePart.trim())
            .filter((scopePart) => scopePart.length > 0)
            .map((scopePart) => ({
                ...(background === undefined ? {} : { background }),
                ...(fontStyle === undefined ? {} : { fontStyle }),
                ...(foreground === undefined ? {} : { foreground }),
                scope: scopePart,
            }));
    });
}

/**
 * @param {Record<string, unknown>} record
 * @param {string} key
 *
 * @returns {Record<string, null | string>}
 */
function getRecord(record, key) {
    const value = record[key];

    if (!isRecord(value)) {
        return {};
    }

    return Object.fromEntries(
        Object.entries(value).map(([entryKey, entryValue]) => [
            entryKey,
            typeof entryValue === "string" ? entryValue : null,
        ])
    );
}

/**
 * @param {Record<string, unknown>} record
 * @param {string} key
 *
 * @returns {string}
 */
function getRequiredString(record, key) {
    const value = record[key];

    if (typeof value !== "string") {
        throw new TypeError(`Expected string field: ${key}`);
    }

    return value;
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
 * @param {unknown} metadata
 *
 * @returns {readonly Record<string, unknown>[]}
 */
function getThemes(metadata) {
    if (!isRecord(metadata) || !isUnknownArray(metadata.themes)) {
        throw new TypeError("metadata/themes.json does not contain themes.");
    }

    return metadata.themes.filter((theme) => isRecord(theme));
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

    const siteData = await buildSiteData();
    const siteDataJson = `${JSON.stringify(siteData, null, 4)}\n`;

    if (shouldCheck) {
        return getCheckExitCode(siteDataJson);
    }

    await mkdir(docsDirectory, { recursive: true });
    await writeFile(siteDataPath, siteDataJson, "utf8");
    process.stdout.write("Wrote docs/site-data.json.\n");
    return 0;
}

/**
 * @returns {Promise<string>}
 */
async function readExistingSiteData() {
    try {
        return await readFile(siteDataPath, "utf8");
    } catch {
        return "";
    }
}

/**
 * @param {string} filePath
 *
 * @returns {Promise<unknown>}
 */
async function readJson(filePath) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- JSON paths are fixed repo-local paths.
    const text = await readFile(filePath, "utf8");
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- This is the typed boundary for a generated repo-local JSON file.
    return JSON.parse(text);
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

// eslint-disable-next-line unicorn/prefer-top-level-await -- This published-module config also enforces n/no-top-level-await.
void run();
