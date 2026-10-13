import { suspiciousUnicode } from "../content/reference-data.js";
/** Collect configured Unicode markers with UTF-16 source offsets.
 * @param {string} text Source text.
 * @returns {*} Result of this operation. */
export function unicodeScan(text) {
  const found = [];
  let i = 0;
  for (const ch of text) {
    const cp = ch.codePointAt(0);
    if (suspiciousUnicode.has(cp)) {
      found.push({
        index: i,
        cp,
        name: suspiciousUnicode.get(cp),
        char: ch,
      });
    }
    i += ch.length;
  }
  return found;
}
/** Count Latin, Cyrillic and Greek characters.
 * @param {string} text Source text.
 * @returns {object} Result of this operation. */
export function scriptMix(text) {
  const latin = (text.match(/\p{Script=Latin}/gu) || []).length;
  const cyr = (text.match(/\p{Script=Cyrillic}/gu) || []).length;
  const greek = (text.match(/\p{Script=Greek}/gu) || []).length;
  return {
    latin,
    cyr,
    greek,
  };
}
