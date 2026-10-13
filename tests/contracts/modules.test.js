import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { JSDOM } from "jsdom";
import { initializePage } from "../../src/ui/page.js";
const contracts = {
  "analysis/analyze.js": ["analyze"],
  "analysis/metrics.js": ["collectMetrics"],
  "analysis/scoring.js": [
    "band",
    "buildScores",
    "buildSubscores",
    "confidenceInfo",
  ],
  "analysis/unicode.js": ["scriptMix", "unicodeScan"],
  "content/analysis-de.js": ["analysisContent"],
  "content/de.js": ["format", "messages"],
  "content/reference-data.js": [
    "aiPhrases",
    "functionWords",
    "profileFunctionWords",
    "sampleText",
    "suspiciousUnicode",
    "transitionWords",
    "unicodeLabels",
  ],
  "content/synthid-config.js": [
    "DEFAULT_SYNTH_IV",
    "DEFAULT_SYNTH_KEYS",
    "DEFAULT_SYNTH_PARAMETERS",
    "SYNTHID_POSITIVE_DEMO_TOKENS",
    "SYNTH_MULT",
  ],
  "services/asset-store.js": ["createAssetStore"],
  "services/compression.js": ["gzipRatio"],
  "services/gemma-tokenizer.js": ["createGemmaTokenizer"],
  "services/gpt2-tokenizer.js": ["createGPT2Tokenizer"],
  "services/tokenizer-registry.js": ["createTokenizerRegistry"],
  "shared/dom.js": ["cloneTemplate", "renderRows"],
  "shared/format.js": ["pct"],
  "shared/statistics.js": [
    "clamp",
    "coefficientOfVariation",
    "entropy",
    "gini",
    "mean",
    "median",
    "stddev",
  ],
  "shared/text.js": ["sentences", "words"],
  "synthid/engine.js": [
    "synthAccumulateHash",
    "synthContextMask",
    "synthGValue",
    "synthHashIV",
    "synthReferenceScore",
  ],
  "synthid/validation.js": [
    "parseManualTokenIds",
    "parseSynthKeys",
    "validateConfiguration",
    "validateTokenIds",
  ],
  "ui/analysis-controller.js": ["createAnalysisController"],
  "ui/analysis-model.js": ["buildAnalysisModel"],
  "ui/analysis-view.js": ["createAnalysisView"],
  "ui/page.js": ["initializePage"],
  "ui/synthid-controller.js": ["createSynthIDController"],
  "ui/synthid-view.js": ["createSynthIDView"],
};
for (const [path, exports] of Object.entries(contracts)) {
  test(
    "module contract: " + path,
    /** Verify the behavior described by this test case.
     * @returns {*} Operation result or undefined for a side effect. */
    async () => {
      const module = await import("../../src/" + path);
      assert.deepEqual(Object.keys(module).sort(), exports.toSorted());
      for (const value of Object.values(module))
        assert.notEqual(value, undefined);
    },
  );
}
test("every domain module has an explicit contract entry", /** Verify the behavior described by this test case.
 * @returns {*} Operation result or undefined for a side effect. */
async () => {
  for (const directory of [
    "analysis",
    "content",
    "services",
    "shared",
    "synthid",
    "ui",
  ]) {
    for (const file of await readdir("src/" + directory))
      assert.ok(
        Object.hasOwn(contracts, directory + "/" + file),
        "Missing contract: " + directory + "/" + file,
      );
  }
});
test("page initialization creates controllers and handles absent required markup", /** Verify the behavior described by this test case.
 * @returns {*} Operation result or undefined for a side effect. */
async () => {
  const html = await readFile("index.html", "utf8");
  const dom = new JSDOM(html);
  dom.window.fetch =
    /** Verify the behavior described by this test case.
     * @returns {*} Operation result or undefined for a side effect. */
    async () => new Response(new Uint8Array([1]));
  const controllers = initializePage(dom.window.document, dom.window);
  assert.equal(typeof controllers.analysis.analyze, "function");
  assert.equal(typeof controllers.synthid.analyze, "function");
  controllers.analysis.destroy();
  controllers.synthid.destroy();
  dom.window.document.getElementById("analyzeBtn").remove();
  assert.throws(
    /** Execute the enclosing operation for the supplied values.
     * @returns {*} Operation result or undefined for a side effect. */
    () => initializePage(dom.window.document, dom.window),
    /Missing page element/,
  );
});
