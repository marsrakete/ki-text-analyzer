import { createGPT2Tokenizer } from "./gpt2-tokenizer.js";
import { createGemmaTokenizer } from "./gemma-tokenizer.js";
import { messages } from "../content/de.js";

/** Create a registry with injected asset and runtime loaders.
 * @param {object} config Asset store, runtime loaders and Gemma model URL.
 * @returns {{get: Function, reset: Function, clear: Function}} Tokenizer lifecycle API. */
export function createTokenizerRegistry({
  assets,
  loadGPT2,
  loadGemma,
  gemmaModelUrl,
}) {
  let entries = new Map();
  let clearing = null;
  /** Get or initialize a tokenizer, sharing concurrent initialization.
   * @param {string} name gpt2 or gemma.
   * @returns {Promise<object>} Prepared tokenizer. */
  async function get(name) {
    if (name !== "gpt2" && name !== "gemma") {
      throw new TypeError(messages.unknownTokenizer);
    }
    if (clearing) {
      await clearing;
    }
    if (entries.has(name)) {
      return entries.get(name);
    }
    const current = entries;
    const promise = load(name);
    current.set(name, promise);
    try {
      return await promise;
    } catch (error) {
      if (entries === current) {
        current.delete(name);
      }
      throw error;
    }
  }
  /** Load a tokenizer from its local runtime and versioned model.
   * @param {string} name Validated tokenizer name.
   * @returns {Promise<object>} Tokenizer. */
  async function load(name) {
    if (name === "gpt2") {
      return createGPT2Tokenizer(await loadGPT2());
    }
    const [runtime, model] = await Promise.all([
      loadGemma(),
      assets.bytes("gemma-tokenizer-model-google-v1", gemmaModelUrl),
    ]);
    return createGemmaTokenizer(runtime, model.bytes, model.cached);
  }
  /** Drop in-memory instances without altering persistent data.
   * @returns {void} Resets registry entries. */
  function reset() {
    entries = new Map();
  }
  /** Wait for existing loads before clearing the cache so they cannot repopulate it.
   * @returns {Promise<void>} Resolves after clearing memory and IndexedDB. */
  async function clear() {
    if (clearing) {
      return clearing;
    }
    clearing = (
      /** Adapt the supplied value for this module’s enclosing operation.
       * @returns {Promise<*>} Result of this operation. */
      async () => {
        await Promise.allSettled([...entries.values()]);
        await assets.clear();
        reset();
      }
    )();
    try {
      await clearing;
    } finally {
      clearing = null;
    }
  }
  return {
    get,
    reset,
    clear,
  };
}
