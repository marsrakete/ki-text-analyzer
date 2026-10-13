import { messages } from "../content/de.js";

/** Convert model bytes into base64 without large argument lists.
 * @param {Uint8Array} bytes SentencePiece model bytes.
 * @returns {string} Base64 model data. */
function bytesToBase64(bytes) {
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(
      ...bytes.subarray(offset, Math.min(bytes.length, offset + 0x8000)),
    );
  }
  return btoa(binary);
}

/** Initialize Gemma's local SentencePiece runtime and model.
 * @param {object} runtime SentencePiece module.
 * @param {Uint8Array} modelBytes Versioned Gemma model.
 * @param {boolean} cached Whether model bytes came from IndexedDB.
 * @returns {Promise<object>} Tokenizer with optional BOS support. */
export async function createGemmaTokenizer(
  runtime,
  modelBytes,
  cached = false,
) {
  const Processor =
    runtime.SentencePieceProcessor || runtime.default?.SentencePieceProcessor;
  if (!Processor || !(modelBytes instanceof Uint8Array) || !modelBytes.length) {
    throw new TypeError(messages.invalidModel);
  }
  const processor = new Processor();
  if (typeof processor.loadFromB64StringModel !== "function") {
    throw new TypeError(messages.invalidModel);
  }
  await processor.loadFromB64StringModel(bytesToBase64(modelBytes));
  let bosId = 2,
    vocabSize = 256000;
  if (typeof processor.bosId === "function") {
    bosId = processor.bosId();
  }
  if (typeof processor.getPieceSize === "function") {
    vocabSize = processor.getPieceSize();
  }
  return {
    name: "gemma",
    cached,
    bosId,
    vocabSize,
    mergeCount: 0,
    /** Encode text and explicitly control the Gemma BOS prefix.
     * @param {string} text Source text.
     * @param {object} options Optional addBos flag, default true.
     * @returns {number[]} Token IDs. */
    encode(text, { addBos = true } = {}) {
      if (typeof text !== "string") {
        throw new TypeError(messages.invalidText);
      }
      const ids = Array.from(processor.encodeIds(text));
      if (addBos) {
        return [bosId, ...ids];
      }
      return ids;
    },
  };
}
