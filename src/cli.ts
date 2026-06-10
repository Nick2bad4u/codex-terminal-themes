import { XMLParser } from "fast-xml-parser";
import { SyntaxValidator } from "fast-xml-validator";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { constants as fsConstants } from "node:fs";
import {
    access,
    copyFile,
    mkdir,
    readdir,
    readFile,
    stat,
    writeFile,
} from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";

type ThemeColors = {
    readonly background: null | string;
    readonly caret: null | string;
    readonly foreground: null | string;
    readonly invisibles: null | string;
    readonly lineHighlight: null | string;
    readonly selection: null | string;
};

type ThemeStatistics = {
    readonly colorReferences: number;
    readonly scopedSettings: number;
    readonly settings: number;
    readonly uniqueScopes: number;
};

type Theme = {
    readonly appearance: "dark" | "light" | "unknown";
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
};

type ThemeManifest = {
    readonly schemaVersion: number;
    readonly themeCount: number;
    readonly themes: readonly Theme[];
};

type CliConfig = {
    readonly batDir?: string;
    readonly codexDir?: string;
    readonly defaultTarget?: string;
    readonly defaultTheme?: string;
    readonly skipBatCache?: boolean;
};

type CliConfigKey = keyof CliConfig;

type ParsedArgs = {
    readonly args: readonly string[];
    readonly flags: Map<string, string | true>;
    readonly positionals: readonly string[];
};

type CliIo = {
    readonly cwd: string;
    readonly env: NodeJS.ProcessEnv;
    readonly stderr: NodeJS.WritableStream;
    readonly stdin: NodeJS.ReadStream & { readonly isTTY?: boolean };
    readonly stdout: NodeJS.WritableStream & {
        readonly columns?: number;
        readonly isTTY?: boolean;
        readonly rows?: number;
    };
};

type ThemeStyle = {
    readonly background?: string;
    readonly fontStyle?: string;
    readonly foreground?: string;
    readonly scopeParts?: readonly string[];
};

type DoctorCheck = {
    readonly detail: string;
    readonly name: string;
    readonly ok: boolean;
};

type InstallResult = {
    readonly destination: string;
    readonly reason?: string;
    readonly source: string;
    readonly status: "copied" | "dry-run" | "failed" | "rebuilt" | "unchanged";
    readonly target: string;
    readonly theme: string;
};

type InstallTarget = {
    readonly directory: string;
    readonly name: "bat" | "codex";
};

type SpawnTextResult = {
    readonly exitCode: number;
    readonly stderr: string;
    readonly stdout: string;
};

const moduleDirectory = import.meta.dirname;
const packageRoot =
    path.basename(moduleDirectory) === "src" &&
    path.basename(path.dirname(moduleDirectory)) === "dist"
        ? path.dirname(path.dirname(moduleDirectory))
        : path.dirname(moduleDirectory);
const manifestPath = path.join(packageRoot, "metadata", "themes.json");
const themeRoot = path.join(packageRoot, "themes");
const reset = "\u001B[0m";

const parser = new XMLParser({
    ignoreAttributes: false,
    preserveOrder: true,
    trimValues: false,
});

const configKeys = new Set([
    "batDir",
    "codexDir",
    "defaultTarget",
    "defaultTheme",
    "skipBatCache",
]);

const sampleTokens = [
    { label: "keyword", scope: "keyword", text: "const" },
    { label: "function", scope: "entity.name.function", text: "renderTheme" },
    { label: "string", scope: "string", text: '"AMOLED"' },
    { label: "number", scope: "constant.numeric", text: "203" },
    { label: "comment", scope: "comment", text: "// preview" },
    { label: "variable", scope: "variable", text: "theme" },
    { label: "type", scope: "storage.type", text: "readonly" },
    { label: "invalid", scope: "invalid", text: "error" },
];

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
 *     readonly colors: ThemeColors;
 *     readonly colorSpace: string | null;
 *     readonly fileName: string;
 *     readonly id: string;
 *     readonly name: string;
 *     readonly path: string;
 *     readonly scopes: readonly string[];
 *     readonly semanticClass: string | null;
 *     readonly statistics: ThemeStatistics;
 *     readonly uuid: string;
 * }} Theme
 *
 * @typedef {{
 *     readonly schemaVersion: number;
 *     readonly themeCount: number;
 *     readonly themes: readonly Theme[];
 * }} ThemeManifest
 *
 * @typedef {{
 *     readonly batDir?: string;
 *     readonly codexDir?: string;
 *     readonly defaultTarget?: string;
 *     readonly defaultTheme?: string;
 *     readonly skipBatCache?: boolean;
 * }} CliConfig
 *
 * @typedef {{
 *     readonly args: readonly string[];
 *     readonly flags: Map<string, string | true>;
 *     readonly positionals: readonly string[];
 * }} ParsedArgs
 *
 * @typedef {{
 *     readonly cwd: string;
 *     readonly env: NodeJS.ProcessEnv;
 *     readonly stderr: NodeJS.WritableStream;
 *     readonly stdin: NodeJS.ReadStream & { readonly isTTY?: boolean };
 *     readonly stdout: NodeJS.WritableStream & {
 *         readonly columns?: number;
 *         readonly isTTY?: boolean;
 *         readonly rows?: number;
 *     };
 * }} CliIo
 *
 * @typedef {{
 *     readonly foreground?: string;
 *     readonly background?: string;
 *     readonly fontStyle?: string;
 *     readonly scopeParts?: readonly string[];
 * }} ThemeStyle
 *
 * @typedef {{
 *     readonly name: string;
 *     readonly ok: boolean;
 *     readonly detail: string;
 * }} DoctorCheck
 */

/**
 * @param {readonly string[]} args
 * @param {CliIo} io
 *
 * @returns {Promise<number>}
 */
