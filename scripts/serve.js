import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
const root = resolve(".");
const port = Number(process.env.PORT || 49317);
const types = {
  ".html": "text/html; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/plain; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".model": "application/octet-stream",
  ".wasm": "application/wasm",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".webmanifest": "application/manifest+json",
};

/** Serve only the static application and its local assets.
 * @param {import('node:http').IncomingMessage} request HTTP request.
 * @param {import('node:http').ServerResponse} response HTTP response.
 * @returns {Promise<void>} Completes the response. */
async function serve(request, response) {
  try {
    let pathname = decodeURIComponent(
      new URL(request.url, "http://localhost").pathname,
    );
    if (pathname === "/") {
      pathname = "/index.html";
    }
    if (
      !/^\/(index\.html$|licenses\.html$|LICENSE$|THIRD_PARTY_NOTICES\.md$|favicon\.ico$|og-image\.jpg$|manifest\.webmanifest$|src\/|styles\/|vendor\/|assets\/)/.test(
        pathname,
      )
    ) {
      response.writeHead(404).end();
      return;
    }
    const path = resolve(root, "." + pathname);
    if (!path.startsWith(root + sep)) {
      response.writeHead(403).end();
      return;
    }
    const data = await readFile(path);
    let type = "application/octet-stream";
    if (types[extname(path)]) {
      type = types[extname(path)];
    }
    if (pathname === "/LICENSE") {
      type = "text/plain; charset=utf-8";
    }
    response
      .writeHead(200, {
        "Content-Type": type,
        "Cache-Control": "no-store",
      })
      .end(data);
  } catch {
    response.writeHead(404).end();
  }
}
createServer(serve).listen(
  port,
  "127.0.0.1",
  /** Report the local development server address once listening.
   * @returns {*} Operation result or undefined for a side effect. */
  () => console.log("KI-Text-Analyzer: http://127.0.0.1:" + port),
);
