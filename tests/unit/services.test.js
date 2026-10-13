import test from "node:test";
import assert from "node:assert/strict";
import { createAssetStore } from "../../src/services/asset-store.js";
import { createGPT2Tokenizer } from "../../src/services/gpt2-tokenizer.js";
import { createGemmaTokenizer } from "../../src/services/gemma-tokenizer.js";
import { createTokenizerRegistry } from "../../src/services/tokenizer-registry.js";
import { encode } from "gpt-tokenizer/model/gpt2";
import { readFile } from "node:fs/promises";
test("GPT-2 agrees with independent tiktoken fixtures and validates input", /** Verify the behavior described by this test case.
 * @returns {*} Operation result or undefined for a side effect. */
async () => {
  const fixture = JSON.parse(
    await readFile("tests/fixtures/tokenizers.json", "utf8"),
  );
  const tokenizer = createGPT2Tokenizer({
    encode,
  });
  for (const vector of fixture.vectors)
    assert.deepEqual(tokenizer.encode(vector.text), vector.gpt2);
  assert.equal(tokenizer.vocabSize, 50257);
  assert.throws(
    /** Execute the enclosing operation for the supplied values.
     * @returns {*} Operation result or undefined for a side effect. */
    () => createGPT2Tokenizer({}),
    TypeError,
  );
  assert.throws(
    /** Execute the enclosing operation for the supplied values.
     * @returns {*} Operation result or undefined for a side effect. */
    () => tokenizer.encode(null),
    TypeError,
  );
});
test("Gemma adapter handles optional BOS and invalid runtime/model inputs", /** Verify the behavior described by this test case.
 * @returns {*} Operation result or undefined for a side effect. */
async () => {
  class Processor {
    /** Verify the behavior described by this test case.
     * @param {*} value Input supplied by the enclosing API.
     * @returns {*} Operation result or undefined for a side effect. */
    async loadFromB64StringModel(value) {
      assert.ok(value.length > 0);
    }
    /** Verify the behavior described by this test case.
     * @param {*} text Input supplied by the enclosing API.
     * @returns {*} Operation result or undefined for a side effect. */
    encodeIds(text) {
      if (!text) return [];
      return [42];
    }
    /** Verify the behavior described by this test case.
     * @returns {*} Operation result or undefined for a side effect. */
    bosId() {
      return 2;
    }
    /** Verify the behavior described by this test case.
     * @returns {*} Operation result or undefined for a side effect. */
    getPieceSize() {
      return 256000;
    }
  }
  const tokenizer = await createGemmaTokenizer(
    {
      SentencePieceProcessor: Processor,
    },
    new Uint8Array([1]),
    true,
  );
  assert.deepEqual(tokenizer.encode("test"), [2, 42]);
  assert.deepEqual(
    tokenizer.encode("test", {
      addBos: false,
    }),
    [42],
  );
  assert.deepEqual(tokenizer.encode(""), [2]);
  assert.equal(tokenizer.cached, true);
  assert.throws(
    /** Execute the enclosing operation for the supplied values.
     * @returns {*} Operation result or undefined for a side effect. */
    () => tokenizer.encode(null),
    TypeError,
  );
  await assert.rejects(
    createGemmaTokenizer({}, new Uint8Array([1])),
    TypeError,
  );
  await assert.rejects(
    createGemmaTokenizer(
      {
        SentencePieceProcessor: Processor,
      },
      new Uint8Array(),
    ),
    TypeError,
  );
});
test("local assets work without IndexedDB and reject HTTP errors/empty model", /** Verify the behavior described by this test case.
 * @returns {*} Operation result or undefined for a side effect. */
async () => {
  let calls = 0;
  const store = createAssetStore({
    indexedDB: null,
    fetchAsset:
      /** Execute the enclosing operation for the supplied values.
       * @returns {*} Operation result or undefined for a side effect. */
      async () => {
        calls++;
        return new Response(new Uint8Array([1, 2, 3]));
      },
  });
  assert.deepEqual(
    (await store.bytes("key", "local.model")).bytes,
    new Uint8Array([1, 2, 3]),
  );
  assert.equal(calls, 1);
  await store.clear();
  const bad = createAssetStore({
    indexedDB: null,
    fetchAsset:
      /** Execute the enclosing operation for the supplied values.
       * @returns {*} Operation result or undefined for a side effect. */
      async () =>
        new Response("", {
          status: 404,
        }),
  });
  await assert.rejects(bad.bytes("key", "local.model"), /404/);
  const empty = createAssetStore({
    indexedDB: null,
    fetchAsset:
      /** Execute the enclosing operation for the supplied values.
       * @returns {*} Operation result or undefined for a side effect. */
      async () => new Response(new Uint8Array()),
  });
  await assert.rejects(empty.bytes("key", "local.model"), /ungültig/);
});
test("registry shares concurrent loads, retries failures and rejects unknown tokenizers", /** Verify the behavior described by this test case.
 * @returns {*} Operation result or undefined for a side effect. */
async () => {
  let loads = 0,
    fail = true;
  const registry = createTokenizerRegistry({
    assets: {
      clear:
        /** Execute the enclosing operation for the supplied values.
         * @returns {*} Operation result or undefined for a side effect. */
        async () => {},
    },
    loadGPT2:
      /** Execute the enclosing operation for the supplied values.
       * @returns {*} Operation result or undefined for a side effect. */
      async () => {
        loads++;
        if (fail) throw new Error("first load fails");
        return {
          encode,
        };
      },
    loadGemma:
      /** Execute the enclosing operation for the supplied values.
       * @returns {*} Operation result or undefined for a side effect. */
      async () => ({}),
    gemmaModelUrl: "local.model",
  });
  const errors = await Promise.allSettled([
    registry.get("gpt2"),
    registry.get("gpt2"),
  ]);
  assert.equal(loads, 1);
  assert.ok(
    errors.every(
      /** Check whether the key matches its reference position.
       * @param {*} result Input supplied by the enclosing API.
       * @returns {*} Operation result or undefined for a side effect. */
      (result) => result.status === "rejected",
    ),
  );
  fail = false;
  const [first, second] = await Promise.all([
    registry.get("gpt2"),
    registry.get("gpt2"),
  ]);
  assert.equal(first, second);
  assert.equal(loads, 2);
  await assert.rejects(registry.get("unknown"), TypeError);
  registry.reset();
  await registry.get("gpt2");
  assert.equal(loads, 3);
});
test("cache clearing waits for pending loads and permits a clean next load", /** Verify the behavior described by this test case.
 * @returns {*} Operation result or undefined for a side effect. */
async () => {
  let resolveLoad,
    clearCount = 0,
    loads = 0;
  const registry = createTokenizerRegistry({
    assets: {
      clear:
        /** Execute the enclosing operation for the supplied values.
         * @returns {*} Operation result or undefined for a side effect. */
        async () => {
          clearCount++;
        },
    },
    loadGPT2:
      /** Execute the enclosing operation for the supplied values.
       * @returns {*} Operation result or undefined for a side effect. */
      () => {
        loads++;
        return new Promise(
          /** Execute the enclosing operation for the supplied values.
           * @param {*} resolve Input supplied by the enclosing API.
           * @returns {*} Operation result or undefined for a side effect. */
          (resolve) => {
            resolveLoad = resolve;
          },
        );
      },
    loadGemma:
      /** Execute the enclosing operation for the supplied values.
       * @returns {*} Operation result or undefined for a side effect. */
      async () => ({}),
    gemmaModelUrl: "local.model",
  });
  const pending = registry.get("gpt2");
  const clearing = registry.clear();
  await new Promise(
    /** Verify the behavior described by this test case.
     * @param {*} resolve Input supplied by the enclosing API.
     * @returns {*} Operation result or undefined for a side effect. */
    (resolve) => setTimeout(resolve, 0),
  );
  assert.equal(clearCount, 0);
  resolveLoad({
    encode,
  });
  await pending;
  await clearing;
  assert.equal(clearCount, 1);
  const next = registry.get("gpt2");
  assert.equal(loads, 2);
  resolveLoad({
    encode,
  });
  await next;
});
