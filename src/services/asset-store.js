import { messages, format } from "../content/de.js";

/** Create a local asset loader with an optional persistent model cache.
 * @param {object} config IndexedDB implementation and fetch function.
 * @returns {{bytes: Function, clear: Function}} Local asset/cache API. */
export function createAssetStore({ indexedDB, fetchAsset }) {
  const databaseName = "ki-text-analyzer-assets";
  const storeName = "assets";
  /** Open the asset database, retaining the existing v1 store.
   * @returns {Promise<IDBDatabase|null>} Database or null without IndexedDB. */
  function open() {
    if (!indexedDB) {
      return Promise.resolve(null);
    }
    return new Promise(
      /** Create the asset store when the database is first initialized.
       * @param {*} resolve Value supplied by the enclosing operation.
       * @param {*} reject Value supplied by the enclosing operation.
       * @returns {*} Result of this operation. */
      (resolve, reject) => {
        const request = indexedDB.open(databaseName, 1);
        request.onupgradeneeded =
          /** Create the asset store when the database is first initialized.
           * @returns {*} Result of this operation. */
          () => {
            if (!request.result.objectStoreNames.contains(storeName)) {
              request.result.createObjectStore(storeName);
            }
          };
        request.onsuccess =
          /** Complete the IndexedDB open request with its connection.
           * @returns {*} Result of this operation. */
          () => {
            return resolve(request.result);
          };
        request.onerror =
          /** Propagate a failed IndexedDB request to its caller.
           * @returns {*} Result of this operation. */
          () => {
            return reject(request.error);
          };
        request.onblocked =
          /** Report a database blocked by another connection.
           * @returns {*} Result of this operation. */
          () => {
            return reject(new Error("Asset database is blocked."));
          };
      },
    );
  }
  /** Execute a cache transaction and close its database on completion.
   * @param {string} mode Readonly or readwrite.
   * @param {Function} operation Operation applied to the object store.
   * @returns {Promise<*>} Request result after transaction completion. */
  async function transact(mode, operation) {
    const database = await open();
    if (!database) {
      return null;
    }
    try {
      return await new Promise(
        /** Complete the IndexedDB open request with its connection.
         * @param {*} resolve Value supplied by the enclosing operation.
         * @param {*} reject Value supplied by the enclosing operation.
         * @returns {*} Result of this operation. */
        (resolve, reject) => {
          const transaction = database.transaction(storeName, mode);
          const request = operation(transaction.objectStore(storeName));
          transaction.oncomplete =
            /** Complete the IndexedDB open request with its connection.
             * @returns {*} Result of this operation. */
            () => {
              return resolve(request.result);
            };
          transaction.onerror =
            /** Propagate an unsuccessful asset-cache transaction.
             * @returns {*} Result of this operation. */
            () => {
              return reject(transaction.error);
            };
          transaction.onabort =
            /** Adapt the supplied value for this module’s enclosing operation.
             * @returns {*} Result of this operation. */
            () => {
              return reject(
                transaction.error || new Error("Asset transaction aborted."),
              );
            };
        },
      );
    } finally {
      database.close();
    }
  }
  /** Load a versioned binary asset from cache or the static site.
   * @param {string} key Versioned cache key.
   * @param {string} url Same-origin model URL.
   * @returns {Promise<{bytes: Uint8Array, cached: boolean}>} Binary asset and origin. */
  async function bytes(key, url) {
    try {
      const cached = await transact(
        "readonly",
        /** Read a versioned local asset from IndexedDB.
         * @param {*} store Value supplied by the enclosing operation.
         * @returns {*} Result of this operation. */
        (store) => {
          return store.get(key);
        },
      );
      if (cached instanceof Uint8Array && cached.byteLength > 0) {
        return {
          bytes: cached,
          cached: true,
        };
      }
      if (cached instanceof ArrayBuffer && cached.byteLength > 0) {
        return {
          bytes: new Uint8Array(cached),
          cached: true,
        };
      }
    } catch {
      /* A disabled cache must not prevent local model loading. */
    }
    const response = await fetchAsset(url);
    if (!response.ok) {
      throw new Error(format(messages.assetError, response.status));
    }
    const value = new Uint8Array(await response.arrayBuffer());
    if (!value.byteLength) {
      throw new Error(messages.invalidModel);
    }
    try {
      await transact(
        "readwrite",
        /** Persist successfully loaded local model bytes in IndexedDB.
         * @param {*} store Value supplied by the enclosing operation.
         * @returns {*} Result of this operation. */
        (store) => {
          return store.put(value, key);
        },
      );
    } catch {
      /* Return the loaded asset even if persistence is unavailable. */
    }
    return {
      bytes: value,
      cached: false,
    };
  }
  /** Clear the persistent model cache after a completed transaction.
   * @returns {Promise<void>} Resolves after clearing; propagates storage errors. */
  async function clear() {
    await transact(
      "readwrite",
      /** Remove all persisted tokenizer assets from this object store.
       * @param {*} store Value supplied by the enclosing operation.
       * @returns {*} Result of this operation. */
      (store) => {
        return store.clear();
      },
    );
  }
  return {
    bytes,
    clear,
  };
}
