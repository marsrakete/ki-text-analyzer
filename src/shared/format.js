/** Format a ratio as a percentage with one decimal place.
 * @param {number} n Finite ratio to format, including zero.
 * @returns {string} Percentage text such as 12.5 %. */
export function pct(n) {
  if (!Number.isFinite(n)) {
    throw new TypeError("Expected a finite ratio.");
  }
  return (n * 100).toFixed(1) + " %";
}
