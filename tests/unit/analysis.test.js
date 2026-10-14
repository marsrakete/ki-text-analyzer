import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { analyze } from "../../src/analysis/analyze.js";
import { collectMetrics } from "../../src/analysis/metrics.js";
import {
  buildScores,
  buildSubscores,
  confidenceInfo,
  band,
} from "../../src/analysis/scoring.js";
import { unicodeScan, scriptMix } from "../../src/analysis/unicode.js";
import * as statistics from "../../src/shared/statistics.js";
import { words, sentences } from "../../src/shared/text.js";
import { pct } from "../../src/shared/format.js";
import { buildAnalysisModel } from "../../src/ui/analysis-model.js";
import { gzipRatio } from "../../src/services/compression.js";
const baseline = JSON.parse(
  await readFile("tests/fixtures/analysis.json", "utf8"),
);
const calibratedScores = JSON.parse(
  await readFile("tests/fixtures/analysis-scoring-v2.json", "utf8"),
);
test("original metrics, subscores and confidence remain identical with the validated scoring adjustment" /** Verify preserved metrics and explicitly recorded adjusted scores.
 * @returns {*} Operation result or undefined for a side effect. */, () => {
  assert.equal(calibratedScores.length, baseline.length);
  for (const [index, fixture] of baseline.entries()) {
    const result = analyze(fixture.text);
    const { reasons, ...existing } = result;
    assert.deepEqual(existing, {
      ...fixture.result,
      ...calibratedScores[index],
    });
    assert.deepEqual(buildSubscores(result), fixture.subscores);
    assert.deepEqual(confidenceInfo(result), fixture.confidence);
    assert.ok(Array.isArray(reasons));
    assert.deepEqual(buildScores(collectMetrics(fixture.text)), {
      score: result.score,
      scoreParts: result.scoreParts,
      reasons,
    });
    const model = buildAnalysisModel(fixture.text, result, null);
    assert.equal(model.metrics.length, 8);
    assert.equal(model.advanced.length, 25);
    assert.equal(model.complexityRows[0][1], "nicht unterstützt");
  }
});
test("trigram repetition keeps its exact trigger boundary and contributes only three points" /** Check the unchanged trigger and the calibrated contribution around length corrections.
 * @returns {void} Verifies the specific rule without changing unrelated metrics. */, () => {
  const base = collectMetrics("Ein kurzer Beispielsatz. Noch ein Satz.");
  for (const count of [20, 80, 149, 150, 240]) {
    const metrics = { ...base, ws: Array(count).fill("wort") };
    for (const repetition of [0, 0.025, 0.025001]) {
      const result = buildScores({ ...metrics, triRepeat: repetition });
      const part = result.scoreParts.find(
        /** Identify the repetition rule in the score breakdown.
         * @param {object} item Score contribution.
         * @returns {boolean} Whether this is the trigram repetition contribution. */
        (item) => item.label === "Wiederholte 3-Wort-Folgen",
      );
      if (repetition > 0.025) assert.equal(part.delta, 3);
      else assert.equal(part, undefined);
    }
  }
});
test("analysis contracts reject missing inputs and tolerate empty text" /** Verify the behavior described by this test case.
 * @returns {*} Operation result or undefined for a side effect. */, () => {
  assert.equal(analyze("").score, 50);
  assert.ok(analyze("Hallo.").reasons.length > 0);
  for (const input of [null, undefined, 42, {}]) {
    assert.throws(
      /** Execute the enclosing operation for the supplied values.
       * @returns {*} Operation result or undefined for a side effect. */
      () => analyze(input),
      TypeError,
    );
    assert.throws(
      /** Execute the enclosing operation for the supplied values.
       * @returns {*} Operation result or undefined for a side effect. */
      () => collectMetrics(input),
      TypeError,
    );
    assert.throws(
      /** Execute the enclosing operation for the supplied values.
       * @returns {*} Operation result or undefined for a side effect. */
      () => words(input),
      TypeError,
    );
    assert.throws(
      /** Execute the enclosing operation for the supplied values.
       * @returns {*} Operation result or undefined for a side effect. */
      () => sentences(input),
      TypeError,
    );
    assert.throws(
      /** Execute the enclosing operation for the supplied values.
       * @returns {*} Operation result or undefined for a side effect. */
      () => unicodeScan(input),
      TypeError,
    );
    assert.throws(
      /** Execute the enclosing operation for the supplied values.
       * @returns {*} Operation result or undefined for a side effect. */
      () => scriptMix(input),
      TypeError,
    );
  }
  assert.throws(
    /** Execute the enclosing operation for the supplied values.
     * @returns {*} Operation result or undefined for a side effect. */
    () => buildScores(null),
    TypeError,
  );
  assert.throws(
    /** Execute the enclosing operation for the supplied values.
     * @returns {*} Operation result or undefined for a side effect. */
    () => buildSubscores({}),
    TypeError,
  );
  assert.throws(
    /** Execute the enclosing operation for the supplied values.
     * @returns {*} Operation result or undefined for a side effect. */
    () => confidenceInfo({}),
    TypeError,
  );
  assert.throws(
    /** Execute the enclosing operation for the supplied values.
     * @returns {*} Operation result or undefined for a side effect. */
    () => buildAnalysisModel("", {}, null),
    TypeError,
  );
});
test("verdict thresholds retain exact boundaries" /** Verify the behavior described by this test case.
 * @returns {*} Operation result or undefined for a side effect. */, () => {
  assert.equal(band(34)[1], "good");
  assert.equal(band(35)[1], "warn");
  assert.equal(band(59)[1], "warn");
  assert.equal(band(60)[1], "warn");
  assert.equal(band(78)[1], "bad");
});
test("Unicode offsets use UTF-16 and safe word splitting handles punctuation" /** Verify the behavior described by this test case.
 * @returns {*} Operation result or undefined for a side effect. */, () => {
  assert.deepEqual(words("Äpfel, BÄUME!"), ["äpfel", "bäume"]);
  assert.deepEqual(words(""), []);
  assert.deepEqual(sentences("Hallo!\nWie geht es?"), [
    "Hallo!",
    "Wie geht es?",
  ]);
  assert.deepEqual(sentences(""), []);
  assert.equal(unicodeScan("😀\u200B")[0].index, 2);
  assert.deepEqual(unicodeScan(""), []);
  assert.deepEqual(scriptMix("AАΩ"), {
    latin: 1,
    cyr: 1,
    greek: 1,
  });
  assert.deepEqual(scriptMix(""), {
    latin: 0,
    cyr: 0,
    greek: 0,
  });
});
test("statistics cover normal values, empty arrays and invalid input" /** Verify the behavior described by this test case.
 * @returns {*} Operation result or undefined for a side effect. */, () => {
  assert.equal(statistics.mean([1, 2, 3]), 2);
  assert.equal(statistics.stddev([1, 3]), 1);
  assert.equal(statistics.median([3, 1, 4, 2]), 2.5);
  assert.equal(statistics.median([3, 1, 2]), 2);
  assert.equal(statistics.coefficientOfVariation([1, 3]), 0.5);
  assert.equal(statistics.entropy(["a", "b"]), 1);
  assert.equal(statistics.gini([1, 1]), 0);
  assert.equal(statistics.gini([0, 0]), 0);
  for (const name of [
    "mean",
    "stddev",
    "median",
    "coefficientOfVariation",
    "entropy",
    "gini",
  ]) {
    assert.equal(statistics[name]([]), 0);
    assert.throws(
      /** Execute the enclosing operation for the supplied values.
       * @returns {*} Operation result or undefined for a side effect. */
      () => statistics[name](null),
      TypeError,
    );
  }
  assert.equal(statistics.clamp(12, 0, 10), 10);
  assert.equal(statistics.clamp(-1, 0, 10), 0);
  assert.throws(
    /** Execute the enclosing operation for the supplied values.
     * @returns {*} Operation result or undefined for a side effect. */
    () => statistics.clamp(NaN, 0, 10),
    TypeError,
  );
  assert.throws(
    /** Execute the enclosing operation for the supplied values.
     * @returns {*} Operation result or undefined for a side effect. */
    () => statistics.clamp(5, 10, 0),
    RangeError,
  );
  assert.throws(
    /** Execute the enclosing operation for the supplied values.
     * @returns {*} Operation result or undefined for a side effect. */
    () => statistics.mean([NaN]),
    TypeError,
  );
  assert.throws(
    /** Execute the enclosing operation for the supplied values.
     * @returns {*} Operation result or undefined for a side effect. */
    () => statistics.gini([-1, 1]),
    RangeError,
  );
  assert.throws(
    /** Execute the enclosing operation for the supplied values.
     * @returns {*} Operation result or undefined for a side effect. */
    () => statistics.entropy([1]),
    TypeError,
  );
  assert.equal(pct(0.125), "12.5 %");
  assert.equal(pct(0), "0.0 %");
  assert.throws(
    /** Execute the enclosing operation for the supplied values.
     * @returns {*} Operation result or undefined for a side effect. */
    () => pct(null),
    TypeError,
  );
});
test("gzip measures UTF-8 bytes and unsupported capabilities" /** Verify the behavior described by this test case.
 * @returns {*} Operation result or undefined for a side effect. */, async () => {
  assert.ok((await gzipRatio("Wiederholung ".repeat(100))) < 0.1);
  assert.equal(await gzipRatio(""), null);
  await assert.rejects(gzipRatio(null), TypeError);
  const original = globalThis.CompressionStream;
  try {
    globalThis.CompressionStream = undefined;
    assert.equal(await gzipRatio("Hallo"), null);
  } finally {
    globalThis.CompressionStream = original;
  }
});
