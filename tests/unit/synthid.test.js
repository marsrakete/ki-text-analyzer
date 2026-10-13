import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  synthAccumulateHash,
  synthHashIV,
  synthGValue,
  synthContextMask,
  synthReferenceScore,
} from "../../src/synthid/engine.js";
import {
  parseSynthKeys,
  parseManualTokenIds,
  validateConfiguration,
  validateTokenIds,
} from "../../src/synthid/validation.js";
import {
  DEFAULT_SYNTH_KEYS,
  DEFAULT_SYNTH_IV,
  SYNTHID_POSITIVE_DEMO_TOKENS,
} from "../../src/content/synthid-config.js";
test("parsers reject unsafe integers and support empty automatic-token input", /** Verify the behavior described by this test case.
 * @returns {*} Operation result or undefined for a side effect. */
() => {
  assert.deepEqual(parseSynthKeys("1, -2; 3"), [1, -2, 3]);
  assert.deepEqual(parseManualTokenIds("0, 42\n100"), [0, 42, 100]);
  assert.equal(parseManualTokenIds(""), null);
  for (const input of ["", ",;;", "NaN", "1.5", "9007199254740992", null])
    assert.throws(
      /** Execute the enclosing operation for the supplied values.
       * @returns {*} Operation result or undefined for a side effect. */
      () => parseSynthKeys(input),
      TypeError,
    );
  for (const input of ["-1", "1.5", "Infinity", "9007199254740992", null])
    assert.throws(
      /** Execute the enclosing operation for the supplied values.
       * @returns {*} Operation result or undefined for a side effect. */
      () => parseManualTokenIds(input),
      TypeError,
    );
  assert.doesNotThrow(
    /** Execute the enclosing operation for the supplied values.
     * @returns {*} Operation result or undefined for a side effect. */
    () => validateConfiguration([0], 2, 1),
  );
  assert.doesNotThrow(
    /** Execute the enclosing operation for the supplied values.
     * @returns {*} Operation result or undefined for a side effect. */
    () => validateConfiguration([1], 20, 100000),
  );
  for (const n of [NaN, 0, 1, 21, 2.1])
    assert.throws(
      /** Execute the enclosing operation for the supplied values.
       * @returns {*} Operation result or undefined for a side effect. */
      () => validateConfiguration([1], n, 1),
      RangeError,
    );
  for (const h of [NaN, 0, 100001, 1.1])
    assert.throws(
      /** Execute the enclosing operation for the supplied values.
       * @returns {*} Operation result or undefined for a side effect. */
      () => validateConfiguration([1], 5, h),
      RangeError,
    );
  assert.throws(
    /** Execute the enclosing operation for the supplied values.
     * @returns {*} Operation result or undefined for a side effect. */
    () => validateConfiguration([], 5, 1),
    TypeError,
  );
  assert.doesNotThrow(
    /** Execute the enclosing operation for the supplied values.
     * @returns {*} Operation result or undefined for a side effect. */
    () => validateTokenIds([]),
  );
  assert.doesNotThrow(
    /** Execute the enclosing operation for the supplied values.
     * @returns {*} Operation result or undefined for a side effect. */
    () => validateTokenIds([0, Number.MAX_SAFE_INTEGER]),
  );
  for (const ids of [null, [-1], [NaN], [0.1]])
    assert.throws(
      /** Execute the enclosing operation for the supplied values.
       * @returns {*} Operation result or undefined for a side effect. */
      () => validateTokenIds(ids),
      TypeError,
    );
});
test("reference hashing and default IV retain signed overflow", /** Verify the behavior described by this test case.
 * @returns {*} Operation result or undefined for a side effect. */
async () => {
  assert.equal(await synthHashIV(DEFAULT_SYNTH_KEYS), DEFAULT_SYNTH_IV);
  assert.equal(synthAccumulateHash(123n, []), 123n);
  assert.equal(synthAccumulateHash(0n, [0]), 1n);
  assert.equal(synthAccumulateHash(0n, [1]), 6364136223846793006n);
  assert.throws(
    /** Execute the enclosing operation for the supplied values.
     * @returns {*} Operation result or undefined for a side effect. */
    () => synthAccumulateHash(0n, [0.1]),
    RangeError,
  );
  await assert.rejects(synthHashIV([]), TypeError);
  assert.ok([0, 1].includes(synthGValue(-1n, -1)));
});
test("positive demo and score boundaries", /** Verify the behavior described by this test case.
 * @returns {*} Operation result or undefined for a side effect. */
async () => {
  const result = await synthReferenceScore(
    SYNTHID_POSITIVE_DEMO_TOKENS,
    DEFAULT_SYNTH_KEYS,
  );
  assert.ok(result.z > 4);
  assert.ok(result.weighted > 0.7);
  await assert.rejects(
    synthReferenceScore([], DEFAULT_SYNTH_KEYS),
    /Mindestens/,
  );
  await assert.rejects(
    synthReferenceScore([1, 2, 3, 4, 5], [], 5, 1),
    TypeError,
  );
  await assert.rejects(
    synthReferenceScore([1, 2, 3, 4, 5], [1], NaN, 1),
    RangeError,
  );
  assert.equal(
    (await synthReferenceScore([1, 2, 3, 4, 5], [1], 5, 1)).valid,
    1,
  );
});
test("mask recurrence, eviction and official zero-initialized history", /** Verify the behavior described by this test case.
 * @returns {*} Operation result or undefined for a side effect. */
() => {
  assert.deepEqual(synthContextMask([1, 2, 1, 2, 1], 2, 2, 1n), [1, 1, 0, 0]);
  assert.deepEqual(synthContextMask([1, 2, 1, 2, 1], 2, 1, 1n), [1, 1, 1, 1]);
  assert.deepEqual(synthContextMask([], 5, 1, 1n), []);
  // Choose the IV that hashes context [0] to zero; official history initially
  // contains zero hashes, so the first matching context must be masked.
  const inverse = 13877824140714322085n;
  const iv = BigInt.asIntN(64, -inverse);
  assert.equal(synthAccumulateHash(iv, [0]), 0n);
  assert.deepEqual(synthContextMask([0, 1], 2, 1, iv), [0]);
  assert.throws(
    /** Execute the enclosing operation for the supplied values.
     * @returns {*} Operation result or undefined for a side effect. */
    () => synthContextMask([1], 1, 1, 1n),
    RangeError,
  );
});
test("independent Python/upstream function fixtures match bitwise and numerically", /** Verify the behavior described by this test case.
 * @returns {*} Operation result or undefined for a side effect. */
async () => {
  const reference = JSON.parse(
    await readFile("tests/fixtures/synthid-reference.json", "utf8"),
  );
  for (const vector of reference.vectors) {
    const iv = await synthHashIV(vector.keys);
    assert.equal(iv.toString(), vector.iv);
    assert.equal(
      synthAccumulateHash(
        iv,
        vector.tokens.slice(0, vector.ngramLen),
      ).toString(),
      vector.firstHash,
    );
    assert.deepEqual(
      vector.keys.map(
        /** Extract the calculated value used by the enclosing collection.
         * @param {*} key Input supplied by the enclosing API.
         * @returns {*} Operation result or undefined for a side effect. */
        (key) => synthGValue(BigInt(vector.firstHash), key),
      ),
      vector.firstGValues,
    );
    assert.deepEqual(
      synthContextMask(vector.tokens, vector.ngramLen, vector.historySize, iv),
      vector.mask,
    );
    const score = await synthReferenceScore(
      vector.tokens,
      vector.keys,
      vector.ngramLen,
      vector.historySize,
    );
    assert.equal(score.valid, vector.valid);
    assert.ok(Math.abs(score.mean - vector.mean) < 1e-12);
    assert.ok(Math.abs(score.weighted - vector.weighted) < 1e-12);
  }
});
