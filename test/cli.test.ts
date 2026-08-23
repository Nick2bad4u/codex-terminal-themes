import { mkdtemp, readFile, rm } from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { Writable } from "node:stream";
import { expect, test } from "vitest";

import { runCli } from "../src/cli.js";

function createBufferStream() {
    const chunks: Buffer[] = [];
    const stream = new Writable({
        write(chunk, _encoding, callback) {
            chunks.push(Buffer.from(chunk));
            callback();
        },
    });

    return {
        stream,
        text: () => Buffer.concat(chunks).toString("utf8"),
    };
}

/**
 * @param {string[]} args
 * @param {{ readonly env?: NodeJS.ProcessEnv }} [options]
 *
 * @returns {Promise<{
 *     readonly exitCode: number;
 *     readonly stderr: string;
 *     readonly stdout: string;
 * }>}
 */
async function run(args, options: { readonly env?: NodeJS.ProcessEnv } = {}) {
    const stdout = createBufferStream();
    const stderr = createBufferStream();

    const stdin = {
        isTTY: false,
        off: () => stdin,
        on: () => stdin,
        resume: () => stdin,
        setEncoding: () => stdin,
        setRawMode: () => stdin,
    } as unknown as NodeJS.ReadStream & { readonly isTTY?: boolean };
    const stdoutStream = Object.assign(stdout.stream, {
        isTTY: false,
    }) as NodeJS.WritableStream & { readonly isTTY?: boolean };

    const exitCode = await runCli(args, {
        cwd: process.cwd(),
        env: {
            ...process.env,
            ...options.env,
        },
        stderr: stderr.stream,
        stdin,
        stdout: stdoutStream,
    });

    return {
        exitCode,
        stderr: stderr.text(),
        stdout: stdout.text(),
    };
}

test("help and version flags print package information", async () => {
    const helpResult = await run(["--help"]);
    const versionResult = await run(["--version"]);

    expect(helpResult.exitCode).toBe(0);
    expect(helpResult.stdout).toMatch(/codex-terminal-themes/v);
    expect(versionResult.exitCode).toBe(0);
    expect(versionResult.stdout.trim()).toMatch(/^\d+\.\d+\.\d+$/v);
});

test("unknown commands fail with help on stderr", async () => {
    const result = await run(["not-a-command"]);

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toMatch(/Unknown command: not-a-command/v);
    expect(result.stderr).toMatch(/codex-terminal-themes/v);
});

test("list prints theme ids", async () => {
    const result = await run([
        "list",
        "--search",
        "Nicks-Codex-Noir",
    ]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toMatch(/nicks-codex-noir/v);
});

test("list emits machine-readable JSON", async () => {
    const result = await run([
        "list",
        "--json",
        "--search",
        "Noir",
    ]);
    const parsed = JSON.parse(result.stdout) as readonly {
        readonly id: string;
    }[];

    expect(result.exitCode).toBe(0);
    expect(parsed.some((theme) => theme.id === "nicks-codex-noir")).toBe(true);
});

test("show prints details and preview", async () => {
    const result = await run(["show", "nicks-codex-noir"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toMatch(/Nicks-Codex-Noir/v);
    expect(result.stdout).toMatch(/Theme preview/v);
});

test("path prints an absolute theme path", async () => {
    const result = await run(["path", "nicks-codex-noir"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout.trim()).toMatch(/Nicks-Codex-Noir\.tmTheme$/v);
    expect(path.isAbsolute(result.stdout.trim())).toBe(true);
});

test("install supports dry-run codex target with custom directory", async () => {
    const tempDirectory = await mkdtemp(
        path.join(os.tmpdir(), "codex-terminal-themes-")
    );

    try {
        const result = await run([
            "install",
            "nicks-codex-noir",
            "--target",
            "codex",
            "--codex-dir",
            path.join(tempDirectory, "themes"),
            "--dry-run",
            "--json",
        ]);

        expect(result.exitCode).toBe(0);
        expect(result.stdout).toMatch(/"status": "dry-run"/v);
    } finally {
        await rm(tempDirectory, { force: true, recursive: true });
    }
});

test("install copies a selected theme", async () => {
    const tempDirectory = await mkdtemp(
        path.join(os.tmpdir(), "codex-terminal-themes-")
    );
    const themeDirectory = path.join(tempDirectory, "themes");

    try {
        const result = await run([
            "install",
            "nicks-codex-noir",
            "--target",
            "codex",
            "--codex-dir",
            themeDirectory,
        ]);
        const copiedTheme = await readFile(
            path.join(themeDirectory, "Nicks-Codex-Noir.tmTheme"),
            "utf8"
        );

        expect(result.exitCode).toBe(0);
        expect(result.stdout).toMatch(/copied codex:nicks-codex-noir/v);
        expect(copiedTheme).toMatch(/<string>Nicks-Codex-Noir<\/string>/v);
    } finally {
        await rm(tempDirectory, { force: true, recursive: true });
    }
});

test("config set and get use the requested config path", async () => {
    const tempDirectory = await mkdtemp(
        path.join(os.tmpdir(), "codex-terminal-themes-")
    );
    const configPath = path.join(tempDirectory, "config.json");

    try {
        const configSetResult = await run([
            "config",
            "set",
            "defaultTheme",
            "nicks-codex-noir",
            "--config",
            configPath,
        ]);
        const configGetResult = await run([
            "config",
            "get",
            "defaultTheme",
            "--config",
            configPath,
        ]);

        expect(configSetResult.exitCode).toBe(0);
        expect(configGetResult.exitCode).toBe(0);
        expect(configGetResult.stdout.trim()).toBe("nicks-codex-noir");
    } finally {
        await rm(tempDirectory, { force: true, recursive: true });
    }
});

test("config path reports the explicit path", async () => {
    const configPath = path.join(process.cwd(), "custom-config.json");
    const result = await run([
        "config",
        "path",
        "--config",
        configPath,
    ]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout.trim()).toBe(configPath);
});

test("config rejects unsupported keys", async () => {
    const result = await run([
        "config",
        "get",
        "unsupported",
    ]);

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toMatch(/Expected one of these config keys/v);
});

test("install requires an explicit or configured theme", async () => {
    const tempDirectory = await mkdtemp(
        path.join(os.tmpdir(), "codex-terminal-themes-")
    );

    try {
        const result = await run([
            "install",
            "--config",
            path.join(tempDirectory, "missing-config.json"),
        ]);

        expect(result.exitCode).toBe(1);
        expect(result.stderr).toMatch(/Specify a theme id\/name\/path/v);
    } finally {
        await rm(tempDirectory, { force: true, recursive: true });
    }
});
