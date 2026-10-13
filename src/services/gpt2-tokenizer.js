import { messages } from "../content/de.js";

/** Adapt the locally packaged GPT-2 tokenizer to the application contract.
 * @param {object} runtime GPT-2 module with encode and vocabulary data.
 * @returns {object} Tokenizer metadata and documented encode method. */
export function createGPT2Tokenizer(runtime) {
  if (typeof runtime?.encode !== "function") {
    throw new TypeError(messages.invalidModel);
  }
  return {
    name: "gpt2",
    cached: false,
    vocabSize: 50257,
    mergeCount: 50000,
    /** Encode text using the unchanged GPT-2/r50k vocabulary.
     * @param {string} text Source text.
     * @returns {number[]} Token IDs. */
    encode(text) {
      if (typeof text !== "string") {
        throw new TypeError(messages.invalidText);
      }
      return Array.from(runtime.encode(text));
    },
  };
}