export async function runCli(
    args: readonly string[],
    io: CliIo
): Promise<number> {
    try {
        const parsedArgs = parseArgs(args);
        const command = parsedArgs.positionals[0] ?? "help";

        if (parsedArgs.flags.has("help") || parsedArgs.flags.has("h")) {
            writeHelp(io.stdout);
            return 0;
        }

        if (parsedArgs.flags.has("version") || parsedArgs.flags.has("v")) {
            const packageJson = await readPackageJson();
            io.stdout.write(`${String(packageJson.version)}\n`);
            return 0;
        }

        switch (command) {
            case "config": {
                return handleConfig(parsedArgs, io);
            }

            case "doctor": {
                return handleDoctor(parsedArgs, io);
            }

            case "help": {
                writeHelp(io.stdout);
                return 0;
            }

            case "install": {
                return handleInstall(parsedArgs, io);
            }

            case "list": {
                return handleList(parsedArgs, io);
            }

            case "path": {
                return handlePath(parsedArgs, io);
            }

            case "pick":
            case "picker": {
                return handlePicker(parsedArgs, io);
            }

            case "show": {
                return handleShow(parsedArgs, io);
            }

            default: {
                io.stderr.write(`Unknown command: ${command}\n\n`);
                writeHelp(io.stderr);
                return 1;
            }
        }
    } catch (error) {
        io.stderr.write(`${getErrorMessage(error)}\n`);
        return 1;
    }
}

/**
 * @param {ParsedArgs} parsedArgs
 * @param {CliIo} io
 *
 * @returns {Promise<number>}
 */
async function handleConfig(parsedArgs, io) {
    const subcommand = parsedArgs.positionals[1] ?? "list";
    const configPath = getConfigPath(parsedArgs, io.env);

    if (subcommand === "path") {
        io.stdout.write(`${configPath}\n`);
        return 0;
    }

    const config = await readConfig(configPath);

    if (subcommand === "list") {
        writeJsonOrText(parsedArgs, io.stdout, config, formatConfig(config));
        return 0;
    }

    const rawKey = parsedArgs.positionals[2];
    if (rawKey === undefined || !configKeys.has(rawKey)) {
        throw new Error(
            `Expected one of these config keys: ${[...configKeys].join(", ")}`
        );
    }
    const key = rawKey as CliConfigKey;

    if (subcommand === "get") {
        const value = config[key];
        if (value !== undefined) {
            io.stdout.write(`${String(value)}\n`);
        }
        return 0;
    }

    if (subcommand === "set") {
        const rawValue = parsedArgs.positionals[3];
        if (rawValue === undefined) {
            throw new Error(`Missing value for config key: ${key}`);
        }

        const nextConfig = {
            ...config,
            [key]: parseConfigValue(key, rawValue),
        };
        await writeConfig(configPath, nextConfig);
        io.stdout.write(`Set ${key} in ${configPath}\n`);
        return 0;
    }

    if (["clear", "unset"].includes(subcommand)) {
        const nextConfig = { ...config };
        delete nextConfig[key];
        await writeConfig(configPath, nextConfig);
        io.stdout.write(`Cleared ${key} in ${configPath}\n`);
        return 0;
    }

    throw new Error(`Unknown config command: ${subcommand}`);
}

/**
 * @param {ParsedArgs} parsedArgs
 * @param {CliIo} io
 *
 * @returns {Promise<number>}
 */
async function handleDoctor(parsedArgs, io) {
    const manifest = await loadManifest();
    const config = await readConfig(getConfigPath(parsedArgs, io.env));
    const checks = await runDoctorChecks(manifest, config, parsedArgs, io);
    const failedChecks = checks.filter((check) => !check.ok);

    if (isJson(parsedArgs)) {
        io.stdout.write(
            `${JSON.stringify({ checks, ok: failedChecks.length === 0 }, null, 4)}\n`
        );
    } else {
        for (const check of checks) {
            io.stdout.write(
                `${check.ok ? "ok" : "fail"} ${check.name}: ${check.detail}\n`
            );
        }
    }

    return failedChecks.length === 0 ? 0 : 1;
}

/**
 * @param {ParsedArgs} parsedArgs
 * @param {CliIo} io
 *
 * @returns {Promise<number>}
 */
async function handleInstall(parsedArgs, io) {
    const manifest = await loadManifest();
    const config = await readConfig(getConfigPath(parsedArgs, io.env));
    const all = hasFlag(parsedArgs, "all");
    const requestedThemes = parsedArgs.positionals.slice(1);

    if (
        !all &&
        requestedThemes.length === 0 &&
        config.defaultTheme === undefined
    ) {
        throw new Error(
            "Specify a theme id/name/path, --all, or config defaultTheme."
        );
    }

    const themes = all
        ? manifest.themes
        : requestedThemes.length > 0
          ? resolveThemes(manifest.themes, requestedThemes)
          : [resolveTheme(manifest.themes, config.defaultTheme ?? "")];
    const targets = await resolveInstallTargets(parsedArgs, config, io);
    const dryRun = hasFlag(parsedArgs, "dry-run");
    const force = hasFlag(parsedArgs, "force");
    const skipBatCache =
        hasFlag(parsedArgs, "skip-bat-cache") || config.skipBatCache === true;
    const results: InstallResult[] = [];

    for (const target of targets) {
        await ensureTargetDirectory(target.directory, dryRun);

        for (const theme of themes) {
            const source = getThemeFilePath(theme);
            const destination = path.join(target.directory, theme.fileName);
            const result = await copyTheme({
                destination,
                dryRun,
                force,
                source,
                target: target.name,
                theme,
            });
            results.push(result);
        }
    }

    const copiedBatThemes = results.some(
        (result) => result.target === "bat" && result.status === "copied"
    );
    if (!dryRun && copiedBatThemes && !skipBatCache) {
        const batCacheResult = await runBatCache(io);
        results.push(batCacheResult);
    }

    if (isJson(parsedArgs)) {
        io.stdout.write(`${JSON.stringify(results, null, 4)}\n`);
    } else {
        for (const result of results) {
            io.stdout.write(formatInstallResult(result));
        }
    }

    return results.some((result) => result.status === "failed") ? 1 : 0;
}

/**
 * @param {ParsedArgs} parsedArgs
 * @param {CliIo} io
 *
 * @returns {Promise<number>}
 */
