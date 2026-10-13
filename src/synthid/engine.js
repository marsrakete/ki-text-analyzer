/*
 * Portions adapted from Google DeepMind synthid-text, Copyright 2026 Google LLC.
 * SPDX-License-Identifier: Apache-2.0
 * Source: https://github.com/google-deepmind/synthid-text/tree/a6ec02c22ce87177c061643503e14a7cc839dc2b
 * Changes: JavaScript BigInt hashing, validated browser inputs, context history
 * ring buffer and local approximate z-score. Full notice: licenses.html#synthid
 * and vendor/licenses/synthid-text.txt.
 */
import {
  SYNTH_MULT,
  DEFAULT_SYNTH_KEYS,
  DEFAULT_SYNTH_IV,
  DEFAULT_SYNTH_PARAMETERS,
} from "../content/synthid-config.js";
import { validateConfiguration, validateTokenIds } from "./validation.js";
import { messages, format } from "../content/de.js";

/** Normalize an integer to signed int64.
 * @param {bigint|number} value Integer to normalize.
 * @returns {bigint} Signed 64-bit integer. */
function i64(value) {
  return BigInt.asIntN(64, BigInt(value));
}

/** Apply the reference linear-congruential hash with signed overflow.
 * @param {bigint|number} current Initial hash.
 * @param {Array<bigint|number>} data Integer sequence.
 * @returns {bigint} Signed 64-bit hash. */
export function synthAccumulateHash(current, data) {
  let hash = i64(current);
  for (const value of data) {
    hash = i64((hash + i64(value)) * SYNTH_MULT + 1n);
  }
  return hash;
}

/** Derive the SHA-256 IV from little-endian int64 keys.
 * @param {number[]} keys Safe integer watermark keys.
 * @returns {Promise<bigint>} Reference initialization vector. */
export async function synthHashIV(keys) {
  validateConfiguration(keys, 5, 1024);
  if (
    keys.length === DEFAULT_SYNTH_KEYS.length &&
    keys.every(
      /** Check whether the key matches its reference position.
       * @param {*} key Input supplied by the enclosing API.
       * @param {*} index Input supplied by the enclosing API.
       * @returns {*} Operation result or undefined for a side effect. */
      (key, index) => key === DEFAULT_SYNTH_KEYS[index],
    )
  ) {
    return DEFAULT_SYNTH_IV;
  }
  if (!globalThis.crypto?.subtle) {
    throw new Error(messages.cryptoMissing);
  }
  const bytes = new ArrayBuffer(keys.length * 8);
  const view = new DataView(bytes);
  for (let index = 0; index < keys.length; index++) {
    view.setBigInt64(index * 8, BigInt(keys[index]), true);
  }
  const digest = new Uint8Array(
    await globalThis.crypto.subtle.digest("SHA-256", bytes),
  );
  let value = 0n;
  for (const byte of digest) {
    value = (value << 8n) | BigInt(byte);
  }
  return value % ((1n << 63n) - 1n);
}

/** Reconstruct a g-value for one n-gram/key pair.
 * @param {bigint} baseHash Accumulated n-gram hash.
 * @param {number} key Safe integer watermark key.
 * @returns {number} Binary g-value. */
export function synthGValue(baseHash, key) {
  let hash = synthAccumulateHash(baseHash, [BigInt(key)]);
  for (let round = 0; round < 12; round++) {
    hash = synthAccumulateHash(hash, [1n]) >> 5n;
  }
  let bit = (hash >> 30n) % 2n;
  if (bit < 0n) {
    bit += 2n;
  }
  return Number(bit);
}

/** Mask repeated contexts in a sliding history initialized with zero hashes.
 * @param {number[]} tokenIds Nonnegative safe integer token IDs.
 * @param {number} ngramLen N-gram length, 2 to 20.
 * @param {number} historySize Remembered contexts, 1 to 100000.
 * @param {bigint} iv Initialization vector.
 * @returns {number[]} One for usable contexts, zero for repeats. */
export function synthContextMask(tokenIds, ngramLen, historySize, iv) {
  validateConfiguration([0], ngramLen, historySize);
  validateTokenIds(tokenIds);
  const queue = new Array(historySize).fill("0");
  const frequencies = new Map([["0", historySize]]);
  const mask = [];
  let cursor = 0;
  for (let index = 0; index <= tokenIds.length - ngramLen; index++) {
    const hash = synthAccumulateHash(
      iv,
      tokenIds.slice(index, index + ngramLen - 1),
    ).toString();
    if ((frequencies.get(hash) || 0) > 0) {
      mask.push(0);
    } else {
      mask.push(1);
    }
    const old = queue[cursor];
    const remaining = frequencies.get(old) - 1;
    if (remaining === 0) {
      frequencies.delete(old);
    } else {
      frequencies.set(old, remaining);
    }
    queue[cursor] = hash;
    cursor = (cursor + 1) % historySize;
    frequencies.set(hash, (frequencies.get(hash) || 0) + 1);
  }
  return mask;
}

/** Compute mean, weighted mean and an approximate null-model z-score.
 * @param {number[]} tokenIds Token sequence from the matching model.
 * @param {number[]} keys Watermark keys used during generation.
 * @param {number} ngramLen N-gram length, default five.
 * @param {number} historySize Context history, default 1024.
 * @returns {Promise<object>} Scores, counts, depth and string IV. */
export async function synthReferenceScore(
  tokenIds,
  keys,
  ngramLen = DEFAULT_SYNTH_PARAMETERS.ngramLen,
  historySize = DEFAULT_SYNTH_PARAMETERS.historySize,
) {
  validateConfiguration(keys, ngramLen, historySize);
  validateTokenIds(tokenIds);
  if (tokenIds.length < ngramLen) {
    throw new RangeError(format(messages.tooFewTokens, ngramLen));
  }
  const iv = await synthHashIV(keys);
  const mask = synthContextMask(tokenIds, ngramLen, historySize, iv);
  const depth = keys.length;
  const rawWeights = [];
  for (let index = 0; index < depth; index++) {
    rawWeights.push(10 - (9 * index) / Math.max(1, depth - 1));
  }
  let weightSum = 0;
  for (const weight of rawWeights) {
    weightSum += weight;
  }
  const weights = rawWeights.map(
    /** Extract the calculated value used by the enclosing collection.
     * @param {*} weight Input supplied by the enclosing API.
     * @returns {*} Operation result or undefined for a side effect. */
    (weight) => (weight * depth) / weightSum,
  );
  let meanSum = 0,
    weightedSum = 0,
    valid = 0;
  for (let index = 0; index < mask.length; index++) {
    if (!mask[index]) {
      continue;
    }
    valid++;
    const base = synthAccumulateHash(
      iv,
      tokenIds.slice(index, index + ngramLen),
    );
    for (let layer = 0; layer < depth; layer++) {
      const value = synthGValue(base, keys[layer]);
      meanSum += value;
      weightedSum += value * weights[layer];
    }
  }
  if (!valid) {
    throw new Error(messages.allMasked);
  }
  const mean = meanSum / (depth * valid),
    weighted = weightedSum / (depth * valid);
  let squaredWeightSum = 0;
  for (const weight of weights) {
    squaredWeightSum += weight * weight;
  }
  const standardError = Math.sqrt(
    (0.25 * squaredWeightSum) / (depth * depth * valid),
  );
  let z = 0;
  if (standardError) {
    z = (weighted - 0.5) / standardError;
  }
  return {
    mean,
    weighted,
    z,
    valid,
    totalNgrams: mask.length,
    masked: mask.length - valid,
    depth,
    iv: iv.toString(),
  };
}
