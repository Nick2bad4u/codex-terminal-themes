import { XMLParser } from "fast-xml-parser";
import { SyntaxValidator } from "fast-xml-validator";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { readdir, readFile, stat } from "node:fs/promises";
import * as path from "node:path";

const rootDirectory = process.cwd();
const themeDirectory = path.join(rootDirectory, "themes");
const shouldBuildBatCache = process.argv.includes("--bat-cache");

const parser = new XMLParser({
    ignoreAttributes: false,
    preserveOrder: true,
    trimValues: false,
});

/**
 * @typedef {{ filePath: string; ok: true; reason: "" }
 *     | { filePath: string; ok: false; reason: string }} ThemeValidationResult
 */

/**
 * @returns {Promise<number>}
 */
async function buildBatCache() {
    const childProcess = spawn("bat", ["cache", "--build"], {
        stdio: "inherit",
    });

    const closeResult = /** @type {readonly unknown[]} */ await Promise.race([
        once(childProcess, "close"),
        once(childProcess, "error").then((errorResult) => {
            const errorValues = /** @type {readonly unknown[]} */ errorResult;
            const error = errorValues[0];
            throw error;
        }),
    ]);
    const [exitCode] = closeResult;

    return typeof exitCode === "number" ? exitCode : 1;
}

/**
 * @param {unknown} value
 * @param {string} key
 *
 * @returns {string | undefined}
 */
function findStringValueWithWhitespaceForKey(value, key) {
    if (isUnknownArray(value)) {
        for (let index = 0; index < value.length; index += 1) {
            const child = value[index];

            if (
                hasOwnRecordKey(child, "key") &&
                getTextNodeValue(child.key) === key
            ) {
                const nextValueNode = value
                    .slice(index + 1)
                    .find((nextChild) => !hasOwnRecordKey(nextChild, "#text"));
                const stringValue =
                    isRecord(nextValueNode) &&
                    hasOwnRecordKey(nextValueNode, "string")
                        ? getTextNodeValue(nextValueNode.string)
                        : undefined;

                if (stringValue !== undefined && /\s/v.test(stringValue)) {
                    return stringValue;
                }
            }

            const nestedValue = findStringValueWithWhitespaceForKey(child, key);

            if (nestedValue !== undefined) {
                return nestedValue;
            }
        }

        return undefined;
    }

    if (!isRecord(value)) {
        return undefined;
    }

    for (const child of Object.values(value)) {
        const nestedValue = findStringValueWithWhitespaceForKey(child, key);

        if (nestedValue !== undefined) {
            return nestedValue;
        }
    }

    return undefined;
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
 * @param {unknown} value
 * @param {string} key
 *
 * @returns {string | undefined}
 */
/**
 * @param {string} directory
 *
 * @returns {Promise<readonly string[]>}
 */
async function getThemeFiles(directory) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- The validator intentionally reads the repo-local themes directory.
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

    if (plistNode === undefined) {
        return new Map();
    }

    const plistChildren = getArrayProperty(plistNode, "plist");
    if (plistChildren === undefined) {
        return new Map();
    }

    const dictNode = plistChildren.find((node) =>
        hasOwnRecordKey(node, "dict")
    );

    if (dictNode === undefined) {
        return new Map();
    }

    const dictChildren = getArrayProperty(dictNode, "dict");
    if (dictChildren === undefined) {
        return new Map();
    }

    /** @type {Map<string, unknown>} */
    const entries = new Map();
    /** @type {string | undefined} */
    let currentKey;

    for (const node of dictChildren) {
        if (!hasOwnRecordKey(node, "key")) {
            if (currentKey !== undefined && !hasOwnRecordKey(node, "#text")) {
                entries.set(currentKey, node);
                currentKey = undefined;
            }

            continue;
        }

        currentKey = getTextNodeValue(node.key);
    }

    return entries;
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
    const themeDirectoryStats = await stat(themeDirectory).catch(() => null);

    if (themeDirectoryStats?.isDirectory() === false) {
        process.stderr.write(
            `Theme path is not a directory: ${themeDirectory}\n`
        );
        return 1;
    }

    if (themeDirectoryStats === null) {
        process.stderr.write(
            `Theme directory does not exist: ${themeDirectory}\n`
        );
        return 1;
    }

    const themeFiles = await getThemeFiles(themeDirectory);
    const results = await Promise.all(
        themeFiles.map((filePath) => validateTheme(filePath))
    );
    const failedResults = results.filter((result) => !result.ok);

    if (failedResults.length > 0) {
        for (const result of failedResults) {
            process.stderr.write(
                `${path.relative(rootDirectory, result.filePath)}: ${result.reason}\n`
            );
        }

        return 1;
    }

    process.stdout.write(`Validated ${themeFiles.length} .tmTheme files.\n`);

    if (shouldBuildBatCache) {
        return buildBatCache();
    }

    return 0;
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
 * @param {string} filePath
 *
 * @returns {Promise<ThemeValidationResult>}
 */
async function validateTheme(filePath) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- Theme paths come from the repo-local themes directory listing.
    const text = await readFile(filePath, "utf8");
    const xmlValidation = SyntaxValidator.validate(text);

    if (xmlValidation !== true) {
        const { col, line, msg } = xmlValidation.err;
        return {
            filePath,
            ok: false,
            reason: `XML parse error at ${line}:${col}: ${msg}`,
        };
    }

    const parsedDocument = /** @type {unknown} */ parser.parse(text);
    const fileName = path.basename(filePath);
    const topLevelEntries = getTopLevelDictionary(parsedDocument);
    const keys = new Set(topLevelEntries.keys());
    const missingKeys = [
        "author",
        "colorSpace",
        "name",
        "semanticClass",
        "uuid",
        "settings",
    ].filter((key) => !keys.has(key));

    if (missingKeys.length > 0) {
        return {
            filePath,
            ok: false,
            reason: `Missing top-level key(s): ${missingKeys.join(", ")}`,
        };
    }

    if (keys.has("colorSpaceName")) {
        return {
            filePath,
            ok: false,
            reason: "Use top-level colorSpace metadata, not colorSpaceName.",
        };
    }

    if (/\s/v.test(fileName)) {
        return {
            filePath,
            ok: false,
            reason: "Theme file names must not contain whitespace.",
        };
    }

    const themeName = getTextNodeValue(
        isRecord(topLevelEntries.get("name"))
            ? topLevelEntries.get("name").string
            : undefined
    );

    if (themeName === undefined || /\s/v.test(themeName)) {
        return {
            filePath,
            ok: false,
            reason: "Top-level theme name must exist and must not contain whitespace.",
        };
    }

    const spacedNameValue = findStringValueWithWhitespaceForKey(
        parsedDocument,
        "name"
    );

    if (spacedNameValue !== undefined) {
        return {
            filePath,
            ok: false,
            reason: `All plist name values must not contain whitespace. Found: ${spacedNameValue}`,
        };
    }

    return {
        filePath,
        ok: true,
        reason: "",
    };
}

// eslint-disable-next-line unicorn/prefer-top-level-await -- This published-module config also enforces n/no-top-level-await.
void run();
