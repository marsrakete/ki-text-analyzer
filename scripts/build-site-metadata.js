import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
import { format } from "prettier";
const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** Set one metadata value without duplicating existing tags.
 * @param {Document} document Parsed page document.
 * @param {string} attribute Metadata selector attribute, name or property.
 * @param {string} key Metadata key.
 * @param {string|number} value Central configuration value.
 * @returns {void} Updates the document head. */
function setMeta(document, attribute, key, value) {
  let element = document.head.querySelector(
    "meta[" + attribute + '="' + key + '"]',
  );
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.append(element);
  }
  element.setAttribute("content", String(value));
}

/** Set a unique head link and its attributes.
 * @param {Document} document Parsed page document.
 * @param {string} key Stable identifying attribute for this link.
 * @param {object} attributes Link attributes.
 * @returns {void} Updates the document head. */
function setLink(document, key, attributes) {
  let element = document.head.querySelector(
    'link[data-branding="' + key + '"]',
  );
  if (!element) {
    element = document.createElement("link");
    element.dataset.branding = key;
    document.head.append(element);
  }
  for (const [name, value] of Object.entries(attributes))
    element.setAttribute(name, String(value));
}

/** Generate static crawler-visible metadata and the mobile icon manifest.
 * @returns {Promise<void>} Resolves after HTML and manifest updates. */
async function main() {
  const site = JSON.parse(
    await readFile(resolve(rootDir, "config/site.config.json"), "utf8"),
  );
  const og = JSON.parse(
    await readFile(resolve(rootDir, "config/og-image.config.json"), "utf8"),
  );
  const url = new URL(site.url);
  if (url.protocol !== "https:" || !url.pathname.endsWith("/"))
    throw new Error("Site URL must be HTTPS with a trailing slash.");
  const imageUrl = new URL(site.image, url).href;
  const document = new JSDOM(
    await readFile(resolve(rootDir, "index.html"), "utf8"),
  ).window.document;
  setMeta(document, "name", "description", site.description);
  setMeta(document, "name", "theme-color", site.themeColor);
  setMeta(document, "name", "apple-mobile-web-app-title", site.shortName);
  for (const [name, value] of Object.entries({
    type: "website",
    site_name: site.name,
    title: site.name,
    description: site.description,
    url: url.href,
    image: imageUrl,
    "image:type": "image/png",
    "image:width": og.render.width,
    "image:height": og.render.height,
    "image:alt": site.imageAlt,
    locale: "de_DE",
  }))
    setMeta(document, "property", "og:" + name, value);
  for (const [name, value] of Object.entries({
    card: "summary_large_image",
    title: site.name,
    description: site.description,
    image: imageUrl,
    "image:alt": site.imageAlt,
  }))
    setMeta(document, "name", "twitter:" + name, value);
  setLink(document, "canonical", { rel: "canonical", href: url.href });
  setLink(document, "svg", {
    rel: "icon",
    href: "assets/branding/icon.svg",
    type: "image/svg+xml",
    sizes: "any",
  });
  setLink(document, "ico", {
    rel: "icon",
    href: "favicon.ico",
    type: "image/x-icon",
    sizes: "16x16 32x32 48x48",
  });
  setLink(document, "png", {
    rel: "icon",
    href: "assets/branding/favicon-32.png",
    type: "image/png",
    sizes: "32x32",
  });
  setLink(document, "apple", {
    rel: "apple-touch-icon",
    href: "assets/branding/apple-touch-icon.png",
    sizes: "180x180",
  });
  setLink(document, "manifest", {
    rel: "manifest",
    href: "manifest.webmanifest",
  });
  const manifest = {
    id: "./",
    name: site.name,
    short_name: site.shortName,
    description: site.description,
    start_url: "./",
    scope: "./",
    display: "browser",
    background_color: site.backgroundColor,
    theme_color: site.themeColor,
    icons: [
      {
        src: "assets/branding/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "assets/branding/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "assets/branding/maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "assets/branding/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
  const html = await format(
    "<!doctype html>\n" + document.documentElement.outerHTML + "\n",
    { parser: "html", printWidth: 80, tabWidth: 2 },
  );
  await writeFile(resolve(rootDir, "index.html"), html);
  await writeFile(
    resolve(rootDir, "manifest.webmanifest"),
    JSON.stringify(manifest, null, 2) + "\n",
  );
  console.log(
    "Integrated static social metadata and mobile icons for " + url.href,
  );
}

/** Report invalid metadata configuration or filesystem errors.
 * @param {Error} error Build error.
 * @returns {void} Logs the error and sets failure status. */
function handleBuildError(error) {
  console.error(error);
  process.exitCode = 1;
}
main().catch(handleBuildError);
