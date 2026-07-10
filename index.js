/**
 * Cache object.
 *
 * @type {Map}
 */
const cache = new Map();

/**
 * Has cache key.
 *
 * @param  {String}  key
 * @return {Boolean}
 */
const hasCacheKey = (key) => {
    return cache.has(key);
};

/**
 * Clear cache key.
 *
 * @param  {String} key
 * @return {Void}
 */
const clearCacheKey = (key) => {
    const entry = cache.get(key);
    if (!entry)
        return;

    const id = entry.ttlTimeoutId;
    if (id)
        clearTimeout(id);

    cache.delete(key);
};

/**
 * Clear cache.
 *
 * @return {Void}
 */
const clearCache = () => {
    Array.from(cache.keys()).forEach(key => clearCacheKey(key));
};

/**
 * Default parser for response.
 *
 * Request bodies are streams, which means that you cant read it twice. That's
 * why we can't just return response as result, we need a parser to read the
 * stream so we can cache it.
 *
 * @param  {Response} response
 * @return {Promise}
 */
const defaultParser = (response) => {
    const contentType = response.headers.get("Content-Type") || "";
    if (contentType.startsWith("text/") || contentType.startsWith("application/xml") || contentType.startsWith("image/svg"))
        return response.text();
    else if (contentType.startsWith("application/json"))
        return response.json();
    else if (contentType.startsWith("multipart/form-data"))
        return response.formData();
    else if (contentType.startsWith("image/"))
        return response.blob();

    return response.arrayBuffer();
};

/**
 * Shared request with request deduplication.
 *
 * Multiple callers requesting the same resource share a single network
 * request. Aborting one caller does not abort the shared request; it only
 * causes that caller's returned Promise to reject with AbortError.
 *
 * Aborting the call behaves a bit differently than with native fetch. When
 * request is aborted, the abort exception doesn't occur immediately like it
 * does with fetch. It waits for the request to finish so parsed response
 * can be cached. I might solve this in the future, but for now this is
 * acceptable "flaw"...
 *
 * @param  {String}  url
 * @param  {Object}  options
 * @return {Promise}
 */
export default function sharedRequest(url, options={}) {
    const {
        key,
        parser,
        ttl,
        signal,
        ...fetchOptions
    } = options;

    let aborted = false;
    const handleAbort = () => aborted = true;
    signal?.addEventListener("abort", handleAbort, { once: true });

    const method = (fetchOptions.method || "GET").toUpperCase();
    const cacheKey = key || `${method} ${url}`;
    let entry = cache.get(cacheKey);

    if (!entry) {
        entry = {
            promise: fetch(url, fetchOptions)
                .then((response) => {
                    if (!response.ok)
                        throw new Error(`HTTP ${response.status}`);

                    return (parser || defaultParser)(response);
                })
                .then((content) => {
                    if (ttl)
                        entry.ttlTimeoutId = setTimeout(() => clearCacheKey(cacheKey), ttl);

                    return content;
                })
                .catch((error) => {
                    clearCacheKey(cacheKey);

                    throw error;
                }),
            ttlTimeoutId: null,
        }

        cache.set(cacheKey, entry);
    }

    return entry.promise.then((content) => {
        signal?.removeEventListener("abort", handleAbort);
        if (aborted)
            throw new DOMException("Aborted", "AbortError");

        return content;
    });
};

export {
    hasCacheKey,
    clearCacheKey,
    clearCache,
};
