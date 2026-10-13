import { messages } from "../content/de.js";

/** Parse a sequence of integer values separated by spaces, commas or semicolons.
 * @param {string} value User input.
 * @param {boolean} allowNegative Whether negative keys are allowed.
 * @param {string} message Validation failure message.
 * @returns {number[]} Validated safe integers.
 * @throws {TypeError} On missing, noninteger or unsafe values. */
function parseIntegers(value, allowNegative, message) {
  if (typeof value !== "string" || !value.trim()) {
    throw new TypeError(message);
  }
  const fields = value
    .trim()
    .split(/[\s,;]+/)
    .filter(Boolean);
  if (!fields.length) {
    throw new TypeError(message);
  }
  const values = fields.map(Number);
  for (const item of values) {
    if (!Number.isSafeInteger(item)) {
      throw new TypeError(message);
    }
    if (!allowNegative && item < 0) {
      throw new TypeError(message);
    }
  }
  return values;
}

/** Parse watermark keys from a text field.
 * @param {string} value Delimited safe integer keys.
 * @returns {number[]} Watermark keys. */
export function parseSynthKeys(value) {
  return parseIntegers(value, true, messages.invalidKeys);
}

/** Parse manual token IDs or signal that automatic tokenization is selected.
 * @param {string} value Delimited nonnegative safe integer IDs.
 * @returns {number[]|null} Token IDs or null for empty input. */
export function parseManualTokenIds(value) {
  if (typeof value !== "string") {
    throw new TypeError(messages.invalidTokens);
  }
  if (!value.trim()) {
    return null;
  }
  return parseIntegers(value, false, messages.invalidTokens);
}

/** Validate SynthID configuration independently of form constraints.
 * @param {number[]} keys Nonempty watermark key array.
 * @param {number} ngramLen N-gram length between 2 and 20.
 * @param {number} historySize Context history between 1 and 100000.
 * @returns {void} Throws on invalid configuration. */
export function validateConfiguration(keys, ngramLen, historySize) {
  if (
    !Array.isArray(keys) ||
    !keys.length ||
    keys.some(
      /** Adapt the supplied value for this module’s enclosing operation.
       * @param {number} key Watermark key.
       * @returns {*} Result of this operation. */
      (key) => {
        return !Number.isSafeInteger(key);
      },
    )
  ) {
    throw new TypeError(messages.invalidKeys);
  }
  if (!Number.isInteger(ngramLen) || ngramLen < 2 || ngramLen > 20) {
    throw new RangeError(messages.invalidNgram);
  }
  if (
    !Number.isInteger(historySize) ||
    historySize < 1 ||
    historySize > 100000
  ) {
    throw new RangeError(messages.invalidHistory);
  }
}

/** Validate a programmatic token sequence.
 * @param {number[]} tokenIds Nonnegative safe integer IDs.
 * @returns {void} Throws on an invalid token sequence. */
export function validateTokenIds(tokenIds) {
  if (
    !Array.isArray(tokenIds) ||
    tokenIds.some(
      /** Adapt the supplied value for this module’s enclosing operation.
       * @param {*} id Value supplied by the enclosing operation.
       * @returns {*} Result of this operation. */
      (id) => {
        return !Number.isSafeInteger(id) || id < 0;
      },
    )
  ) {
    throw new TypeError(messages.invalidTokens);
  }
}
