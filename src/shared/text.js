/** Extract lowercase Unicode words using the German locale.
 * @param {string} text Source text.
 * @returns {string[]} Result of this operation. */ export function words(
  text,
) {
  return text.toLocaleLowerCase("de-DE").match(/\p{L}[\p{L}\p{M}'’-]*/gu) || [];
}
/** Split text into trimmed punctuation-delimited sentences.
 * @param {string} text Source text.
 * @returns {string[]} Result of this operation. */
export function sentences(text) {
  return (text.replace(/\s+/g, " ").match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [])
    .map(
      /** Normalize whitespace around a sentence boundary.
       * @param {*} s Value supplied by the enclosing operation.
       * @returns {*} Result of this operation. */
      (s) => {
        return s.trim();
      },
    )
    .filter(Boolean);
}
