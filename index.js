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
 * Creates an isolated shared request instance. Each instance maintains its
 * own request cache.
 *
 * @return {Function}
 */
const createSharedRequest = () => {
    /**
     * Cache map object.
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
     * Shared request with request deduplication.
     *
     * Multiple callers requesting the same resource share a single network
     * request. Aborting one caller does not abort the shared request; it only
     * causes that caller's returned Promise to reject with AbortError.
     *
     * @param  {String}  url
     * @param  {Object}  options
     * @return {Promise}
     */
    function sharedRequest(url, options={}) {
        const {
            key,
            parser,
            ttl,
            signal,
            ...fetchOptions
        } = options;

        const abortError = new DOMException("Aborted", "AbortError");
        if (signal?.aborted)
            return Promise.reject(abortError);

        let rejector = null;
        const handleAbort = () => rejector?.(abortError);
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

        return new Promise(
            (resolve, reject) => {
                rejector = reject;

                entry.promise.then(resolve, reject);
            })
            .finally(() => signal?.removeEventListener("abort", handleAbort));
    };

    sharedRequest.hasCacheKey = hasCacheKey;
    sharedRequest.clearCacheKey = clearCacheKey;
    sharedRequest.clearCache = clearCache;

    return sharedRequest;
}

const sharedRequest = createSharedRequest();
export default sharedRequest;
export { createSharedRequest };
