import {
  mean,
  stddev,
  median,
  coefficientOfVariation,
  entropy,
  gini,
} from "../shared/statistics.js";
import { words, sentences } from "../shared/text.js";
import {
  transitionWords,
  aiPhrases,
  functionWords as functionWordList,
  profileFunctionWords,
} from "../content/reference-data.js";
import { unicodeScan, scriptMix } from "./unicode.js";
/** Return up to eight repeated content words with their occurrence counts.
 * @param {string[]} tokens Normalized word sequence.
 * @param {number} minLen Minimum included word length.
 * @returns {Array<[string, number]>} Calculated result; empty input yields zero or an empty profile. */
function topRepeated(tokens, minLen = 4) {
  const f = new Map();
  tokens
    .filter(
      /** Keep entries satisfying this metric’s frequency or length criterion.
       * @param {*} w Value supplied by the enclosing operation.
       * @returns {*} Result of this operation. */
      (w) => {
        return w.length >= minLen;
      },
    )
    .forEach(
      /** Accumulate frequency information for the enclosing profile.
       * @param {*} w Value supplied by the enclosing operation.
       * @returns {*} Result of this operation. */
      (w) => {
        return f.set(w, (f.get(w) || 0) + 1);
      },
    );
  return [...f.entries()]
    .filter(
      /** Keep entries satisfying this metric’s frequency or length criterion.
       * @param {*} x Value supplied by the enclosing operation.
       * @returns {*} Result of this operation. */
      (x) => {
        return x[1] > 1;
      },
    )
    .sort(
      /** Order frequency entries from most to least frequent.
       * @param {number[]} a Numeric series.
       * @param {*} b Value supplied by the enclosing operation.
       * @returns {*} Result of this operation. */
      (a, b) => {
        return b[1] - a[1];
      },
    )
    .slice(0, 8);
}
/** Compute the excess-occurrence rate from the canonical n-gram profile.
 * @param {string[]} tokens Normalized word sequence.
 * @param {number} n N-gram length or value to format.
 * @returns {number} Calculated result; empty input yields zero or an empty profile. */

/** Measure the share of tokens whose word occurs exactly once.
 * @param {string[]} tokens Normalized word sequence.
 * @returns {number} Calculated result; empty input yields zero or an empty profile. */
function hapaxRatio(tokens) {
  if (!tokens.length) {
    return 0;
  }
  const f = new Map();
  tokens.forEach(
    /** Accumulate frequency information for the enclosing profile.
     * @param {*} t Value supplied by the enclosing operation.
     * @returns {*} Result of this operation. */
    (t) => {
      return f.set(t, (f.get(t) || 0) + 1);
    },
  );
  let n = 0;
  for (const v of f.values()) {
    if (v === 1) {
      n++;
    }
  }
  return n / tokens.length;
}
/** Measure unique word types occurring twice relative to the token count.
 * @param {string[]} tokens Normalized word sequence.
 * @returns {number} Calculated result; empty input yields zero or an empty profile. */
function dislegomenaRatio(tokens) {
  if (!tokens.length) {
    return 0;
  }
  const f = new Map();
  tokens.forEach(
    /** Accumulate frequency information for the enclosing profile.
     * @param {*} t Value supplied by the enclosing operation.
     * @returns {*} Result of this operation. */
    (t) => {
      return f.set(t, (f.get(t) || 0) + 1);
    },
  );
  let n = 0;
  for (const v of f.values()) {
    if (v === 2) {
      n++;
    }
  }
  return n / tokens.length;
}
/** Compute mean Unicode codepoint length per word.
 * @param {string[]} tokens Normalized word sequence.
 * @returns {number} Calculated result; empty input yields zero or an empty profile. */

/** Measure the share of words with at least eight codepoints.
 * @param {string[]} tokens Normalized word sequence.
 * @returns {number} Calculated result; empty input yields zero or an empty profile. */
