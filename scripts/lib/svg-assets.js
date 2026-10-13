import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { JSDOM } from "jsdom";

/** Resolve the shared brand symbol into a standalone SVG for deterministic rendering.
 * @param {string} rootDir Absolute project root.
 * @param {string} source Relative SVG source path.
 * @param {string} iconSource Relative source containing the canonical mark symbol.
 * @returns {Promise<string>} SVG with local definitions and no external use references. */
export async function readSvgWithBrandMark(rootDir, source, iconSource) {
  const svg = await readFile(resolve(rootDir, source), "utf8");
  const document = new JSDOM(svg, { contentType: "image/svg+xml" }).window
    .document;
  const references = [
    ...document.querySelectorAll('use[href="icon.svg#mark"]'),
  ];
  if (!references.length) return svg;
  const icon = await readFile(resolve(rootDir, iconSource), "utf8");
  const iconDocument = new JSDOM(icon, { contentType: "image/svg+xml" }).window
    .document;
  const sourceDefinitions = iconDocument.querySelector("defs");
  if (!sourceDefinitions?.querySelector("#mark"))
    throw new Error("Brand icon requires a mark symbol.");
  const definitions = document.importNode(sourceDefinitions, true);
  for (const element of definitions.querySelectorAll("[id]"))
    element.id = "brand-" + element.id;
  for (const element of definitions.querySelectorAll("*")) {
    for (const attribute of [...element.attributes]) {
      if (attribute.value.includes("url(#"))
        element.setAttribute(
          attribute.name,
          attribute.value.replaceAll("url(#", "url(#brand-"),
        );
    }
  }
  document.documentElement.insertBefore(
    definitions,
    document.documentElement.firstChild,
  );
  for (const reference of references)
    reference.setAttribute("href", "#brand-mark");
  return document.documentElement.outerHTML;
}
