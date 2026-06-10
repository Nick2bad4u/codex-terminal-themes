#!/usr/bin/env node
import { runCli } from "../src/cli.js";

process.exitCode = await runCli(process.argv.slice(2), {
    cwd: process.cwd(),
    env: process.env,
    stderr: process.stderr,
    stdin: process.stdin,
    stdout: process.stdout,
});
