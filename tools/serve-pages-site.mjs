import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import * as path from "node:path";

const defaultHost = "127.0.0.1";
const defaultPort = 4173;
const rootDirectory = process.cwd();
const docsDirectory = path.join(rootDirectory, "docs");

/**
 * @param {string} docsRoot
 *
 * @returns {(
 *     request: import("node:http").IncomingMessage,
 *     response: import("node:http").ServerResponse
 * ) => Promise<void>}
 */
function createRequestHandler(docsRoot) {
    return async (request, response) => {
        const requestUrl = request.url ?? "/";
        const filePath = getRequestedFilePath(docsRoot, requestUrl);

        if (filePath === null) {
            sendNotFound(response);
            return;
        }

        await sendFile(response, filePath);
    };
}

/**
 * @param {string} filePath
 *
 * @returns {string}
 */
function getContentType(filePath) {
    const extension = path.extname(filePath).toLowerCase();

    switch (extension) {
        case ".css": {
            return "text/css; charset=utf-8";
        }

        case ".html": {
            return "text/html; charset=utf-8";
        }

        case ".js": {
            return "text/javascript; charset=utf-8";
        }

        case ".json": {
            return "application/json; charset=utf-8";
        }

        case ".svg": {
            return "image/svg+xml";
        }

        default: {
            return "application/octet-stream";
        }
    }
}

/**
 * @param {string} optionName
 * @param {number} fallback
 *
 * @returns {number}
 */
function getIntegerOption(optionName, fallback) {
    const value = getStringOption(optionName, "");
    const parsedValue = Number.parseInt(value, 10);

    return Number.isInteger(parsedValue) && parsedValue > 0
        ? parsedValue
        : fallback;
}

/**
 * @param {string} docsRoot
 * @param {string} requestUrl
 *
 * @returns {null | string}
 */
function getRequestedFilePath(docsRoot, requestUrl) {
    const parsedUrl = new URL(requestUrl, "http://localhost");
    const decodedPath = decodeURIComponent(parsedUrl.pathname);
    const relativePath =
        decodedPath === "/" ? "index.html" : decodedPath.replace(/^\/+/v, "");
    const filePath = path.resolve(docsRoot, relativePath);

    return isPathInside(docsRoot, filePath) ? filePath : null;
}

/**
 * @returns {{ host: string; port: number }}
 */
function getServerOptions() {
    return {
        host: getStringOption("--host", defaultHost),
        port: getIntegerOption("--port", defaultPort),
    };
}

/**
 * @param {string} optionName
 * @param {string} fallback
 *
 * @returns {string}
 */
function getStringOption(optionName, fallback) {
    const prefix = `${optionName}=`;
    const argument = process.argv.find((item) => item.startsWith(prefix));

    return argument === undefined ? fallback : argument.slice(prefix.length);
}

/**
 * @param {string} rootPath
 * @param {string} candidatePath
 *
 * @returns {boolean}
 */
function isPathInside(rootPath, candidatePath) {
    const relativePath = path.relative(rootPath, candidatePath);

    return (
        relativePath.length === 0 ||
        (!relativePath.startsWith("..") && !path.isAbsolute(relativePath))
    );
}

/**
 * @returns {void}
 */
function main() {
    const { host, port } = getServerOptions();
    const requestHandler = createRequestHandler(docsDirectory);
    const server = createServer((request, response) => {
        void requestHandler(request, response);
    });

    server.listen(port, host, () => {
        process.stdout.write(
            `Serving docs at http://${host}:${String(port)}/\n`
        );
    });
}

/**
 * @returns {void}
 */
function run() {
    try {
        main();
    } catch (error) {
        process.stderr.write(`${String(error)}\n`);
        process.exitCode = 1;
    }
}

/**
 * @param {import("node:http").ServerResponse} response
 * @param {string} filePath
 *
 * @returns {Promise<void>}
 */
async function sendFile(response, filePath) {
    try {
        // eslint-disable-next-line security/detect-non-literal-fs-filename -- The request path is constrained to the repo-local docs directory.
        const contents = await readFile(filePath);
        response.writeHead(200, {
            "Content-Type": getContentType(filePath),
        });
        response.end(contents);
    } catch {
        sendNotFound(response);
    }
}

/**
 * @param {import("node:http").ServerResponse} response
 *
 * @returns {void}
 */
function sendNotFound(response) {
    response.writeHead(404, {
        "Content-Type": "text/plain; charset=utf-8",
    });
    response.end("Not found\n");
}

run();
