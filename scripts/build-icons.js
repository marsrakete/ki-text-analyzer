import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import sharp from "sharp";
import { readSvgWithBrandMark } from "./lib/svg-assets.js";
const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** Render a square vector source and verify its dimensions.
 * @param {string} svg Standalone SVG markup.
 * @param {number} size Target width and height in pixels.
 * @returns {Promise<Buffer>} PNG image with the requested size. */
async function renderIcon(svg, size) {
  if (!Number.isInteger(size) || size < 16 || size > 512)
    throw new RangeError("Icon size must be an integer between 16 and 512.");
  const png = new Resvg(svg, {
    fitTo: { mode: "width", value: size },
    font: { loadSystemFonts: false },
  })
    .render()
    .asPng();
  const metadata = await sharp(png).metadata();
  if (metadata.width !== size || metadata.height !== size)
    throw new Error("Unexpected icon dimensions.");
  return png;
}

/** Package several square PNG frames in a standard ICO directory.
 * @param {Array<{size:number, png:Buffer}>} frames Icon frames up to 256 pixels.
 * @returns {Buffer} ICO bytes containing every supplied frame. */
function encodeIco(frames) {
  const header = Buffer.alloc(6 + frames.length * 16);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(frames.length, 4);
  let offset = header.length;
  for (const [index, frame] of frames.entries()) {
    const entry = 6 + index * 16;
    if (frame.size === 256) {
      header[entry] = 0;
      header[entry + 1] = 0;
    } else {
      header[entry] = frame.size;
      header[entry + 1] = frame.size;
    }
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(frame.png.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += frame.png.length;
  }
  return Buffer.concat([
    header,
    ...frames.map(
      /** Select the PNG bytes referenced by this ICO directory entry.
       * @param {object} frame Frame size and encoded PNG.
       * @returns {Buffer} Encoded image bytes. */
      (frame) => frame.png,
    ),
  ]);
}

/** Build browser favicons, Apple touch icons and Android maskable icons.
 * @returns {Promise<void>} Resolves after all configured files have been written. */
async function main() {
  const config = JSON.parse(
    await readFile(resolve(rootDir, "config/icons.config.json"), "utf8"),
  );
  const normal = await readSvgWithBrandMark(
    rootDir,
    config.source,
    config.source,
  );
  const maskable = await readSvgWithBrandMark(
    rootDir,
    config.maskableSource,
    config.source,
  );
  for (const output of config.outputs) {
    let source = normal;
    if (output.maskable) source = maskable;
    const target = resolve(rootDir, output.path);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, await renderIcon(source, output.size));
  }
  const frames = [];
  for (const size of config.ico.sizes)
    frames.push({ size, png: await renderIcon(normal, size) });
  await writeFile(resolve(rootDir, config.ico.path), encodeIco(frames));
  console.log("Built browser, Apple and Android icons from " + config.source);
}

/** Report a failed icon build and leave a nonzero exit status.
 * @param {Error} error Build error.
 * @returns {void} Logs the error. */
function handleBuildError(error) {
  console.error(error);
  process.exitCode = 1;
}
main().catch(handleBuildError);
