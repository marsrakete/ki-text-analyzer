import {
  parseSynthKeys,
  parseManualTokenIds,
  validateConfiguration,
} from "../synthid/validation.js";
import { format } from "../content/de.js";
import { DEFAULT_SYNTH_PARAMETERS } from "../content/synthid-config.js";

/** Connect SynthID controls using injected registry, scorer and view.
 * @param {object} config Input elements, dependencies, content and demo configuration.
 * @returns {object} Prepare, analyze, clear, demo and teardown actions. */
export function createSynthIDController({
  elements,
  registry,
  score,
  view,
  messages,
  defaults,
  demoTokens,
}) {
  let generation = 0;
  /** Invalidate results after input or configuration changes.
   * @returns {void} Hides stale results. */
  function invalidate() {
    generation++;
    view.invalidate();
  }
  /** Prepare the selected local tokenizer.
   * @returns {Promise<void>} Resolves after status or failure rendering. */
  async function prepare() {
    const current = ++generation;
    const choice = elements.choice.value;
    view.busy("prepare", true);
    view.preparing(choice);
    try {
      const tokenizer = await registry.get(choice);
      if (generation === current) {
        view.ready(tokenizer);
      }
    } catch (error) {
      if (generation === current) {
        view.error(format(messages.tokenizerError, error.message));
      }
    } finally {
      view.busy("prepare", false);
    }
  }
  /** Score manual IDs or text tokenized with the selected adapter.
   * @returns {Promise<void>} Resolves after result or error handling. */
  async function analyze() {
    const current = ++generation;
    view.invalidate();
    view.busy("analyze", true);
    try {
      const keys = parseSynthKeys(elements.keys.value);
      const ngramLen = Number(elements.ngram.value),
        historySize = Number(elements.history.value);
      validateConfiguration(keys, ngramLen, historySize);
      let ids = parseManualTokenIds(elements.tokens.value),
        source = messages.manualSource;
      if (!ids) {
        const text = elements.input.value;
        if (!text.trim()) {
          throw new Error(messages.enterText);
        }
        const choice = elements.choice.value,
          addBos = elements.bos.checked;
        view.preparing(choice);
        const tokenizer = await registry.get(choice);
        if (generation !== current) {
          return;
        }
        view.ready(tokenizer);
        ids = tokenizer.encode(text, {
          addBos,
        });
        source = messages.gpt2Source;
        if (choice === "gemma") {
          source = messages.gemmaSource;
          if (addBos) {
            source += messages.withBos;
          } else {
            source += messages.withoutBos;
          }
        }
      }
      const result = await score(ids, keys, ngramLen, historySize);
      if (current === generation) {
        view.render({
          result,
          count: ids.length,
          source,
          keys,
          ngramLen,
        });
      }
    } catch (error) {
      if (generation === current) {
        view.error(format(messages.synthError, error.message));
      }
    } finally {
      view.busy("analyze", false);
    }
  }
  /** Clear local model cache and tokenizer instances.
   * @returns {Promise<void>} Resolves after cache clearing or a visible error. */
  async function clearCache() {
    const current = ++generation;
    view.busy("clear", true);
    try {
      await registry.clear();
      if (current === generation) {
        view.reset();
      }
    } catch (error) {
      if (current === generation) {
        view.error(format(messages.cacheError, error.message));
      }
    } finally {
      view.busy("clear", false);
    }
  }
  /** Insert the supplied positive reference demo.
   * @returns {void} Updates demo fields and status. */
  function demo() {
    invalidate();
    elements.tokens.value = demoTokens.join(",");
    elements.keys.value = defaults.join(",");
    elements.ngram.value = String(DEFAULT_SYNTH_PARAMETERS.ngramLen);
    elements.history.value = String(DEFAULT_SYNTH_PARAMETERS.historySize);
    view.status(messages.demoLoaded);
  }
  /** Return from manual demo IDs to automatic tokenization.
   * @returns {void} Clears demo input and invalidates its result. */
  function clearDemo() {
    elements.tokens.value = "";
    invalidate();
    view.status(messages.demoCleared);
  }
  const bindings = [
    [elements.prepare, "click", prepare],
    [elements.analyze, "click", analyze],
    [elements.clearCache, "click", clearCache],
    [elements.demo, "click", demo],
    [elements.clearDemo, "click", clearDemo],
  ];
  for (const input of [
    elements.input,
    elements.tokens,
    elements.keys,
    elements.ngram,
    elements.history,
  ]) {
    bindings.push([input, "input", invalidate]);
  }
  for (const input of [elements.choice, elements.bos]) {
    bindings.push([input, "change", invalidate]);
  }
  for (const button of [elements.sample, elements.clearInput]) {
    bindings.push([button, "click", invalidate]);
  }
  for (const [element, event, handler] of bindings) {
    element.addEventListener(event, handler);
  }
  /** Remove event handlers and invalidate any pending render.
   * @returns {void} Disconnects this controller. */
  function destroy() {
    generation++;
    for (const [element, event, handler] of bindings) {
      element.removeEventListener(event, handler);
    }
  }
  return {
    prepare,
    analyze,
    clearCache,
    demo,
    clearDemo,
    destroy,
  };
}
