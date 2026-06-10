#!/usr/bin/env node
import { runCli } from "../src/cli.mjs";

void runCli(process.argv.slice(2), {
    cwd: process.cwd(),
    env: process.env,
    stderr: process.stderr,
    stdin: process.stdin,
    stdout: process.stdout,
}).then((exitCode) => {
    process.exitCode = exitCode;
});
