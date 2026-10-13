import { collectMetrics } from "./metrics.js";
import { buildScores } from "./scoring.js";
/**
 * @typedef {object} AnalysisResult
 * @property {string[]} ws Normalized lowercase words.
 * @property {string[]} ss Source sentences.
 * @property {number[]} sentLens Sentence lengths in words.
 * @property {number} score Heuristic score between 5 and 95.
 * @property {Array<{label:string, detail:string, delta:number}>} scoreParts Score contributions before final rounding/clamping.
 * @property {string[]} reasons Human-readable reasons from the central content layer.
 * @property {Array<{index:number, cp:number, name:string, char:string}>} uni Unicode findings with UTF-16 offsets.
 * @property {object} biProfile Bigram frequency/diversity/entropy profile.
 * @property {object} triProfile Trigram frequency/diversity/entropy profile.
 */
/** Analyzes text without DOM or network access.
 * @param {string} text Source text.
 * @returns {AnalysisResult} Descriptive metrics, score contributions and reasons. */
export function analyze(text) {
  if (typeof text !== "string") {
    throw new TypeError("Expected text.");
  }
  const metrics = collectMetrics(text);
  return {
    ...metrics,
    ...buildScores(metrics),
  };
}