function longWordRatio(tokens) {
  if (tokens.length) {
    return (
      tokens.filter(
        /** Measure the Unicode codepoint length of a word.
         * @param {*} w Value supplied by the enclosing operation.
         * @returns {*} Result of this operation. */
        (w) => {
          return [...w].length >= 8;
        },
      ).length / tokens.length
    );
  } else {
    return 0;
  }
}
/** Measure the share of words with at most three codepoints.
 * @param {string[]} tokens Normalized word sequence.
 * @returns {number} Calculated result; empty input yields zero or an empty profile. */
function shortWordRatio(tokens) {
  if (tokens.length) {
    return (
      tokens.filter(
        /** Measure the Unicode codepoint length of a word.
         * @param {*} w Value supplied by the enclosing operation.
         * @returns {*} Result of this operation. */
        (w) => {
          return [...w].length <= 3;
        },
      ).length / tokens.length
    );
  } else {
    return 0;
  }
}
/** Measure the share of words in the configured grammatical word list.
 * @param {string[]} tokens Normalized word sequence.
 * @returns {number} Calculated result; empty input yields zero or an empty profile. */
function functionWordRatio(tokens) {
  const fw = new Set(functionWordList);
  if (tokens.length) {
    return (
      tokens.filter(
        /** Keep entries satisfying this metric’s frequency or length criterion.
         * @param {*} w Value supplied by the enclosing operation.
         * @returns {*} Result of this operation. */
        (w) => {
          return fw.has(w);
        },
      ).length / tokens.length
    );
  } else {
    return 0;
  }
}
/** Measure repeated first words across source sentences.
 * @param {string[]} sentencesArr Source sentences.
 * @returns {number} Calculated result; empty input yields zero or an empty profile. */
function firstWordRepetition(sentencesArr) {
  const starts = sentencesArr
    .map(
      /** Count words in a sentence or paragraph for its length profile.
       * @param {*} s Value supplied by the enclosing operation.
       * @returns {*} Result of this operation. */
      (s) => {
        return words(s)[0];
      },
    )
    .filter(Boolean);
  if (!starts.length) {
    return 0;
  }
  const f = new Map();
  starts.forEach(
    /** Accumulate frequency information for the enclosing profile.
     * @param {*} w Value supplied by the enclosing operation.
     * @returns {*} Result of this operation. */
    (w) => {
      return f.set(w, (f.get(w) || 0) + 1);
    },
  );
  const repeated = [...f.values()]
    .filter(
      /** Keep entries satisfying this metric’s frequency or length criterion.
       * @param {*} v Value supplied by the enclosing operation.
       * @returns {*} Result of this operation. */
      (v) => {
        return v > 1;
      },
    )
    .reduce(
      /** Adapt the supplied value for this module’s enclosing operation.
       * @param {number[]} a Numeric series.
       * @param {*} v Value supplied by the enclosing operation.
       * @returns {*} Result of this operation. */
      (a, v) => {
        return a + v - 1;
      },
      0,
    );
  return repeated / starts.length;
}
/** Compute word-count mean, deviation and variation across nonempty paragraphs.
 * @param {string} text Source text.
 * @returns {{count:number, mean:number, sd:number, cv:number}} Calculated result; empty input yields zero or an empty profile. */
function paragraphStats(text) {
  let ps;
  if (text.trim()) {
    ps = text
      .trim()
      .split(/\n\s*\n/)
      .map(
        /** Count words in a sentence or paragraph for its length profile.
         * @param {*} p Value supplied by the enclosing operation.
         * @returns {*} Result of this operation. */
        (p) => {
          return words(p).length;
        },
      )
      .filter(Boolean);
  } else {
    ps = [];
  }
  return {
    count: ps.length,
    mean: mean(ps),
    sd: stddev(ps),
    cv: coefficientOfVariation(ps),
  };
}
/** Count punctuation categories and occurrences per thousand codepoints.
 * @param {string} text Source text.
 * @returns {object} Calculated result; empty input yields zero or an empty profile. */
