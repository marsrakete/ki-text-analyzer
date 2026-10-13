import { analyze } from "../analysis/analyze.js";
import { gzipRatio } from "../services/compression.js";
import { createAssetStore } from "../services/asset-store.js";
import { createTokenizerRegistry } from "../services/tokenizer-registry.js";
import { synthReferenceScore } from "../synthid/engine.js";
import { createAnalysisView } from "../ui/analysis-view.js";
import { createAnalysisController } from "../ui/analysis-controller.js";
import { createSynthIDView } from "../ui/synthid-view.js";
import { createSynthIDController } from "../ui/synthid-controller.js";
import { messages } from "../content/de.js";
import { sampleText } from "../content/reference-data.js";
import {
  DEFAULT_SYNTH_KEYS,
  DEFAULT_SYNTH_PARAMETERS,
  SYNTHID_POSITIVE_DEMO_TOKENS,
} from "../content/synthid-config.js";

/** Initialize the static page after all required elements and templates exist.
 * @param {Document} document Page document.
 * @param {Window} environment Browser APIs.
 * @returns {{analysis: object, synthid: object}} Controllers for teardown or integration. */
export function initializePage(document, environment) {
  const root = document.querySelector("main");
  /** Resolve an initialized element required by this page.
   * @param {string} id Element ID.
   * @returns {HTMLElement} Required element. */
  function element(id) {
    const target = document.getElementById(id);
    if (!target) {
      throw new Error("Missing page element: " + id);
    }
    return target;
  }
  const templates = {};
  element("synthKeys").value = DEFAULT_SYNTH_KEYS.join(",");
  element("synthNgramLen").value = String(DEFAULT_SYNTH_PARAMETERS.ngramLen);
  element("synthHistorySize").value = String(
    DEFAULT_SYNTH_PARAMETERS.historySize,
  );
  for (const name of [
    "row",
    "emptyRow",
    "paragraph",
    "verdict",
    "metric",
    "scoreRow",
    "unicodeTable",
    "marker",
    "spark",
    "listItem",
  ]) {
    templates[name] = element("template-" + name);
  }
  const assets = createAssetStore({
    indexedDB: environment.indexedDB,
    fetchAsset: environment.fetch.bind(environment),
  });
  const registry = createTokenizerRegistry({
    assets,
    loadGPT2:
      /** Load the selected runtime from the site’s local vendor files.
       * @returns {*} Result of this operation. */
      () => {
        return import("../../vendor/gpt2.js");
      },
    loadGemma:
      /** Load the selected runtime from the site’s local vendor files.
       * @returns {*} Result of this operation. */
      () => {
        return import("../../vendor/sentencepiece.js");
      },
    gemmaModelUrl: new URL(
      "../../assets/tokenizers/gemma.model",
      import.meta.url,
    ).href,
  });
  const view = createAnalysisView({
    root,
    templates,
    messages,
  });
  const analysis = createAnalysisController({
    elements: {
      input: element("input"),
      analyze: element("analyzeBtn"),
      sample: element("sampleBtn"),
      clear: element("clearBtn"),
    },
    view,
    analyzeText: analyze,
    compress: gzipRatio,
    sampleText,
    messages,
  });
  const synthView = createSynthIDView({
    root,
    templates,
    messages,
  });
  const synthid = createSynthIDController({
    elements: {
      input: element("input"),
      choice: element("synthTokenizerChoice"),
      bos: element("gemmaAddBos"),
      keys: element("synthKeys"),
      tokens: element("synthTokenIds"),
      ngram: element("synthNgramLen"),
      history: element("synthHistorySize"),
      prepare: element("prepareTokenizerBtn"),
      analyze: element("synthAnalyzeBtn"),
      clearCache: element("clearTokenizerCacheBtn"),
      demo: element("synthPositiveDemoBtn"),
      clearDemo: element("synthClearDemoBtn"),
      sample: element("sampleBtn"),
      clearInput: element("clearBtn"),
    },
    registry,
    score: synthReferenceScore,
    view: synthView,
    messages,
    defaults: DEFAULT_SYNTH_KEYS,
    demoTokens: SYNTHID_POSITIVE_DEMO_TOKENS,
  });
  return {
    analysis,
    synthid,
  };
}
