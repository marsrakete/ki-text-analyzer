import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { JSDOM } from "jsdom";
import { Resvg } from "@resvg/resvg-js";
import sharp from "sharp";
import * as svgAssets from "../../scripts/lib/svg-assets.js";
const site = JSON.parse(await readFile("config/site.config.json", "utf8"));

test("SVG asset adapter has a single public contract and inlines the canonical mark" /** Verify normal SVG, shared-symbol SVG and missing input handling.
 * @returns {Promise<void>} Resolves when all asset contracts hold. */, async () => {
  assert.deepEqual(Object.keys(svgAssets), ["readSvgWithBrandMark"]);
  const root = resolve(".");
  const icon = await svgAssets.readSvgWithBrandMark(
    root,
    "assets/branding/icon.svg",
    "assets/branding/icon.svg",
  );
  assert.equal(icon, await readFile("assets/branding/icon.svg", "utf8"));
  const og = await svgAssets.readSvgWithBrandMark(
    root,
    "assets/branding/og-image.svg",
    "assets/branding/icon.svg",
  );
  const document = new JSDOM(og, { contentType: "image/svg+xml" }).window
    .document;
  assert.ok(document.querySelector("#brand-mark"));
  assert.equal(document.querySelector('use[href="icon.svg#mark"]'), null);
  for (const use of document.querySelectorAll("use"))
    assert.ok(document.querySelector(use.getAttribute("href")));
  await assert.rejects(
    svgAssets.readSvgWithBrandMark(
      root,
      "missing.svg",
      "assets/branding/icon.svg",
    ),
    { code: "ENOENT" },
  );
  await assert.rejects(
    svgAssets.readSvgWithBrandMark(
      root,
      "assets/branding/maskable-icon.svg",
      "assets/branding/og-image.svg",
    ),
    /requires a mark symbol/,
  );
});
test("OG PNG/JPEG and all mobile icon sizes match their configurations" /** Inspect actual encoded output dimensions and formats.
 * @returns {Promise<void>} Resolves after all images are inspected. */, async () => {
  const config = JSON.parse(
    await readFile("config/og-image.config.json", "utf8"),
  );
  for (const output of config.outputs) {
    const metadata = await sharp(output.path).metadata();
    assert.equal(metadata.width, 1200);
    assert.equal(metadata.height, 630);
    assert.equal(metadata.format, output.format);
  }
  const icons = JSON.parse(await readFile("config/icons.config.json", "utf8"));
  for (const icon of icons.outputs) {
    const metadata = await sharp(icon.path).metadata();
    assert.equal(metadata.width, icon.size);
    assert.equal(metadata.height, icon.size);
    assert.equal(metadata.format, "png");
    if (icon.maskable) {
      const pixels = await sharp(icon.path).ensureAlpha().raw().toBuffer();
      for (let offset = 3; offset < pixels.length; offset += 4)
        assert.equal(pixels[offset], 255);
    }
  }
});
test("maskable icons have an opaque background and contain the mark in their safe circle" /** Compare mark and background pixels against Android's central safe zone.
 * @returns {Promise<void>} Resolves after pixel geometry is checked. */, async () => {
  const rendered = await svgAssets.readSvgWithBrandMark(
    resolve("."),
    "assets/branding/maskable-icon.svg",
    "assets/branding/icon.svg",
  );
  const document = new JSDOM(rendered, { contentType: "image/svg+xml" }).window
    .document;
  document.querySelector("use").remove();
  const background = new Resvg(document.documentElement.outerHTML, {
    font: { loadSystemFonts: false },
  })
    .render()
    .asPng();
  const actual = await sharp("assets/branding/maskable-512.png")
    .ensureAlpha()
    .raw()
    .toBuffer();
  const base = await sharp(background).ensureAlpha().raw().toBuffer();
  let markPixels = 0;
  for (let pixel = 0; pixel < 512 * 512; pixel++) {
    const index = pixel * 4;
    assert.equal(actual[index + 3], 255);
    const difference =
      Math.abs(actual[index] - base[index]) +
      Math.abs(actual[index + 1] - base[index + 1]) +
      Math.abs(actual[index + 2] - base[index + 2]);
    if (difference > 16) {
      markPixels++;
      const x = (pixel % 512) + 0.5,
        y = Math.floor(pixel / 512) + 0.5;
      assert.ok(
        Math.hypot(x - 256, y - 256) <= 204.8,
        "Mark outside maskable safe circle",
      );
    }
  }
  assert.ok(markPixels > 20000);
});
test("ICO directory points to valid 16, 32 and 48 pixel PNG frames" /** Validate real ICO structure instead of only its filename.
 * @returns {Promise<void>} Resolves after frame offsets and dimensions are checked. */, async () => {
  const ico = await readFile("favicon.ico");
  assert.equal(ico.readUInt16LE(0), 0);
  assert.equal(ico.readUInt16LE(2), 1);
  assert.equal(ico.readUInt16LE(4), 3);
  for (const [index, size] of [16, 32, 48].entries()) {
    const entry = 6 + index * 16;
    assert.equal(ico[entry], size);
    const length = ico.readUInt32LE(entry + 8),
      offset = ico.readUInt32LE(entry + 12);
    assert.ok(offset >= 54 && offset + length <= ico.length);
    const metadata = await sharp(
      ico.subarray(offset, offset + length),
    ).metadata();
    assert.equal(metadata.width, size);
    assert.equal(metadata.height, size);
  }
});
test("static social metadata and manifest point to the configured GitHub Pages site" /** Verify crawler-visible metadata without executing page JavaScript.
 * @returns {Promise<void>} Resolves after metadata and manifest consistency checks. */, async () => {
  const document = new JSDOM(await readFile("index.html", "utf8")).window
    .document;
  const expectedImage = new URL(site.image, site.url).href;
  for (const [selector, expected] of [
    ['meta[property="og:url"]', site.url],
    ['meta[property="og:image"]', expectedImage],
    ['meta[name="twitter:image"]', expectedImage],
    ['meta[property="og:image:width"]', "1200"],
    ['meta[property="og:image:height"]', "630"],
    ['meta[property="og:image:type"]', "image/png"],
  ]) {
    assert.equal(document.querySelectorAll(selector).length, 1);
    assert.equal(document.querySelector(selector).content, expected);
  }
  assert.equal(
    document.querySelector('link[rel="canonical"]').getAttribute("href"),
    site.url,
  );
  assert.equal(
    document.querySelector('link[rel="apple-touch-icon"]').getAttribute("href"),
    "assets/branding/apple-touch-icon.png",
  );
  const manifest = JSON.parse(await readFile("manifest.webmanifest", "utf8"));
  assert.equal(manifest.name, site.name);
  assert.equal(manifest.scope, "./");
  for (const icon of manifest.icons) {
    assert.ok(!icon.src.startsWith("/"));
    const metadata = await sharp(icon.src).metadata();
    assert.equal(icon.sizes, metadata.width + "x" + metadata.height);
  }
});