async function handleList(parsedArgs, io) {
    const manifest = await loadManifest();
    const themes = filterThemes(manifest.themes, parsedArgs);

    if (isJson(parsedArgs)) {
        io.stdout.write(`${JSON.stringify(themes, null, 4)}\n`);
        return 0;
    }

    io.stdout.write(formatThemeTable(themes));
    return 0;
}

/**
 * @param {ParsedArgs} parsedArgs
 * @param {CliIo} io
 *
 * @returns {Promise<number>}
 */
async function handlePath(parsedArgs, io) {
    const manifest = await loadManifest();
    const query = parsedArgs.positionals[1];

    if (query === undefined) {
        throw new Error("Specify a theme id, name, or file name.");
    }

    const theme = resolveTheme(manifest.themes, query);
    io.stdout.write(`${getThemeFilePath(theme)}\n`);
    return 0;
}

/**
 * @param {ParsedArgs} parsedArgs
 * @param {CliIo} io
 *
 * @returns {Promise<number>}
 */
async function handlePicker(parsedArgs, io) {
    const manifest = await loadManifest();
    const themes = filterThemes(manifest.themes, parsedArgs);

    if (!io.stdin.isTTY || !io.stdout.isTTY) {
        throw new Error(
            "Interactive picker requires a TTY. Use `list` or `show` in scripts."
        );
    }

    const selectedTheme = await runPicker(themes, io);
    if (selectedTheme === null) {
        io.stdout.write("No theme selected.\n");
        return 1;
    }

    if (hasFlag(parsedArgs, "install")) {
        const installArgs = [
            "install",
            selectedTheme.id,
            ...serializeForwardedInstallFlags(parsedArgs),
        ];
        return runCli(installArgs, io);
    }

    io.stdout.write(
        `${selectedTheme.id}\t${selectedTheme.name}\t${selectedTheme.fileName}\n`
    );
    return 0;
}

/**
 * @param {ParsedArgs} parsedArgs
 * @param {CliIo} io
 *
 * @returns {Promise<number>}
 */
async function handleShow(parsedArgs, io) {
    const manifest = await loadManifest();
    const query = parsedArgs.positionals[1];

    if (query === undefined) {
        throw new Error("Specify a theme id, name, or file name.");
    }

    const theme = resolveTheme(manifest.themes, query);

    if (isJson(parsedArgs)) {
        io.stdout.write(`${JSON.stringify(theme, null, 4)}\n`);
        return 0;
    }

    io.stdout.write(await formatThemeDetails(theme));
    return 0;
}

/**
 * @param {{
 *     readonly destination: string;
 *     readonly dryRun: boolean;
 *     readonly force: boolean;
 *     readonly source: string;
 *     readonly target: string;
 *     readonly theme: Theme;
 * }} options
 *
 * @returns {Promise<Record<string, string>>}
 */
async function copyTheme(options): Promise<InstallResult> {
    const validation = await validateThemeFile(options.source);

    if (!validation.ok) {
        return {
            destination: options.destination,
            reason: validation.reason,
            source: options.source,
            status: "failed",
            target: options.target,
            theme: options.theme.id,
        };
    }

    if (
        !options.force &&
        (await sameFileContent(options.source, options.destination))
    ) {
        return {
            destination: options.destination,
            source: options.source,
            status: "unchanged",
            target: options.target,
            theme: options.theme.id,
        };
    }

    if (!options.dryRun) {
        await copyFile(options.source, options.destination);
    }

    return {
        destination: options.destination,
        source: options.source,
        status: options.dryRun ? "dry-run" : "copied",
        target: options.target,
        theme: options.theme.id,
    };
}

/**
 * @param {string} value
 *
 * @returns {string}
 */
function dim(value) {
    return `\u001B[2m${value}${reset}`;
}

/**
 * @param {string} directory
 * @param {boolean} dryRun
 *
 * @returns {Promise<void>}
 */
async function ensureTargetDirectory(directory, dryRun) {
    if (dryRun) {
        return;
    }

    await mkdir(directory, { recursive: true });
}

/**
 * @param {readonly Theme[]} themes
 * @param {ParsedArgs} parsedArgs
 *
 * @returns {readonly Theme[]}
 */
function filterThemes(themes, parsedArgs) {
    const search = getStringFlag(parsedArgs, "search")?.toLowerCase();
    const appearance = getStringFlag(parsedArgs, "appearance");
    const limit = getNumberFlag(parsedArgs, "limit");
    const filteredThemes = themes.filter((theme) => {
        const matchesSearch =
            search === undefined ||
            [
                theme.id,
                theme.name,
                theme.fileName,
            ]
                .join(" ")
                .toLowerCase()
                .includes(search);
        const matchesAppearance =
            appearance === undefined || theme.appearance === appearance;
        return matchesSearch && matchesAppearance;
    });

    return limit === undefined
        ? filteredThemes
        : filteredThemes.slice(0, limit);
}

/**
 * @param {CliConfig} config
 *
 * @returns {string}
 */
function formatConfig(config) {
    const entries = Object.entries(config).toSorted(([left], [right]) =>
        left.localeCompare(right)
    );

    if (entries.length === 0) {
        return "No CLI config is set.\n";
    }

    return `${entries.map(([key, value]) => `${key}: ${String(value)}`).join("\n")}\n`;
}

/**
 * @param {Record<string, string>} result
 *
 * @returns {string}
 */
function formatInstallResult(result) {
    const reason = result.reason === undefined ? "" : ` (${result.reason})`;
    return `${result.status} ${result.target}:${result.theme} -> ${result.destination}${reason}\n`;
}

/**
 * @param {Theme} theme
 *
 * @returns {Promise<string>}
 */