function punctuationProfile(text) {
  const total = Math.max(1, [...text].length);
  const count =
    /** Count.
     * @param {*} re Value supplied by the enclosing operation.
     * @returns {*} Result of this operation. */
    (re) => {
      return (text.match(re) || []).length;
    };
  return {
    commas: count(/,/g),
    semicolons: count(/;/g),
    colons: count(/:/g),
    dashes: count(/[—–]/g),
    parens: count(/[()]/g),
    quotes: count(/[„“"»«]/g),
    ellipses: count(/\.{3}|…/g),
    density: (count(/[,:;—–()„“"»«!?]/g) / total) * 1000,
  };
}
/** Measure the share of unique first words across source sentences.
 * @param {string[]} sentencesArr Source sentences.
 * @returns {number} Calculated result; empty input yields zero or an empty profile. */
function sentenceStartDiversity(sentencesArr) {
  const starts = sentencesArr
    .map(
      /** Count words in a sentence or paragraph for its length profile.
       * @param {*} s Value supplied by the enclosing operation.
       * @returns {*} Result of this operation. */
      (s) => {
        return words(s)[0];
      },
    )
    .filter(Boolean);
  if (starts.length) {
    return new Set(starts).size / starts.length;
  } else {
    return 0;
  }
}
/** Divide the unique word count by the square root of token count.
 * @param {string[]} tokens Normalized word sequence.
 * @returns {number} Calculated result; empty input yields zero or an empty profile. */
function typeTokenRoot(tokens) {
  if (tokens.length) {
    return new Set(tokens).size / Math.sqrt(tokens.length);
  } else {
    return 0;
  }
}
/** Compute Yule concentration from word occurrence frequencies.
 * @param {string[]} tokens Normalized word sequence.
 * @returns {number} Calculated result; empty input yields zero or an empty profile. */
function yulesK(tokens) {
  if (!tokens.length) {
    return 0;
  }
  const f = new Map();
  tokens.forEach(
    /** Accumulate frequency information for the enclosing profile.
     * @param {*} t Value supplied by the enclosing operation.
     * @returns {*} Result of this operation. */
    (t) => {
      return f.set(t, (f.get(t) || 0) + 1);
    },
  );
  const freqOfFreq = new Map();
  for (const v of f.values()) {
    freqOfFreq.set(v, (freqOfFreq.get(v) || 0) + 1);
  }
  let sum = 0;
  for (const [i, vi] of freqOfFreq.entries()) {
    sum += i * i * vi;
  }
  const N = tokens.length;
  return (10000 * (sum - N)) / (N * N);
}
/** Measure repeated lowercase character n-grams after whitespace normalization.
 * @param {string} text Source text.
 * @param {number} n N-gram length or value to format.
 * @returns {number} Calculated result; empty input yields zero or an empty profile. */
function charNgramRepeat(text, n = 4) {
  const clean = text.toLocaleLowerCase("de-DE").replace(/\s+/g, " ").trim();
  if (clean.length < n) {
    return 0;
  }
  const f = new Map();
  for (let i = 0; i <= clean.length - n; i++) {
    const g = clean.slice(i, i + n);
    f.set(g, (f.get(g) || 0) + 1);
  }
  const total = clean.length - n + 1;
  const repeated = [...f.values()]
    .filter(
      /** Keep entries satisfying this metric’s frequency or length criterion.
       * @param {*} v Value supplied by the enclosing operation.
       * @returns {*} Result of this operation. */
      (v) => {
        return v > 1;
      },
    )
    .reduce(
      /** Adapt the supplied value for this module’s enclosing operation.
       * @param {number[]} a Numeric series.
       * @param {*} v Value supplied by the enclosing operation.
       * @returns {*} Result of this operation. */
      (a, v) => {
        return a + v - 1;
      },
      0,
    );
  return repeated / total;
}
/** Compute Shannon entropy over Unicode codepoint frequencies.
 * @param {string} text Source text.
 * @returns {number} Calculated result; empty input yields zero or an empty profile. */

/** Measure conditional next-word entropy from observed adjacent word pairs.
 * @param {string[]} tokens Normalized word sequence.
 * @returns {number} Calculated result; empty input yields zero or an empty profile. */
function conditionalWordEntropy(tokens) {
  if (tokens.length < 2) {
    return 0;
  }
  const prevCounts = new Map(),
    pairCounts = new Map();
  for (let i = 0; i < tokens.length - 1; i++) {
    const a = tokens[i],
      b = tokens[i + 1];
    prevCounts.set(a, (prevCounts.get(a) || 0) + 1);
    const k = a + "\u0000" + b;
    pairCounts.set(k, (pairCounts.get(k) || 0) + 1);
  }
  let H = 0;
  const N = tokens.length - 1;
  for (const [k, c] of pairCounts.entries()) {
    const idx = k.indexOf("\u0000"),
      a = k.slice(0, idx);
    const ca = prevCounts.get(a);
    const pJoint = c / N;
    const pCond = c / ca;
    H -= pJoint * Math.log2(pCond);
  }
  return H;
}
/** Fit the log-frequency slope for up to one hundred frequent words.
 * @param {string[]} tokens Normalized word sequence.
 * @returns {number} Calculated result; empty input yields zero or an empty profile. */
function zipfSlope(tokens) {
  if (tokens.length < 20) {
    return 0;
  }
  const f = new Map();
  tokens.forEach(
    /** Accumulate frequency information for the enclosing profile.
     * @param {*} t Value supplied by the enclosing operation.
     * @returns {*} Result of this operation. */
    (t) => {
      return f.set(t, (f.get(t) || 0) + 1);
    },
  );
  const freqs = [...f.values()]
    .sort(
      /** Adapt the supplied value for this module’s enclosing operation.
       * @param {number[]} a Numeric series.
       * @param {*} b Value supplied by the enclosing operation.
       * @returns {*} Result of this operation. */
      (a, b) => {
        return b - a;
      },
    )
    .slice(0, Math.min(100, f.size));
  const xs = [],
    ys = [];
  freqs.forEach(
    /** Collect log-scaled frequency/rank points for the Zipf fit.
     * @param {*} freq Value supplied by the enclosing operation.
     * @param {*} i Value supplied by the enclosing operation.
     * @returns {*} Result of this operation. */
    (freq, i) => {
      if (freq > 0) {
        xs.push(Math.log(i + 1));
        ys.push(Math.log(freq));
      }
    },
  );
  const mx = mean(xs),
    my = mean(ys);
  let num = 0,
    den = 0;
  for (let i = 0; i < xs.length; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    den += (xs[i] - mx) ** 2;
  }
  if (den) {
    return num / den;
  } else {
    return 0;
  }
}
/** Measure incremental Lempel-Ziv phrase count relative to normalized text length.
 * @param {string} text Source text.
 * @returns {number} Calculated result; empty input yields zero or an empty profile. */
function lzComplexity(text) {
  const s = text.replace(/\s+/g, " ").trim();
  if (!s.length) {
    return 0;
  }
  let i = 0,
    c = 0;
  while (i < s.length) {
    let len = 1;
    while (i + len <= s.length) {
      const sub = s.slice(i, i + len);
      const earlier = s.slice(0, i);
      if (!earlier.includes(sub)) {
        break;
      }
      len++;
    }
    c++;
    i += Math.max(1, len);
  }
  return c / Math.max(1, s.length);
}
/** Average Jaccard overlap across all nonempty sentence word sets.
 * @param {string[]} sentencesArr Source sentences.
 * @returns {number} Calculated result; empty input yields zero or an empty profile. */
function sentenceJaccard(sentencesArr) {
  const sets = sentencesArr
    .map(
      /** Convert one source item to the representation required by this metric or view.
       * @param {*} s Value supplied by the enclosing operation.
       * @returns {*} Result of this operation. */
      (s) => {
        return new Set(words(s));
      },
    )
    .filter(
      /** Keep entries satisfying this metric’s frequency or length criterion.
       * @param {*} s Value supplied by the enclosing operation.
       * @returns {*} Result of this operation. */
      (s) => {
        return s.size;
      },
    );
  if (sets.length < 2) {
    return 0;
  }
  let sum = 0,
    count = 0;
  for (let i = 0; i < sets.length; i++) {
    for (let j = i + 1; j < sets.length; j++) {
      const a = sets[i],
        b = sets[j];
      let inter = 0;
      for (const x of a) {
        if (b.has(x)) {
          inter++;
        }
      }
      const union = a.size + b.size - inter;
      if (union) {
        sum += inter / union;
        count++;
      }
    }
  }
  if (count) {
    return sum / count;
  } else {
    return 0;
  }
}
/** Compute lag-one autocorrelation of sentence word counts.
 * @param {number[]} lengths Sentence word counts.
 * @returns {number} Calculated result; empty input yields zero or an empty profile. */
function sentenceLengthAutocorr(lengths) {
  if (lengths.length < 3) {
    return 0;
  }
  const m = mean(lengths);
  let num = 0,
    den = 0;
  for (let i = 0; i < lengths.length - 1; i++) {
    num += (lengths[i] - m) * (lengths[i + 1] - m);
  }
  for (const x of lengths) {
    den += (x - m) ** 2;
  }
  if (den) {
    return num / den;
  } else {
    return 0;
  }
}
/** Describe n-gram frequency, diversity, repeats, entropy, concentration and top patterns.
 * @param {string[]} tokens Normalized word sequence.
 * @param {number} n N-gram length or value to format.
 * @returns {object} Calculated result; empty input yields zero or an empty profile. */
function ngramProfile(tokens, n = 2) {
  if (tokens.length < n) {
    return {
      total: 0,
      unique: 0,
      diversity: 0,
      repeatRate: 0,
      entropy: 0,
      gini: 0,
      top: [],
    };
  }
  const f = new Map();
  const total = tokens.length - n + 1;
  for (let i = 0; i <= tokens.length - n; i++) {
    const k = tokens.slice(i, i + n).join(" ");
    f.set(k, (f.get(k) || 0) + 1);
  }
  let h = 0;
  for (const c of f.values()) {
    const p = c / total;
    h -= p * Math.log2(p);
  }
  const repeated = [...f.values()]
    .filter(
      /** Keep entries satisfying this metric’s frequency or length criterion.
       * @param {*} v Value supplied by the enclosing operation.
       * @returns {*} Result of this operation. */
      (v) => {
        return v > 1;
      },
    )
    .reduce(
      /** Adapt the supplied value for this module’s enclosing operation.
       * @param {number[]} a Numeric series.
       * @param {*} v Value supplied by the enclosing operation.
       * @returns {*} Result of this operation. */
      (a, v) => {
        return a + v - 1;
      },
      0,
    );
  return {
    total,
    unique: f.size,
    diversity: f.size / total,
    repeatRate: repeated / total,
    entropy: h,
    gini: gini([...f.values()]),
    top: [...f.entries()]
      .sort(
        /** Order frequency entries from most to least frequent.
         * @param {number[]} a Numeric series.
         * @param {*} b Value supplied by the enclosing operation.
         * @returns {*} Result of this operation. */
        (a, b) => {
          return b[1] - a[1];
        },
      )
      .slice(0, 8),
  };
}
/** Measure relative sentence-length deviation in sliding sentence windows.
 * @param {number[]} lengths Sentence word counts.
 * @param {number} windowSize Maximum local window size.
 * @returns {Array<{start:number, end:number, value:number}>} Calculated result; empty input yields zero or an empty profile. */
function localBurstiness(lengths, windowSize = 5) {
  const out = [];
  if (lengths.length < 2) {
    return out;
  }
  const w = Math.min(windowSize, lengths.length);
  for (let i = 0; i <= lengths.length - w; i++) {
    const seg = lengths.slice(i, i + w),
      m = mean(seg);
    let _value;
    if (m) {
      _value = stddev(seg) / m;
    } else {
      _value = 0;
    }
    out.push({
      start: i + 1,
      end: i + w,
      value: _value,
    });
  }
  return out;
}
/** Measure word entropy in overlapping word windows of at least twenty words.
 * @param {string[]} tokens Normalized word sequence.
 * @param {number} windowSize Maximum local window size.
 * @returns {Array<{start:number, end:number, value:number}>} Calculated result; empty input yields zero or an empty profile. */
function localEntropy(tokens, windowSize = 80) {
  if (!tokens.length) {
    return [];
  }
  const w = Math.min(windowSize, tokens.length);
  const step = Math.max(20, Math.floor(w / 2));
  const out = [];
  for (let i = 0; i < tokens.length; i += step) {
    const seg = tokens.slice(i, Math.min(tokens.length, i + w));
    if (seg.length < 20) {
      break;
    }
    out.push({
      start: i + 1,
      end: i + seg.length,
      value: entropy(seg),
    });
    if (i + w >= tokens.length) {
      break;
    }
  }
  return out;
}
/** Return up to twelve frequent grammatical words with counts and token shares.
 * @param {string[]} tokens Normalized word sequence.
 * @returns {Array<{word:string, count:number, share:number}>} Calculated result; empty input yields zero or an empty profile. */
function functionWordProfile(tokens) {
  const fw = profileFunctionWords;
  const f = new Map();
  tokens.forEach(
    /** Accumulate frequency information for the enclosing profile.
     * @param {*} t Value supplied by the enclosing operation.
     * @returns {*} Result of this operation. */
    (t) => {
      if (fw.includes(t)) {
        f.set(t, (f.get(t) || 0) + 1);
      }
    },
  );
  return [...f.entries()]
    .sort(
      /** Order frequency entries from most to least frequent.
       * @param {number[]} a Numeric series.
       * @param {*} b Value supplied by the enclosing operation.
       * @returns {*} Result of this operation. */
      (a, b) => {
        return b[1] - a[1];
      },
    )
    .slice(0, 12)
    .map(
      /** Convert one source item to the representation required by this metric or view.
       * @param {*} argument1 Value supplied by the enclosing operation.
       * @returns {*} Result of this operation. */
      ([word, count]) => {
        let share;
        if (tokens.length) {
          share = count / tokens.length;
        } else {
          share = 0;
        }
        return {
          word,
          count,
          share: share,
        };
      },
    );
}
/** Collect all descriptive metrics without evaluating authorship.
 * @param {string} text Source text.
 * @returns {object} Result of this operation. */
export function collectMetrics(text) {
  const ws = words(text);
  const ss = sentences(text);
  const sentLens = ss
    .map(
      /** Count words in a sentence or paragraph for its length profile.
       * @param {*} s Value supplied by the enclosing operation.
       * @returns {*} Result of this operation. */
      (s) => {
        return words(s).length;
      },
    )
    .filter(Boolean);
  const unique = new Set(ws);
  const avgSentence = mean(sentLens);
  const sentenceSD = stddev(sentLens);
  let burstiness;
  if (avgSentence) {
    burstiness = sentenceSD / avgSentence;
  } else {
    burstiness = 0;
  }
  let lexical;
  if (ws.length) {
    lexical = unique.size / ws.length;
  } else {
    lexical = 0;
  }
  const ent = entropy(ws);
  const punct = (text.match(/[,:;—–()]/g) || []).length;
  let paragraphCount;
  if (text.trim()) {
    paragraphCount = text.trim().split(/\n\s*\n/).length;
  } else {
    paragraphCount = 0;
  }
  const digitCount = (text.match(/\d/g) || []).length;
  const questionCount = (text.match(/\?/g) || []).length;
  const exclamationCount = (text.match(/!/g) || []).length;
  const quotes = (text.match(/[„“"»«]/g) || []).length;
  const lower = text.toLocaleLowerCase("de-DE");
  const transitions = transitionWords.filter(
    /** Match a configured phrase against lowercase source text.
     * @param {*} w Value supplied by the enclosing operation.
     * @returns {*} Result of this operation. */
    (w) => {
      return lower.includes(w);
    },
  );
  const phrases = aiPhrases.filter(
    /** Match a configured phrase against lowercase source text.
     * @param {*} w Value supplied by the enclosing operation.
     * @returns {*} Result of this operation. */
    (w) => {
      return lower.includes(w);
    },
  );
  const uni = unicodeScan(text);
  const scripts = scriptMix(text);
  const repeats = topRepeated(ws);
  const biProfile = ngramProfile(ws, 2);
  const triProfile = ngramProfile(ws, 3);
  const triRepeat = triProfile.repeatRate;
  const wordLens = ws.map(
    /** Measure the Unicode codepoint length of a word.
     * @param {*} w Value supplied by the enclosing operation.
     * @returns {*} Result of this operation. */
    (w) => {
      return [...w].length;
    },
  );
  const avgWord = mean(wordLens);
  const wordLenSD = stddev(wordLens);
  const wordLenCV = coefficientOfVariation(wordLens);
  const medSentence = median(sentLens);
  const sentCV = coefficientOfVariation(sentLens);
  const hapax = hapaxRatio(ws);
  const dislegomena = dislegomenaRatio(ws);
  const longWords = longWordRatio(ws);
  const shortWords = shortWordRatio(ws);
  const functionWords = functionWordRatio(ws);
  const firstWordRepeat = firstWordRepetition(ss);
  const startDiversity = sentenceStartDiversity(ss);
  const para = paragraphStats(text);
  const punctProfile = punctuationProfile(text);
  const rootTTR = typeTokenRoot(ws);
  const yuleK = yulesK(ws);
  const char4Repeat = charNgramRepeat(text, 4);
  const charEntropy = entropy([...text]);
  const bigramDiversity = biProfile.diversity;
  const trigramDiversity = triProfile.diversity;
  const condEntropy = conditionalWordEntropy(ws);
  const zipf = zipfSlope(ws);
  const lz = lzComplexity(text);
  const sentJaccard = sentenceJaccard(ss);
  const sentAutocorr = sentenceLengthAutocorr(sentLens);
  const burstWindows = localBurstiness(sentLens, 5);
  const entropyWindows = localEntropy(ws, 80);
  const functionProfile = functionWordProfile(ws);
  return {
    ws,
    ss,
    sentLens,
    avgSentence,
    sentenceSD,
    burstiness,
    lexical,
    ent,
    punct,
    paragraphCount,
    digitCount,
    questionCount,
    exclamationCount,
    quotes,
    transitions,
    phrases,
    uni,
    scripts,
    repeats,
    triRepeat,
    avgWord,
    wordLenSD,
    wordLenCV,
    medSentence,
    sentCV,
    hapax,
    dislegomena,
    longWords,
    shortWords,
    functionWords,
    firstWordRepeat,
    startDiversity,
    para,
    punctProfile,
    rootTTR,
    yuleK,
    char4Repeat,
    charEntropy,
    bigramDiversity,
    trigramDiversity,
    condEntropy,
    zipf,
    lz,
    sentJaccard,
    sentAutocorr,
    biProfile,
    triProfile,
    burstWindows,
    entropyWindows,
    functionProfile,
  };
}
