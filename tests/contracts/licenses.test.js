import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { JSDOM } from "jsdom";

test("license appendix ships full texts, provenance and the unresolved model status" /** Verify the generated appendix against its inventory and original texts.
 * @returns {Promise<void>} Resolves when all shipped notices match. */, async () => {
  const config = JSON.parse(
    await readFile("config/licenses.config.json", "utf8"),
  );
  const document = new JSDOM(await readFile("licenses.html", "utf8")).window
    .document;
  const notices = await readFile("THIRD_PARTY_NOTICES.md", "utf8");
  assert.equal(
    document.querySelectorAll(".license-entry").length,
    config.components.length,
  );
  assert.equal(
    new Set(
      config.components.map(
        /** Read the inventory identifier.
         * @param {object} entry Component metadata.
         * @returns {string} Unique component identifier. */
        (entry) => entry.id,
      ),
    ).size,
    config.components.length,
  );
  for (const entry of config.components) {
    const original = await readFile(entry.file, "utf8");
    assert.ok(original.length > 500, entry.file);
    const article = document.getElementById(entry.id);
    assert.equal(
      article
        .querySelector('[data-field="text"]')
        .textContent.trim()
        .replace(/\r\n/g, "\n"),
      original.trim().replace(/\r\n/g, "\n"),
    );
    assert.equal(
      article.querySelector("[data-source]").getAttribute("href"),
      entry.source,
    );
    assert.equal(
      article.querySelector("[data-license]").getAttribute("href"),
      entry.file,
    );
    assert.ok(notices.includes(entry.file));
    assert.ok(notices.includes(entry.changes));
  }
  assert.equal(document.querySelector("#gemma [data-status]").hidden, false);
  assert.match(
    document.querySelector("#gemma").textContent,
    /Zuordnung.*offen/,
  );
  assert.match(
    await readFile("vendor/licenses/base64-js.txt", "utf8"),
    /Jameson Little/,
  );
  assert.match(
    await readFile("vendor/licenses/ieee754.txt", "utf8"),
    /Fair Oaks Labs/,
  );
  assert.match(
    (await readFile("vendor/sentencepiece.js", "utf8")).slice(0, 600),
    /Modified browser build/,
  );
  assert.match(
    (await readFile("vendor/gpt2.js", "utf8")).slice(0, 400),
    /Bazyli Brzoska/,
  );
  assert.match(
    await readFile("src/synthid/engine.js", "utf8"),
    /Copyright 2026 Google LLC/,
  );
  const main = new JSDOM(await readFile("index.html", "utf8")).window.document;
  const link = main.querySelector(".site-footer a");
  assert.equal(link.getAttribute("href"), "licenses.html");
  assert.equal(link.closest("#results"), null);
});
