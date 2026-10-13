import { messages } from "../content/de.js";

/** Compare compressed gzip size to the original UTF-8 size.
 * @param {string} text Source text.
 * @returns {Promise<number|null>} Byte ratio or null for empty text/unsupported API. */
export async function gzipRatio(text) {
  if (typeof text !== "string") {
    throw new TypeError(messages.invalidText);
  }
  if (!text || typeof CompressionStream === "undefined") {
    return null;
  }
  const bytes = new TextEncoder().encode(text);
  const stream = new Blob([bytes])
    .stream()
    .pipeThrough(new CompressionStream("gzip"));
  const compressed = await new Response(stream).arrayBuffer();
  return compressed.byteLength / bytes.byteLength;
}
