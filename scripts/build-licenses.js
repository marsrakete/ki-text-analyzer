import { readFile, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
import { format } from "prettier";
const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** Generate a standalone, static license page and the portable notice document.
 * @returns {Promise<void>} Resolves after license texts and notices are rendered. */
async function main() {
  const config = JSON.parse(
    await readFile(resolve(rootDir, "config/licenses.config.json"), "utf8"),
  );
  const document = new JSDOM(
    await readFile(resolve(rootDir, "templates/licenses.html"), "utf8"),
  ).window.document;
  const template = document.getElementById("license-entry");
  document.querySelector("h1").textContent = config.title;
  document
    .querySelector('meta[name="description"]')
    .setAttribute("content", config.description);
  const target = document.getElementById("license-components");
  const sections = [
    "# Drittanbieter und Lizenzbeilage",
    "",
    "Der eigene Anwendungscode steht unter Apache-2.0 (siehe LICENSE). Fremdkomponenten behalten ihre ursprünglichen Lizenzbedingungen. Diese Datei und vendor/licenses/ gehören zur Auslieferung. Die statische Browseransicht ist licenses.html.",
    "",
  ];
  for (const entry of config.components) {
    const text = await readFile(resolve(rootDir, entry.file), "utf8");
    const fragment = template.content.cloneNode(true);
    fragment.querySelector("article").id = entry.id;
    for (const element of fragment.querySelectorAll("[data-field]")) {
      const key = element.dataset.field;
      if (key === "text") element.textContent = text;
      else if (Object.hasOwn(entry, key)) element.textContent = entry[key];
    }
    fragment.querySelector("[data-source]").setAttribute("href", entry.source);
    fragment.querySelector("[data-license]").setAttribute("href", entry.file);
    if (entry.status) {
      fragment.querySelector("[data-status]").hidden = false;
      fragment.querySelector("[data-terms]").setAttribute("href", entry.terms);
    }
    target.append(fragment);
    sections.push(
      "## " + entry.name,
      "",
      "- Version: " + entry.version,
      "- Lizenz: " + entry.license,
      "- Rechteinhaber / Mitwirkende: " + entry.author,
      "- Verwendung: " + entry.usage,
      "- Quelle: " + entry.source,
      "- Vollständiger Originaltext: [" + entry.file + "](" + entry.file + ")",
      "- Änderungen: " + entry.changes,
      "",
    );
    if (entry.status)
      sections.push(
        entry.status,
        "",
        "Zusätzliche Originalbedingungen: " + entry.terms,
        "",
      );
  }
  const reviewed = config.components.filter(
    /** Select entries with a documented license review.
     * @param {object} entry Component metadata.
     * @returns {boolean} Whether a review is available. */
    (entry) => Boolean(entry.review),
  );
  for (const entry of reviewed) {
    sections.push(
      "Dokumentierte Prüfung: [" +
        entry.review.document +
        "](" +
        entry.review.document +
        ") (Stand " +
        entry.review.date +
        ").",
      "",
      "Offizielle SDK-Herkunftsbestätigung: " + entry.review.sdkSource,
      "",
    );
  }
  sections.push(
    "## Entwicklungswerkzeuge",
    "",
    "Resvg 2.6.2 (MPL-2.0), Sharp 0.35.5 (Apache-2.0) sowie Esbuild, Tests und Formatierungswerkzeuge sind Entwicklungsabhängigkeiten. Ihre Software wird nicht mit den erzeugten Grafiken an Website-Besucher ausgeliefert. Bei Weitergabe der Werkzeuge selbst gelten deren eigene Bedingungen. Die genauen Paketversionen stehen in package-lock.json.",
    "",
    "Der OG-Build wurde aus dem Projekt Threadline übernommen und an ES-Module angepasst. Die Grafiken wurden für KI-Text-Analyzer neu gestaltet.",
    "",
    "Diese Beilage wird aus config/licenses.config.json erzeugt. Die Original-Lizenzdateien dürfen nicht durch bloße Links ersetzt werden.",
    "",
  );
  template.remove();
  await writeFile(
    resolve(rootDir, "licenses.html"),
    await format("<!doctype html>\n" + document.documentElement.outerHTML, {
      parser: "html",
      printWidth: 80,
    }),
  );
  await writeFile(
    resolve(rootDir, "THIRD_PARTY_NOTICES.md"),
    sections.join("\n"),
  );
  console.log(
    "Built static license page and third-party notices (" +
      config.components.length +
      " components).",
  );
}

/** Report missing license texts or generation failures.
 * @param {Error} error Build failure.
 * @returns {void} Logs the error and sets a failing exit status. */
function handleBuildError(error) {
  console.error(error);
  process.exitCode = 1;
}
main().catch(handleBuildError);