async function formatThemeDetails(theme) {
    const lines = [
        `${theme.name} (${theme.id})`,
        `File: ${theme.path}`,
        `Appearance: ${theme.appearance}`,
        `UUID: ${theme.uuid}`,
        `Author: ${theme.author ?? "unknown"}`,
        `Stats: ${theme.statistics.settings} settings, ${theme.statistics.uniqueScopes} unique scopes, ${theme.statistics.colorReferences} colors`,
        "",
        formatSwatches(theme.colors),
        "",
        await renderThemePreview(theme),
        "",
        `Scopes: ${theme.scopes.slice(0, 20).join(", ")}${theme.scopes.length > 20 ? ", ..." : ""}`,
    ];

    return `${lines.join("\n")}\n`;
}

/**
 * @param {readonly Theme[]} themes
 *
 * @returns {string}
 */
function formatThemeTable(themes) {
    const rows = themes.map((theme) => [
        theme.id,
        theme.appearance,
        theme.colors.background ?? "",
        theme.name,
    ]);
    const widths = [
        Math.max(2, ...rows.map((row) => row[0].length)),
        10,
        10,
    ];
    const lines = [
        `${"id".padEnd(widths[0])}  ${"appearance".padEnd(widths[1])}  ${"background".padEnd(widths[2])}  name`,
        `${"-".repeat(widths[0])}  ${"-".repeat(widths[1])}  ${"-".repeat(widths[2])}  ${"-".repeat(4)}`,
        ...rows.map(
            (row) =>
                `${row[0].padEnd(widths[0])}  ${row[1].padEnd(widths[1])}  ${row[2].padEnd(widths[2])}  ${row[3]}`
        ),
    ];

    return `${lines.join("\n")}\n`;
}

/**
 * @param {ThemeColors} colors
 *
 * @returns {string}
 */
function formatSwatches(colors) {
    return Object.entries(colors)
        .map(([name, color]) => {
            const swatch =
                color === null ? "      " : colorBlock(color, "      ");
            return `${name.padEnd(13)} ${swatch} ${color ?? "n/a"}`;
        })
        .join("\n");
}

/**
 * @param {ParsedArgs} parsedArgs
 * @param {NodeJS.ProcessEnv} env
 *
 * @returns {string}
 */
function getConfigPath(parsedArgs, env) {
    const explicitPath = getStringFlag(parsedArgs, "config");
    if (explicitPath !== undefined) {
        return path.resolve(explicitPath);
    }

    if (env.CODEX_TERMINAL_THEMES_CONFIG !== undefined) {
        return path.resolve(env.CODEX_TERMINAL_THEMES_CONFIG);
    }

    if (process.platform === "win32" && env.APPDATA !== undefined) {
        return path.join(env.APPDATA, "codex-terminal-themes", "config.json");
    }

    const configHome =
        env.XDG_CONFIG_HOME ?? path.join(os.homedir(), ".config");
    return path.join(configHome, "codex-terminal-themes", "config.json");
}

/**
 * @param {unknown} error
 *
 * @returns {string}
 */
function getErrorMessage(error) {
    return error instanceof Error ? error.message : String(error);
}

/**
 * @param {ParsedArgs} parsedArgs
 * @param {string} name
 *
 * @returns {number | undefined}
 */
function getNumberFlag(parsedArgs, name) {
    const value = getStringFlag(parsedArgs, name);
    if (value === undefined) {
        return undefined;
    }

    const parsedValue = Number.parseInt(value, 10);
    if (Number.isNaN(parsedValue)) {
        throw new Error(`Expected --${name} to be a number.`);
    }

    return parsedValue;
}

/**
 * @param {ParsedArgs} parsedArgs
 * @param {string} name
 *
 * @returns {string | undefined}
 */
function getStringFlag(parsedArgs, name) {
    const value = parsedArgs.flags.get(name);
    return typeof value === "string" ? value : undefined;
}

/**
 * @param {Theme} theme
 *
 * @returns {string}
 */
function getThemeFilePath(theme) {
    return path.join(packageRoot, theme.path);
}

/**
 * @param {ParsedArgs} parsedArgs
 * @param {string} name
 *
 * @returns {boolean}
 */
function hasFlag(parsedArgs, name) {
    return parsedArgs.flags.has(name);
}

/**
 * @param {ParsedArgs} parsedArgs
 *
 * @returns {boolean}
 */
