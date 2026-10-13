/** Require a finite numeric series before calculating statistics.
 * @param {number[]} values Numeric series, possibly empty.
 * @returns {void} Throws for nonarrays or nonfinite members. */
function validateSeries(values) {
  if (!Array.isArray(values)) {
    throw new TypeError("Expected a numeric series.");
  }
  for (const value of values) {
    if (!Number.isFinite(value)) {
      throw new TypeError("Expected finite numbers.");
    }
  }
}

/** Compute the arithmetic mean of a numeric series.
 * @param {number[]} values Numeric series.
 * @returns {number} Mean, or zero for an empty series. */
export function mean(values) {
  validateSeries(values);
  if (!values.length) {
    return 0;
  }
  let sum = 0;
  for (const value of values) {
    sum += value;
  }
  return sum / values.length;
}

/** Compute population standard deviation using the arithmetic mean.
 * @param {number[]} values Numeric series.
 * @returns {number} Standard deviation, or zero for an empty series. */
export function stddev(values) {
  const average = mean(values);
  if (!values.length) {
    return 0;
  }
  let squared = 0;
  for (const value of values) {
    squared += (value - average) ** 2;
  }
  return Math.sqrt(squared / values.length);
}

/** Restrict a finite number to inclusive lower and upper bounds.
 * @param {number} value Value to restrict.
 * @param {number} lower Inclusive lower bound.
 * @param {number} upper Inclusive upper bound.
 * @returns {number} Restricted number. */
export function clamp(value, lower, upper) {
  if (
    !Number.isFinite(value) ||
    !Number.isFinite(lower) ||
    !Number.isFinite(upper)
  ) {
    throw new TypeError("Expected finite bounds and value.");
  }
  if (lower > upper) {
    throw new RangeError("Lower bound must not exceed upper bound.");
  }
  return Math.max(lower, Math.min(upper, value));
}

/** Compare two numbers in ascending order for numeric sorting.
 * @param {number} first First number.
 * @param {number} second Second number.
 * @returns {number} Negative, zero or positive comparison. */
function ascending(first, second) {
  return first - second;
}

/** Compute a numeric median without changing the source array.
 * @param {number[]} values Numeric series.
 * @returns {number} Median, or zero for an empty series. */
export function median(values) {
  validateSeries(values);
  if (!values.length) {
    return 0;
  }
  const sorted = [...values].sort(ascending);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2) {
    return sorted[middle];
  }
  return (sorted[middle - 1] + sorted[middle]) / 2;
}

/** Divide population standard deviation by the arithmetic mean.
 * @param {number[]} values Numeric series.
 * @returns {number} Relative deviation, or zero when the mean is zero. */
export function coefficientOfVariation(values) {
  const average = mean(values);
  if (!average) {
    return 0;
  }
  return stddev(values) / average;
}

/** Compute Shannon entropy over the observed token frequencies.
 * @param {string[]} tokens Word or character sequence.
 * @returns {number} Entropy in bits, or zero for empty input. */
export function entropy(tokens) {
  if (!Array.isArray(tokens)) {
    throw new TypeError("Expected a token sequence.");
  }
  if (!tokens.length) {
    return 0;
  }
  const frequencies = new Map();
  for (const token of tokens) {
    if (typeof token !== "string") {
      throw new TypeError("Expected text tokens.");
    }
    frequencies.set(token, (frequencies.get(token) || 0) + 1);
  }
  let value = 0;
  for (const count of frequencies.values()) {
    const probability = count / tokens.length;
    value -= probability * Math.log2(probability);
  }
  return value;
}

/** Compute Gini concentration without changing the source array.
 * @param {number[]} values Nonnegative frequency values.
 * @returns {number} Concentration; zero for empty input or zero total. */
export function gini(values) {
  validateSeries(values);
  if (!values.length) {
    return 0;
  }
  let sum = 0;
  for (const value of values) {
    if (value < 0) {
      throw new RangeError("Expected nonnegative frequencies.");
    }
    sum += value;
  }
  if (!sum) {
    return 0;
  }
  const sorted = [...values].sort(ascending);
  let weighted = 0;
  for (let index = 0; index < sorted.length; index++) {
    weighted += (index + 1) * sorted[index];
  }
  return (
    (2 * weighted) / (sorted.length * sum) - (sorted.length + 1) / sorted.length
  );
}
