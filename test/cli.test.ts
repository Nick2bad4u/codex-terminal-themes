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
        off() {
            return stdin;
        },
        on() {
            return stdin;
        },
        resume() {
            return stdin;
        },
        setEncoding() {
            return stdin;
        },
        setRawMode() {
            return stdin;
        },
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

test("list prints theme ids", async () => {
    const result = await run([
        "list",
        "--search",
        "Nicks-Codex-Noir",
    ]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toMatch(/nicks-codex-noir/v);
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
        const setResult = await run([
            "config",
            "set",
            "defaultTheme",
            "nicks-codex-noir",
            "--config",
            configPath,
        ]);
        const getResult = await run([
            "config",
            "get",
            "defaultTheme",
            "--config",
            configPath,
        ]);

        expect(setResult.exitCode).toBe(0);
        expect(getResult.exitCode).toBe(0);
        expect(getResult.stdout.trim()).toBe("nicks-codex-noir");
    } finally {
        await rm(tempDirectory, { force: true, recursive: true });
    }
});
