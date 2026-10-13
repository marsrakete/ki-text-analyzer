import { format } from "../content/de.js";
import { cloneTemplate, renderRows } from "../shared/dom.js";

/** Create the SynthID view independently of tokenization and storage.
 * @param {object} config Root element, templates and messages.
 * @returns {object} Status, result, error and busy-state methods. */
export function createSynthIDView({ root, templates, messages }) {
  /** Look up an element inside the supplied root.
   * @param {string} id Element ID.
   * @returns {HTMLElement} View element. */
  function element(id) {
    return root.querySelector("#" + id);
  }
  /** Display a plain status message.
   * @param {string} text Status text.
   * @returns {void} Updates the status region. */
  function status(text) {
    element("tokenizerStatus").textContent = text;
  }
  /** Show an in-progress tokenizer preparation.
   * @param {string} name Tokenizer name.
   * @returns {void} Updates status. */
  function preparing(name) {
    let label = messages.tokenizerNames.gpt2;
    if (name === "gemma") {
      label = messages.tokenizerNames.gemma;
    }
    status(format(messages.tokenizerPreparing, label));
  }
  /** Display metadata for a successfully prepared tokenizer.
   * @param {object} tokenizer Prepared adapter metadata.
   * @returns {void} Updates status and prerequisite message. */
  function ready(tokenizer) {
    let name = messages.tokenizerNames.gpt2,
      method = format(
        messages.bpe,
        tokenizer.mergeCount.toLocaleString("de-DE"),
      );
    if (tokenizer.name === "gemma") {
      name = messages.tokenizerNames.gemma;
      method = messages.sentencePiece;
    }
    let origin = messages.localSource;
    if (tokenizer.cached) {
      origin = messages.cacheSource;
    }
    status(
      format(
        messages.tokenizerReady,
        name,
        tokenizer.vocabSize.toLocaleString("de-DE"),
        method,
        origin,
      ),
    );
    element("synthPrereq").className = "calloutGood";
    element("synthPrereq").textContent = messages.readyNotice;
  }
  /** Show a failure without interpreting exception text as HTML.
   * @param {string} text Error message.
   * @returns {void} Updates status and prerequisite notice. */
  function error(text) {
    status(text);
    element("synthPrereq").className = "calloutWarn";
    element("synthPrereq").textContent = text;
  }
  /** Update button states while a tokenizer or analysis action runs.
   * @param {string} action prepare, analyze or clear.
   * @param {boolean} active Busy state.
   * @returns {void} Updates action buttons. */
  function busy(action, active) {
    for (const id of [
      "prepareTokenizerBtn",
      "synthAnalyzeBtn",
      "clearTokenizerCacheBtn",
    ]) {
      element(id).disabled = active;
    }
    let prepareText = messages.prepare,
      analyzeText = messages.synthAnalyze;
    if (active && action === "prepare") {
      prepareText = messages.preparing;
    }
    if (active && action === "analyze") {
      analyzeText = messages.checking;
    }
    element("prepareTokenizerBtn").textContent = prepareText;
    element("synthAnalyzeBtn").textContent = analyzeText;
  }
  /** Hide a result invalidated by changed source or configuration.
   * @returns {void} Hides the result panel. */
  function invalidate() {
    element("synthResults").classList.add("hidden");
  }
  /** Reset tokenizer preparation status after clearing cached instances.
   * @returns {void} Updates cache status and preparation notice. */
  function reset() {
    status(messages.cacheCleared);
    element("synthPrereq").className = "calloutWarn";
    element("synthPrereq").textContent = messages.cacheNotice;
  }
  /** Render a completed SynthID calculation.
   * @param {object} data Score, token count, source and configuration.
   * @returns {void} Updates the SynthID result panel. */
  function render({ result, count, source, keys, ngramLen }) {
    element("synthTokenCount").textContent = count;
    element("synthNgramCount").textContent =
      result.valid + " / " + result.totalNgrams;
    element("synthMean").textContent = result.mean.toFixed(4);
    element("synthWeighted").textContent = result.weighted.toFixed(4);
    let level = messages.synthNone;
    if (result.z >= 4) {
      level = messages.synthStrong;
    } else if (result.z >= 2.5) {
      level = messages.synthIncreased;
    } else if (result.z >= 1.5) {
      level = messages.synthLight;
    }
    element("synthFinding").textContent = format(
      messages.synthFinding,
      source,
      result.weighted.toFixed(4),
      result.z.toFixed(2),
      level,
    );
    let interpretation = messages.synthNoSignalMeaning;
    if (result.z >= 1.5) {
      interpretation = messages.synthSignalMeaning;
    }
    const meaning = element("synthMeaning");
    meaning.replaceChildren();
    for (const [label, text] of [
      [messages.meaningLabel, messages.synthMeaning],
      ["", interpretation],
      ["", messages.synthCalibrationMeaning],
    ]) {
      meaning.append(cloneTemplate(templates.paragraph, { label, text }));
    }
    const values = [
      format(messages.synthConfiguration, keys.length, ngramLen),
      result.iv,
      result.mean.toFixed(6),
      result.weighted.toFixed(6),
      (result.weighted - 0.5).toFixed(6),
      result.z.toFixed(3),
      String(result.masked),
    ];
    renderRows(
      element("synthRows"),
      messages.synthRows.map(
        /** Convert one source item to the representation required by this metric or view.
         * @param {*} argument1 Value supplied by the enclosing operation.
         * @param {*} index Value supplied by the enclosing operation.
         * @returns {*} Result of this operation. */
        ([label, detail], index) => {
          return [label, values[index], detail];
        },
      ),
      templates,
    );
    element("synthResults").classList.remove("hidden");
    element("results").classList.remove("hidden");
  }
  return {
    status,
    preparing,
    ready,
    error,
    busy,
    render,
    invalidate,
    reset,
  };
}