function isJson(parsedArgs) {
    return hasFlag(parsedArgs, "json");
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
 * @returns {Promise<ThemeManifest>}
 */
async function loadManifest() {
    const manifestText = await readFile(manifestPath, "utf8");
    const manifest = /** @type {ThemeManifest} */ JSON.parse(manifestText);

    if (!Array.isArray(manifest.themes)) {
        throw new Error("Invalid metadata/themes.json: missing themes array.");
    }

    return manifest;
}

/**
 * @param {string[]} args
 *
 * @returns {ParsedArgs}
 */
function parseArgs(args) {
    /** @type {Map<string, string | true>} */
    const flags = new Map<string, string | true>();
    /** @type {string[]} */
    const positionals: string[] = [];

    for (let index = 0; index < args.length; index += 1) {
        const arg = args[index];

        if (arg === "--") {
            positionals.push(...args.slice(index + 1));
            break;
        }

        if (arg.startsWith("--")) {
            const [rawName, inlineValue] = arg.slice(2).split("=", 2);
            const nextArg = args[index + 1];
            if (inlineValue !== undefined) {
                flags.set(rawName, inlineValue);
            } else if (nextArg !== undefined && !nextArg.startsWith("-")) {
                flags.set(rawName, nextArg);
                index += 1;
            } else {
                flags.set(rawName, true);
            }
            continue;
        }

        if (arg.startsWith("-") && arg.length > 1) {
            for (const flag of arg.slice(1)) {
                flags.set(flag, true);
            }
            continue;
        }

        positionals.push(arg);
    }

    return { args, flags, positionals };
}

/**
 * @param {string} key
 * @param {string} value
 *
 * @returns {boolean | string}
 */
function parseConfigValue(key, value) {
    if (key === "skipBatCache") {
        if (
            [
                "1",
                "true",
                "yes",
            ].includes(value.toLowerCase())
        ) {
            return true;
        }

        if (
            [
                "0",
                "false",
                "no",
            ].includes(value.toLowerCase())
        ) {
            return false;
        }

        throw new Error("skipBatCache must be true or false.");
    }

    if (key === "defaultTarget") {
        parseTargets(value);
    }

    return value;
}

/**
 * @param {string} value
 *
 * @returns {readonly string[]}
 */
function parseTargets(value) {
    const targets = value === "both" ? ["codex", "bat"] : value.split(",");
    const normalizedTargets = targets
        .map((target) => target.trim())
        .filter(Boolean);

    for (const target of normalizedTargets) {
        if (!["bat", "codex"].includes(target)) {
            throw new Error("Target must be codex, bat, or both.");
        }
    }

    return [...new Set(normalizedTargets)];
}

/**
 * @returns {Promise<Record<string, unknown>>}
 */
async function readPackageJson() {
    return /** @type {Record<string, unknown>} */ JSON.parse(
        await readFile(path.join(packageRoot, "package.json"), "utf8")
    );
}

/**
 * @param {string} configPath
 *
 * @returns {Promise<CliConfig>}
 */
async function readConfig(configPath) {
    try {
        const configText = await readFile(configPath, "utf8");
        const config = /** @type {CliConfig} */ JSON.parse(configText);

        if (!isRecord(config)) {
            throw new Error(`Config file is not a JSON object: ${configPath}`);
        }

        return config;
    } catch (error) {
        if (isNodeError(error) && error.code === "ENOENT") {
            return {};
        }

        throw error;
    }
}

/**
 * @param {unknown} error
 *
 * @returns {error is NodeJS.ErrnoException}
 */
function isNodeError(error) {
    return error instanceof Error && "code" in error;
}

/**
 * @param {string} configPath
 * @param {CliConfig} config
 *
 * @returns {Promise<void>}
 */
async function writeConfig(configPath, config) {
    await mkdir(path.dirname(configPath), { recursive: true });

    await writeFile(configPath, `${JSON.stringify(config, null, 4)}\n`, "utf8");
}

/**
 * @param {Theme} theme
 *
 * @returns {Promise<string>}
 */
async function renderThemePreview(theme) {
    const styles = await readThemeStyles(theme);
    const globalStyle = {
        background: theme.colors.background ?? "#000000",
        foreground: theme.colors.foreground ?? "#FFFFFF",
    };
    const tokenLine = sampleTokens
        .map((token) => {
            const style = resolveStyle(styles, token.scope);
            return colorText(token.text, {
                background: style.background ?? globalStyle.background,
                foreground: style.foreground ?? globalStyle.foreground,
            });
        })
        .join(" ");
    const scopeLines = sampleTokens.map((token) => {
        const style = resolveStyle(styles, token.scope);
        const foreground = style.foreground ?? globalStyle.foreground;
        const background = style.background ?? globalStyle.background;
        return `${token.label.padEnd(10)} ${colorBlock(background, "  ")} ${foreground.padEnd(9)} ${colorText(token.scope, { background, foreground })}`;
    });
    return [
        colorText(" Theme preview ", globalStyle),
        tokenLine,
        ...scopeLines,
    ].join("\n");
}

/**
 * @param {readonly ThemeStyle[]} styles
 * @param {string} scope
 *
 * @returns {ThemeStyle}
 */
function resolveStyle(styles, scope) {
    return (
        styles.find((style) => style.scopeParts?.includes(scope)) ??
        styles.find((style) =>
            style.scopeParts?.some(
                (scopePart) =>
                    scopePart === scope ||
                    scopePart.startsWith(`${scope}.`) ||
                    scope.startsWith(`${scopePart}.`)
            )
        ) ??
        {}
    );
}

/**
 * @param {Theme} theme
 *
 * @returns {Promise<
 *     readonly (ThemeStyle & { readonly scopeParts?: readonly string[] })[]
 * >}
 */
async function readThemeStyles(theme) {
    const source = getThemeFilePath(theme);

    const text = await readFile(source, "utf8");
    const parsedDocument = /** @type {unknown} */ parser.parse(text);
    const topLevelEntries = getTopLevelDictionary(parsedDocument);
    const settingsNode = topLevelEntries.get("settings");
    const settingsArray =
        isRecord(settingsNode) && Array.isArray(settingsNode.array)
            ? settingsNode.array
            : [];

    return settingsArray.flatMap((item) => {
        if (!isRecord(item) || !Array.isArray(item.dict)) {
            return [];
        }

        const entries = getDictionaryEntries(item.dict);
        const scope = getStringValue(entries.get("scope"));
        const settings = getDictionaryValue(entries, "settings");
        const foreground = getStringValue(settings.get("foreground"));
        const background = getStringValue(settings.get("background"));
        const fontStyle = getStringValue(settings.get("fontStyle"));

        if (
            scope === undefined ||
            (foreground === undefined && background === undefined)
        ) {
            return [];
        }

        return [
            {
                background,
                fontStyle,
                foreground,
                scopeParts: scope
                    .split(",")
                    .map((scopePart) => scopePart.trim())
                    .filter(Boolean),
            },
        ];
    });
}

/**
 * @param {readonly unknown[]} dictChildren
 *
 * @returns {Map<string, unknown>}
 */
function getDictionaryEntries(dictChildren) {
    /** @type {Map<string, unknown>} */
    const entries = new Map();
    /** @type {string | undefined} */
    let currentKey;

    for (const child of dictChildren) {
        if (isRecord(child) && Object.hasOwn(child, "key")) {
            currentKey = getTextNodeValue(child.key);
            continue;
        }

        if (
            currentKey !== undefined &&
            !(isRecord(child) && Object.hasOwn(child, "#text"))
        ) {
            entries.set(currentKey, child);
            currentKey = undefined;
        }
    }

    return entries;
}

/**
 * @param {Map<string, unknown>} entries
 * @param {string} key
 *
 * @returns {Map<string, unknown>}
 */
function getDictionaryValue(entries, key) {
    const value = entries.get(key);
    return isRecord(value) && Array.isArray(value.dict)
        ? getDictionaryEntries(value.dict)
        : new Map();
}

/**
 * @param {unknown} parsedDocument
 *
 * @returns {Map<string, unknown>}
 */
function getTopLevelDictionary(parsedDocument) {
    if (!Array.isArray(parsedDocument)) {
        return new Map();
    }

    const plistNode = parsedDocument.find(
        (node) => isRecord(node) && Object.hasOwn(node, "plist")
    );
    if (!isRecord(plistNode) || !Array.isArray(plistNode.plist)) {
        return new Map();
    }

    const dictNode = plistNode.plist.find(
        (node) => isRecord(node) && Object.hasOwn(node, "dict")
    );
    return isRecord(dictNode) && Array.isArray(dictNode.dict)
        ? getDictionaryEntries(dictNode.dict)
        : new Map();
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
    if (!Array.isArray(value) || !isRecord(value[0])) {
        return undefined;
    }

    const textValue = value[0]["#text"];
    return typeof textValue === "string" ? textValue : undefined;
}

/**
 * @param {ParsedArgs} parsedArgs
 * @param {CliConfig} config
 * @param {CliIo} io
 *
 * @returns {Promise<
 *     readonly { readonly directory: string; readonly name: string }[]
 * >}
 */
async function resolveInstallTargets(parsedArgs, config, io) {
    const targetValue =
        getStringFlag(parsedArgs, "target") ?? config.defaultTarget ?? "both";
    const targetNames = parseTargets(targetValue);
    const targets: InstallTarget[] = [];

    if (targetNames.includes("codex")) {
        targets.push({
            directory:
                getStringFlag(parsedArgs, "codex-dir") ??
                config.codexDir ??
                path.join(
                    io.env.CODEX_HOME ?? path.join(os.homedir(), ".codex"),
                    "themes"
                ),
            name: "codex",
        });
    }

    if (targetNames.includes("bat")) {
        const batDirectory =
            getStringFlag(parsedArgs, "bat-dir") ??
            config.batDir ??
            (await resolveBatThemeDirectory(io));
        targets.push({
            directory: batDirectory,
            name: "bat",
        });
    }

    return targets;
}

/**
 * @param {CliIo} io
 *
 * @returns {Promise<string>}
 */
async function resolveBatThemeDirectory(io) {
    const result = await spawnText("bat", ["--config-dir"], io);
    if (result.exitCode !== 0 || result.stdout.trim().length === 0) {
        throw new Error(
            "bat is not available. Use --target codex or --bat-dir."
        );
    }

    return path.join(result.stdout.trim(), "themes");
}

/**
 * @param {readonly Theme[]} themes
 * @param {readonly string[]} queries
 *
 * @returns {readonly Theme[]}
 */
function resolveThemes(themes, queries) {
    return queries.map((query) => resolveTheme(themes, query));
}

/**
 * @param {readonly Theme[]} themes
 * @param {string} query
 *
 * @returns {Theme}
 */
function resolveTheme(themes, query) {
    const normalizedQuery = query.toLowerCase();
    const exactMatch = themes.find(
        (theme) =>
            theme.id.toLowerCase() === normalizedQuery ||
            theme.name.toLowerCase() === normalizedQuery ||
            theme.fileName.toLowerCase() === normalizedQuery ||
            theme.path.toLowerCase() === normalizedQuery
    );

    if (exactMatch !== undefined) {
        return exactMatch;
    }

    const fuzzyMatches = themes.filter((theme) =>
        [
            theme.id,
            theme.name,
            theme.fileName,
        ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery)
    );

    if (fuzzyMatches.length === 1) {
        return fuzzyMatches[0];
    }

    if (fuzzyMatches.length > 1) {
        throw new Error(
            `Theme query is ambiguous: ${query}. Matches: ${fuzzyMatches
                .slice(0, 8)
                .map((theme) => theme.id)
                .join(", ")}`
        );
    }

    throw new Error(`Theme not found: ${query}`);
}

/**
 * @param {ThemeManifest} manifest
 * @param {CliConfig} config
 * @param {ParsedArgs} parsedArgs
 * @param {CliIo} io
 *
 * @returns {Promise<readonly DoctorCheck[]>}
 */
async function runDoctorChecks(manifest, config, parsedArgs, io) {
    const sampleThemes = manifest.themes.slice(0, 20);
    const codexDir =
        getStringFlag(parsedArgs, "codex-dir") ??
        config.codexDir ??
        path.join(
            io.env.CODEX_HOME ?? path.join(os.homedir(), ".codex"),
            "themes"
        );
    const checks: DoctorCheck[] = [
        {
            detail: `${manifest.themeCount} themes in metadata`,
            name: "manifest",
            ok:
                manifest.themeCount === manifest.themes.length &&
                manifest.themeCount > 0,
        },
        {
            detail: await directoryDetail(themeRoot),
            name: "theme directory",
            ok: await isDirectory(themeRoot),
        },
        {
            detail: await validateSampleThemes(sampleThemes),
            name: "theme validation sample",
            ok: (
                await Promise.all(
                    sampleThemes.map((theme) =>
                        validateThemeFile(getThemeFilePath(theme))
                    )
                )
            ).every((result) => result.ok),
        },
        {
            detail: await directoryAccessDetail(codexDir),
            name: "codex theme directory",
            ok: await canCreateOrWriteDirectory(codexDir),
        },
    ];
    const batResult = await spawnText("bat", ["--version"], io);
    checks.push({
        detail:
            batResult.exitCode === 0
                ? batResult.stdout.trim()
                : "bat not found or not executable",
        name: "bat executable",
        ok: batResult.exitCode === 0,
    });

    return checks;
}

/**
 * @param {readonly Theme[]} themes
 * @param {CliIo} io
 *
 * @returns {Promise<Theme | null>}
 */
async function runPicker(themes, io): Promise<Theme | null> {
    let index = 0;
    let query = "";
    let filteredThemes = themes;

    const render = async () => {
        filteredThemes = themes.filter((theme) =>
            [
                theme.id,
                theme.name,
                theme.fileName,
            ]
                .join(" ")
                .toLowerCase()
                .includes(query.toLowerCase())
        );
        index = Math.min(index, Math.max(0, filteredThemes.length - 1));
        const selectedTheme = filteredThemes[index];
        const height = io.stdout.rows ?? 30;
        const listHeight = Math.max(5, Math.min(12, height - 14));
        const start = Math.max(0, index - Math.floor(listHeight / 2));
        const visibleThemes = filteredThemes.slice(start, start + listHeight);
        const lines = [
            "\u001B[?25l\u001B[2J\u001B[H",
            "codex-terminal-themes picker",
            dim(
                "Type to filter, use arrows or j/k, Enter selects, q/Esc cancels."
            ),
            `Search: ${query || dim("(all)")}`,
            "",
            ...visibleThemes.map((theme, visibleIndex) => {
                const actualIndex = start + visibleIndex;
                const marker = actualIndex === index ? ">" : " ";
                return `${marker} ${theme.id.padEnd(40).slice(0, 40)} ${theme.appearance.padEnd(7)} ${theme.name}`;
            }),
            "",
            selectedTheme === undefined
                ? "No matches."
                : await renderThemePreview(selectedTheme),
        ];
        io.stdout.write(lines.join("\n"));
    };

    io.stdin.setRawMode(true);
    io.stdin.resume();
    io.stdin.setEncoding("utf8");

    try {
        await render();

        return await new Promise((resolve) => {
            /**
             * @param {Buffer | string} chunk
             *
             * @returns {void}
             */
            const onData = (chunk) => {
                const input = String(chunk);

                if (input === "\u0003" || input === "\u001B" || input === "q") {
                    cleanup();
                    resolve(null);
                    return;
                }

                if (input === "\r" || input === "\n") {
                    const selectedTheme = filteredThemes[index] ?? null;
                    cleanup();
                    resolve(selectedTheme);
                    return;
                }

                if (input === "\u001B[A" || input === "k") {
                    index = Math.max(0, index - 1);
                } else if (input === "\u001B[B" || input === "j") {
                    index = Math.min(
                        Math.max(0, filteredThemes.length - 1),
                        index + 1
                    );
                } else if (input === "\u001B[5~") {
                    index = Math.max(0, index - 10);
                } else if (input === "\u001B[6~") {
                    index = Math.min(
                        Math.max(0, filteredThemes.length - 1),
                        index + 10
                    );
                } else if (input === "\u007F" || input === "\b") {
                    query = query.slice(0, -1);
                    index = 0;
                } else if (isPickerSearchCharacter(input)) {
                    query += input;
                    index = 0;
                }

                void render();
            };

            const cleanup = () => {
                io.stdin.off("data", onData);
                io.stdin.setRawMode(false);
                io.stdout.write("\u001B[2J\u001B[H\u001B[?25h");
            };

            io.stdin.on("data", onData);
        });
    } catch (error) {
        io.stdin.setRawMode(false);
        io.stdout.write("\u001B[?25h");
        throw error;
    }
}

/**
 * @param {CliIo} io
 *
 * @returns {Promise<Record<string, string>>}
 */
async function runBatCache(io): Promise<InstallResult> {
    const result = await spawnText("bat", ["cache", "--build"], io);
    return {
        destination: "bat cache",
        reason: result.exitCode === 0 ? "" : result.stderr.trim(),
        source: "bat cache --build",
        status: result.exitCode === 0 ? "rebuilt" : "failed",
        target: "bat",
        theme: "cache",
    };
}

/**
 * @param {ParsedArgs} parsedArgs
 *
 * @returns {readonly string[]}
 */
function serializeForwardedInstallFlags(parsedArgs) {
    const forwardedFlags = [
        "bat-dir",
        "codex-dir",
        "config",
        "dry-run",
        "force",
        "json",
        "skip-bat-cache",
        "target",
    ];
    return forwardedFlags.flatMap((flag) => {
        const value = parsedArgs.flags.get(flag);
        if (value === undefined) {
            return [];
        }

        return value === true ? [`--${flag}`] : [`--${flag}`, value];
    });
}

/**
 * @param {string} source
 * @param {string} destination
 *
 * @returns {Promise<boolean>}
 */
async function sameFileContent(source, destination) {
    try {
        const [sourceHash, destinationHash] = await Promise.all([
            hashFile(source),
            hashFile(destination),
        ]);
        return sourceHash === destinationHash;
    } catch (error) {
        if (isNodeError(error) && error.code === "ENOENT") {
            return false;
        }

        throw error;
    }
}

/**
 * @param {string} filePath
 *
 * @returns {Promise<string>}
 */
async function hashFile(filePath) {
    return createHash("sha256")
        .update(await readFile(filePath))
        .digest("hex");
}

/**
 * @param {string} command
 * @param {readonly string[]} args
 * @param {CliIo} io
 *
 * @returns {Promise<{
 *     readonly exitCode: number;
 *     readonly stderr: string;
 *     readonly stdout: string;
 * }>}
 */
async function spawnText(command, args, io): Promise<SpawnTextResult> {
    return new Promise<SpawnTextResult>((resolve) => {
        const childProcess = spawn(command, args, {
            cwd: io.cwd,
            env: io.env,
            shell: false,
            stdio: [
                "ignore",
                "pipe",
                "pipe",
            ],
        });
        /** @type {Buffer[]} */
        const stdout: Buffer[] = [];
        /** @type {Buffer[]} */
        const stderr: Buffer[] = [];

        childProcess.stdout.on("data", (chunk) => {
            stdout.push(Buffer.from(chunk));
        });
        childProcess.stderr.on("data", (chunk) => {
            stderr.push(Buffer.from(chunk));
        });
        childProcess.on("error", (error) => {
            resolve({
                exitCode: 1,
                stderr: getErrorMessage(error),
                stdout: "",
            });
        });
        childProcess.on("close", (exitCode) => {
            resolve({
                exitCode: exitCode ?? 1,
                stderr: Buffer.concat(stderr).toString("utf8"),
                stdout: Buffer.concat(stdout).toString("utf8"),
            });
        });
    });
}

/**
 * @param {string} input
 *
 * @returns {boolean}
 */
function isPickerSearchCharacter(input) {
    return input.length === 1 && input >= " " && input !== "\u007F";
}

/**
 * @param {string} filePath
 *
 * @returns {Promise<
 *     | { readonly ok: true; readonly reason: "" }
 *     | { readonly ok: false; readonly reason: string }
 * >}
 */
async function validateThemeFile(filePath) {
    try {
        const text = await readFile(filePath, "utf8");
        const validation = SyntaxValidator.validate(text);

        if (validation !== true) {
            const { col, line, msg } = validation.err;
            return {
                ok: false,
                reason: `XML parse error at ${line}:${col}: ${msg}`,
            };
        }

        return { ok: true, reason: "" };
    } catch (error) {
        return { ok: false, reason: getErrorMessage(error) };
    }
}

/**
 * @param {readonly Theme[]} sampleThemes
 *
 * @returns {Promise<string>}
 */
async function validateSampleThemes(sampleThemes) {
    const results = await Promise.all(
        sampleThemes.map((theme) => validateThemeFile(getThemeFilePath(theme)))
    );
    const failedResults = results.filter((result) => !result.ok);
    return failedResults.length === 0
        ? `validated ${sampleThemes.length} sample themes`
        : `${failedResults.length} sample themes failed validation`;
}

/**
 * @param {ParsedArgs} parsedArgs
 * @param {NodeJS.WritableStream} stdout
 * @param {unknown} jsonValue
 * @param {string} textValue
 *
 * @returns {void}
 */
function writeJsonOrText(parsedArgs, stdout, jsonValue, textValue) {
    stdout.write(
        isJson(parsedArgs)
            ? `${JSON.stringify(jsonValue, null, 4)}\n`
            : textValue
    );
}

/**
 * @param {NodeJS.WritableStream} stream
 *
 * @returns {void}
 */
function writeHelp(stream) {
    stream.write(
        'codex-terminal-themes\n\nUsage:\n  codex-terminal-themes list [--search text] [--appearance dark|light|unknown] [--json]\n  codex-terminal-themes show <theme> [--json]\n  codex-terminal-themes path <theme>\n  codex-terminal-themes install <theme...|--all> [--target codex|bat|both] [--dry-run]\n  codex-terminal-themes pick [--install] [--target codex|bat|both]\n  codex-terminal-themes doctor [--json]\n  codex-terminal-themes config list|get|set|unset|path\n\nInstall options:\n  --codex-dir <path>      Override the Codex themes directory.\n  --bat-dir <path>        Override the bat themes directory.\n  --skip-bat-cache        Do not run "bat cache --build" after bat installs.\n  --force                 Copy even when source and destination hashes match.\n  --config <path>         Use a specific CLI config file.\n\nConfig keys:\n  defaultTheme, defaultTarget, codexDir, batDir, skipBatCache\n'
    );
}

/**
 * @param {string} directory
 *
 * @returns {Promise<boolean>}
 */
async function canCreateOrWriteDirectory(directory) {
    try {
        if (await isDirectory(directory)) {
            await access(directory, fsConstants.W_OK);
            return true;
        }

        await access(path.dirname(directory), fsConstants.W_OK);
        return true;
    } catch {
        return false;
    }
}

/**
 * @param {string} directory
 *
 * @returns {Promise<string>}
 */
async function directoryAccessDetail(directory) {
    return (await canCreateOrWriteDirectory(directory))
        ? `writable or creatable: ${directory}`
        : `not writable or parent missing: ${directory}`;
}

/**
 * @param {string} directory
 *
 * @returns {Promise<string>}
 */
async function directoryDetail(directory) {
    if (!(await isDirectory(directory))) {
        return `missing: ${directory}`;
    }

    const files = await readdir(directory);
    return `${files.filter((fileName) => fileName.endsWith(".tmTheme")).length} .tmTheme files`;
}

/**
 * @param {string} directory
 *
 * @returns {Promise<boolean>}
 */
async function isDirectory(directory) {
    try {
        return (await stat(directory)).isDirectory();
    } catch {
        return false;
    }
}

/**
 * @param {string | undefined} color
 * @param {string} text
 *
 * @returns {string}
 */
function colorBlock(color, text) {
    const parsedColor = color === undefined ? null : parseHexColor(color);
    return parsedColor === null
        ? text
        : `\u001B[48;2;${parsedColor.red};${parsedColor.green};${parsedColor.blue}m${text}${reset}`;
}

/**
 * @param {string} text
 * @param {{ readonly background?: string; readonly foreground?: string }} style
 *
 * @returns {string}
 */
function colorText(text, style) {
    const foreground = parseHexColor(style.foreground);
    const background = parseHexColor(style.background);
    const codes: string[] = [];

    if (foreground !== null) {
        codes.push(
            `38;2;${foreground.red};${foreground.green};${foreground.blue}`
        );
    }

    if (background !== null) {
        codes.push(
            `48;2;${background.red};${background.green};${background.blue}`
        );
    }

    return codes.length === 0
        ? text
        : `\u001B[${codes.join(";")}m${text}${reset}`;
}

/**
 * @param {string | undefined} color
 *
 * @returns {{
 *     readonly blue: number;
 *     readonly green: number;
 *     readonly red: number;
 * } | null}
 */
function parseHexColor(color) {
    if (color === undefined) {
        return null;
    }

    const match = /^#(?<hex>[\da-f]{3}|[\da-f]{6}|[\da-f]{8})$/iv.exec(
        color.trim()
    );
    if (match?.groups === undefined) {
        return null;
    }

    const { hex } = match.groups;
    const expandedHex =
        hex.length === 3
            ? `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`
            : hex.slice(0, 6);

    return {
        blue: Number.parseInt(expandedHex.slice(4, 6), 16),
        green: Number.parseInt(expandedHex.slice(2, 4), 16),
        red: Number.parseInt(expandedHex.slice(0, 2), 16),
    };
}
