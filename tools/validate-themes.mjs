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

    const closeResult = /** @type {readonly unknown[]} */ (
        await Promise.race([
            once(childProcess, "close"),
            once(childProcess, "error").then((errorResult) => {
                const errorValues = /** @type {readonly unknown[]} */ (
                    errorResult
                );
                const error = errorValues[0];
                throw error;
            }),
        ])
    );
    const [exitCode] = closeResult;

    return typeof exitCode === "number" ? exitCode : 1;
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
 * @returns {readonly string[]}
 */
function getTopLevelKeys(parsedDocument) {
    if (!isUnknownArray(parsedDocument)) {
        return [];
    }

    const plistNode = parsedDocument.find((node) =>
        hasOwnRecordKey(node, "plist")
    );

    if (plistNode === undefined) {
        return [];
    }

    const plistChildren = getArrayProperty(plistNode, "plist");
    if (plistChildren === undefined) {
        return [];
    }

    const dictNode = plistChildren.find((node) =>
        hasOwnRecordKey(node, "dict")
    );

    if (dictNode === undefined) {
        return [];
    }

    const dictChildren = getArrayProperty(dictNode, "dict");
    if (dictChildren === undefined) {
        return [];
    }

    return dictChildren.flatMap((node) => {
        if (!hasOwnRecordKey(node, "key")) {
            return [];
        }

        const keyName = getTextNodeValue(node.key);
        return keyName === undefined ? [] : [keyName];
    });
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

    const parsedDocument = /** @type {unknown} */ (parser.parse(text));
    const keys = getTopLevelKeys(parsedDocument);
    const missingKeys = [
        "name",
        "uuid",
        "settings",
    ].filter((key) => !keys.includes(key));

    if (missingKeys.length > 0) {
        return {
            filePath,
            ok: false,
            reason: `Missing top-level key(s): ${missingKeys.join(", ")}`,
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
