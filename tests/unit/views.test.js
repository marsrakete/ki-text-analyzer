import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { readFile } from "node:fs/promises";
import { createAnalysisView } from "../../src/ui/analysis-view.js";
import { createSynthIDView } from "../../src/ui/synthid-view.js";
import { createAnalysisController } from "../../src/ui/analysis-controller.js";
import { createSynthIDController } from "../../src/ui/synthid-controller.js";
import { cloneTemplate, renderRows } from "../../src/shared/dom.js";
import { messages, format } from "../../src/content/de.js";
import { analyze } from "../../src/analysis/analyze.js";
const html = await readFile("index.html", "utf8");

/** Create an isolated DOM with the same real page templates.
 * @returns {object} Document, root and named templates. */
function setup() {
  const document = new JSDOM(html).window.document;
  const root = document.querySelector("main");
  const templates = {};
  for (const template of document.querySelectorAll("template"))
    templates[template.id.replace("template-", "")] = template;
  return {
    document,
    root,
    templates,
    messages,
  };
}
test("template filling and rows preserve hostile input as text", /** Verify the behavior described by this test case.
 * @returns {*} Operation result or undefined for a side effect. */
() => {
  const { document, templates } = setup();
  const hostile = "<img src=x onerror=alert(1)>";
  const node = cloneTemplate(templates.metric, {
    label: hostile,
    value: 42,
  });
  assert.equal(node.querySelector(".k").textContent, hostile);
  assert.equal(node.querySelector("img"), null);
  assert.throws(
    /** Execute the enclosing operation for the supplied values.
     * @returns {*} Operation result or undefined for a side effect. */
    () => cloneTemplate(null),
    TypeError,
  );
  const tbody = document.createElement("tbody");
  renderRows(tbody, [[hostile, "x", "y"]], templates);
  assert.equal(tbody.querySelector("td").textContent, hostile);
  renderRows(tbody, [], templates, "Leer");
  assert.equal(tbody.querySelector("td").colSpan, 3);
  assert.equal(tbody.textContent.trim(), "Leer");
  assert.equal(format("{0} + {1}", "A", "B"), "A + B");
  assert.equal(format("{0}"), " {0}".trim());
});
test("analysis view fills every section and safely visualizes Unicode/HTML", /** Verify the behavior described by this test case.
 * @returns {*} Operation result or undefined for a side effect. */
() => {
  const config = setup(),
    view = createAnalysisView(config);
  const text = "Hallo\u200B <img src=x onerror=alert(1)>. Welt.";
  view.render(text, analyze(text), null);
  assert.equal(
    config.root.querySelector("#results").classList.contains("hidden"),
    false,
  );
  assert.equal(config.root.querySelectorAll("#metrics .metric").length, 8);
  assert.equal(config.root.querySelectorAll("#advancedRows tr").length, 25);
  assert.ok(config.root.querySelector("#reasons").textContent.length > 0);
  assert.match(
    config.root.querySelector("#unicodeVisualized").textContent,
    /\[ZWSP\]/,
  );
  assert.equal(config.root.querySelector("#unicodeVisualized img"), null);
  view.render("", analyze(""), null);
  assert.match(
    config.root.querySelector("#functionWordRows").textContent,
    /Keine ausreichenden/,
  );
  view.busy(true);
  assert.equal(config.root.querySelector("#analyzeBtn").disabled, true);
  view.busy(false);
  view.error("Fehler");
  assert.equal(
    config.root.querySelector("#analysisMessage").textContent,
    "Fehler",
  );
  view.clear();
  assert.equal(
    config.root.querySelector("#results").classList.contains("hidden"),
    true,
  );
});
test("analysis controller ignores results completed after clearing or changing text", /** Verify the behavior described by this test case.
 * @returns {*} Operation result or undefined for a side effect. */
async () => {
  const { document } = setup();
  const elements = {
    input: document.getElementById("input"),
    analyze: document.getElementById("analyzeBtn"),
    sample: document.getElementById("sampleBtn"),
    clear: document.getElementById("clearBtn"),
  };
  let resolveCompression,
    renders = 0,
    errors = 0;
  const controller = createAnalysisController({
    elements,
    view: {
      /** Visit the busy syntax node during source validation.
       * @returns {*} Operation result or undefined for a side effect. */
      busy() {},
      /** Visit the clear syntax node during source validation.
       * @returns {*} Operation result or undefined for a side effect. */
      clear() {},
      /** Visit the render syntax node during source validation.
       * @returns {*} Operation result or undefined for a side effect. */
      render() {
        renders++;
      },
      /** Visit the error syntax node during source validation.
       * @returns {*} Operation result or undefined for a side effect. */
      error() {
        errors++;
      },
    },
    analyzeText: analyze,
    compress:
      /** Execute the enclosing operation for the supplied values.
       * @returns {*} Operation result or undefined for a side effect. */
      () =>
        new Promise(
          /** Execute the enclosing operation for the supplied values.
           * @param {*} resolve Input supplied by the enclosing API.
           * @returns {*} Operation result or undefined for a side effect. */
          (resolve) => {
            resolveCompression = resolve;
          },
        ),
    sampleText: "Beispiel",
    messages,
  });
  await controller.analyze();
  assert.equal(errors, 1);
  elements.input.value = "Hallo.";
  const pending = controller.analyze();
  controller.clear();
  resolveCompression(null);
  await pending;
  assert.equal(renders, 0);
  controller.sample();
  assert.equal(elements.input.value, "Beispiel");
  const fresh = controller.analyze();
  resolveCompression(null);
  await fresh;
  assert.equal(renders, 1);
  controller.destroy();
  elements.sample.click();
  assert.equal(elements.input.value, "Beispiel");
});
test("SynthID view provides status, safe result text and busy/error states", /** Verify the behavior described by this test case.
 * @returns {*} Operation result or undefined for a side effect. */
() => {
  const config = setup(),
    view = createSynthIDView(config);
  view.preparing("gemma");
  assert.match(
    config.root.querySelector("#tokenizerStatus").textContent,
    /Gemma/,
  );
  view.ready({
    name: "gpt2",
    vocabSize: 50257,
    mergeCount: 50000,
    cached: false,
  });
  view.busy("analyze", true);
  assert.equal(config.root.querySelector("#synthAnalyzeBtn").disabled, true);
  view.render({
    result: {
      valid: 1,
      totalNgrams: 1,
      mean: 0.5,
      weighted: 0.5,
      z: 0,
      iv: "1",
      masked: 0,
    },
    count: 5,
    source: "<img>",
    keys: [1],
    ngramLen: 5,
  });
  assert.equal(config.root.querySelectorAll("#synthRows tr").length, 7);
  assert.equal(config.root.querySelector("#synthFinding img"), null);
  view.error("Fehler <img>");
  assert.equal(
    config.root.querySelector("#synthPrereq").textContent,
    "Fehler <img>",
  );
  view.busy("analyze", false);
  view.invalidate();
  assert.equal(
    config.root.querySelector("#synthResults").classList.contains("hidden"),
    true,
  );
});
test("SynthID controller validates before loading and ignores stale score completion", /** Verify the behavior described by this test case.
 * @returns {*} Operation result or undefined for a side effect. */
async () => {
  const { document } = setup();
  const ids = {
    input: "input",
    choice: "synthTokenizerChoice",
    bos: "gemmaAddBos",
    keys: "synthKeys",
    tokens: "synthTokenIds",
    ngram: "synthNgramLen",
    history: "synthHistorySize",
    prepare: "prepareTokenizerBtn",
    analyze: "synthAnalyzeBtn",
    clearCache: "clearTokenizerCacheBtn",
    demo: "synthPositiveDemoBtn",
    clearDemo: "synthClearDemoBtn",
    sample: "sampleBtn",
    clearInput: "clearBtn",
  };
  const elements = {};
  for (const [key, id] of Object.entries(ids))
    elements[key] = document.getElementById(id);
  let loads = 0,
    errors = 0,
    renders = 0,
    resolveScore;
  const view = {
    /** Visit the status syntax node during source validation.
     * @returns {*} Operation result or undefined for a side effect. */
    status() {},
    /** Reset the fake view's cache notice.
     * @returns {void} No side effects are needed for this controller test. */
    reset() {},
    /** Visit the preparing syntax node during source validation.
     * @returns {*} Operation result or undefined for a side effect. */
    preparing() {},
    /** Visit the ready syntax node during source validation.
     * @returns {*} Operation result or undefined for a side effect. */
    ready() {},
    /** Visit the busy syntax node during source validation.
     * @returns {*} Operation result or undefined for a side effect. */
    busy() {},
    /** Visit the invalidate syntax node during source validation.
     * @returns {*} Operation result or undefined for a side effect. */
    invalidate() {},
    /** Visit the error syntax node during source validation.
     * @returns {*} Operation result or undefined for a side effect. */
    error() {
      errors++;
    },
    /** Visit the render syntax node during source validation.
     * @returns {*} Operation result or undefined for a side effect. */
    render() {
      renders++;
    },
  };
  const controller = createSynthIDController({
    elements,
    registry: {
      get:
        /** Execute the enclosing operation for the supplied values.
         * @returns {*} Operation result or undefined for a side effect. */
        async () => {
          loads++;
          return {
            encode:
              /** Execute the enclosing operation for the supplied values.
               * @returns {*} Operation result or undefined for a side effect. */
              () => [1, 2, 3, 4, 5],
          };
        },
      clear:
        /** Execute the enclosing operation for the supplied values.
         * @returns {*} Operation result or undefined for a side effect. */
        async () => {},
    },
    score:
      /** Execute the enclosing operation for the supplied values.
       * @returns {*} Operation result or undefined for a side effect. */
      () =>
        new Promise(
          /** Execute the enclosing operation for the supplied values.
           * @param {*} resolve Input supplied by the enclosing API.
           * @returns {*} Operation result or undefined for a side effect. */
          (resolve) => {
            resolveScore = resolve;
          },
        ),
    view,
    messages,
    defaults: [1],
    demoTokens: [1, 2, 3, 4, 5],
  });
  elements.ngram.value = "1";
  await controller.analyze();
  assert.equal(errors, 1);
  assert.equal(loads, 0);
  controller.demo();
  assert.equal(elements.ngram.value, "5");
  const pending = controller.analyze();
  controller.clearDemo();
  resolveScore({});
  await pending;
  assert.equal(renders, 0);
  controller.demo();
  const fresh = controller.analyze();
  resolveScore({});
  await fresh;
  assert.equal(renders, 1);
  await controller.prepare();
  await controller.clearCache();
  assert.equal(loads, 1);
  controller.destroy();
});
