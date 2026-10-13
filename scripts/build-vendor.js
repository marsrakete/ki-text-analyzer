import { build } from "esbuild";
import { mkdir, copyFile, writeFile, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
await mkdir("vendor/licenses", {
  recursive: true,
});
await build({
  entryPoints: ["node_modules/gpt-tokenizer/esm/model/gpt2.js"],
  outfile: "vendor/gpt2.js",
  bundle: true,
  format: "esm",
  platform: "browser",
  minify: true,
  banner: {
    js: "/*! gpt-tokenizer 4.0.0 — MIT; Copyright 2023-2024 Bazyli Brzoska. Browser bundle generated with esbuild. Full notices: licenses.html and vendor/licenses/gpt-tokenizer.txt. */",
  },
});
// Only loadFromB64StringModel is used. The upstream fs import belongs to its
// unused Node file-loading path; fail explicitly if that path is ever invoked.
await build({
  stdin: {
    contents:
      'export { SentencePieceProcessor } from "@sctg/sentencepiece-js";',
    resolveDir: resolve("."),
  },
  outfile: "vendor/sentencepiece.js",
  bundle: true,
  format: "esm",
  platform: "browser",
  minify: true,
  banner: {
    js: "/*! @sctg/sentencepiece-js 1.3.3 and Google SentencePiece d8f741853847553169444afc12c00f4bbff3e9ce — Apache-2.0 with bundled third-party notices. Modified browser build: Node file loaders disabled, bundled and minified with esbuild. Full attribution and license texts: licenses.html and vendor/licenses/. */",
  },
  define: {
    "process.versions.node": "undefined",
  },
  plugins: [
    {
      name: "browser-fs",
      /** Register a browser shim for the upstream Node-only file loader.
       * @param {object} builder Esbuild plugin registration API.
       * @returns {void} Installs resolve and load callbacks. */
      setup(builder) {
        builder.onResolve(
          {
            filter: /^(fs|module)$/,
          },
          /** Route Node-only imports to the browser shim.
           * @param {*} args Input supplied by the enclosing API.
           * @returns {*} Operation result or undefined for a side effect. */
          (args) => ({
            path: args.path,
            namespace: "browser-fs",
          }),
        );
        builder.onLoad(
          {
            filter: /.*/,
            namespace: "browser-fs",
          },
          /** Provide explicit failure stubs for unused Node file loaders.
           * @returns {*} Operation result or undefined for a side effect. */
          () => ({
            contents:
              'export function readFileSync() { throw new Error("Node file loading is unavailable in this browser runtime."); } export function createRequire() { throw new Error("Node require is unavailable in this browser runtime."); }',
          }),
        );
      },
    },
  ],
});
await copyFile(
  "node_modules/gpt-tokenizer/LICENSE",
  "vendor/licenses/gpt-tokenizer.txt",
);
await copyFile(
  "node_modules/@sctg/sentencepiece-js/LICENSE",
  "vendor/licenses/sentencepiece-js.txt",
);
await copyFile("node_modules/buffer/LICENSE", "vendor/licenses/buffer.txt");
await copyFile(
  "node_modules/base64-js/LICENSE",
  "vendor/licenses/base64-js.txt",
);
await copyFile("node_modules/ieee754/LICENSE", "vendor/licenses/ieee754.txt");
const upstream = await readFile(
  "node_modules/@sctg/sentencepiece-js/dist/index.js",
  "utf8",
);
const microsoftNotice = upstream.match(/\/\*{10,}[\s\S]*?\*\//);
if (microsoftNotice) {
  await writeFile(
    "vendor/licenses/typescript-helpers.txt",
    microsoftNotice[0] + "\n",
  );
}
const files = [
  "vendor/gpt2.js",
  "vendor/sentencepiece.js",
  "assets/tokenizers/gemma.model",
];
const hashes = {};
for (const file of files) {
  hashes[file] = createHash("sha256")
    .update(await readFile(file))
    .digest("hex");
}
await writeFile(
  "assets/tokenizers/manifest.json",
  JSON.stringify(
    {
      gpt2: {
        package: "gpt-tokenizer",
        version: "4.0.0",
        vocabulary: "GPT-2/r50k",
      },
      gemma: {
        runtime: "@sctg/sentencepiece-js",
        version: "1.3.3",
        source:
          "https://github.com/google/gemma_pytorch/blob/33b652c465537c6158f9a472ea5700e5e770ad3f/tokenizer/tokenizer.model",
        commit: "33b652c465537c6158f9a472ea5700e5e770ad3f",
      },
      sha256: hashes,
    },
    null,
    2,
  ) + "\n",
);
console.log("Local tokenizer runtimes and manifest generated.");
