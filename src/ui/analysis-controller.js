import { format } from "../content/de.js";

/** Connect analysis actions and reject stale asynchronous results.
 * @param {object} config Elements, view, analysis/compression functions and sample text.
 * @returns {{analyze: Function, clear: Function, sample: Function, destroy: Function}} Controller API. */
export function createAnalysisController({
  elements,
  view,
  analyzeText,
  compress,
  sampleText,
  messages,
}) {
  let generation = 0;
  /** Analyze the current input after validating its presence.
   * @returns {Promise<void>} Resolves after rendering or handling an error. */
  async function analyze() {
    const current = ++generation;
    const text = elements.input.value.trim();
    if (!text) {
      view.busy(false);
      view.error(messages.enterText);
      return;
    }
    view.busy(true);
    try {
      const result = analyzeText(text);
      const compression = await compress(text);
      if (current === generation && elements.input.value.trim() === text) {
        view.render(text, result, compression);
      }
    } catch (error) {
      if (current === generation) {
        view.error(format(messages.analysisError, error.message));
      }
    } finally {
      if (current === generation) {
        view.busy(false);
      }
    }
  }
  /** Invalidate pending calculations and hide their output.
   * @returns {void} Updates state and button. */
  function invalidate() {
    generation++;
    view.busy(false);
    view.clear();
  }
  /** Clear source text and results.
   * @returns {void} Updates the input and view. */
  function clear() {
    elements.input.value = "";
    invalidate();
  }
  /** Insert the supplied example text.
   * @returns {void} Updates the input and view. */
  function sample() {
    elements.input.value = sampleText;
    invalidate();
  }
  elements.analyze.addEventListener("click", analyze);
  elements.clear.addEventListener("click", clear);
  elements.sample.addEventListener("click", sample);
  elements.input.addEventListener("input", invalidate);
  /** Remove event listeners and invalidate pending work.
   * @returns {void} Disconnects the controller. */
  function destroy() {
    generation++;
    elements.analyze.removeEventListener("click", analyze);
    elements.clear.removeEventListener("click", clear);
    elements.sample.removeEventListener("click", sample);
    elements.input.removeEventListener("input", invalidate);
  }
  return {
    analyze,
    clear,
    sample,
    destroy,
  };
}
