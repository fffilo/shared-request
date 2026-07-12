/**
 * Options for sharedRequest().
 */
export interface SharedRequestOptions<T = unknown> extends RequestInit {
    /**
     * Custom cache key.
     *
     * Defaults to "<METHOD> <URL>".
     */
    key?: string;

    /**
     * Cache lifetime in milliseconds.
     *
     * The timer starts after the response has been successfully fetched
     * and parsed.
     */
    ttl?: number;

    /**
     * Custom response parser.
     *
     * By default, the response is parsed automatically according to its
     * Content-Type header.
     */
    parser?: (response: Response) => T | Promise<T>;

    /**
     * Abort signal for this caller.
     *
     * Aborting does not cancel the shared network request.
     * Only this caller's Promise is rejected with AbortError.
     */
    signal?: AbortSignal | null;
}

/**
 * Shared request function with helper methods.
 *
 * Multiple callers requesting the same resource share a single network
 * request. Successful responses are cached and returned to all callers.
 *
 * If a caller aborts via AbortController, only that caller receives an
 * AbortError. The shared request continues so other callers can still
 * receive the response.
 */
export interface SharedRequest {
    /**
     * Performs a shared request.
     *
     * @param url Resource URL.
     * @param options Request options.
     * @returns The parsed response.
     */
    <T = unknown>(
        url: string,
        options?: SharedRequestOptions<T>
    ): Promise<T>;

    /**
     * Returns whether a cache entry exists.
     *
     * @param key Cache key.
     * @returns True when the cache contains the key.
     */
    hasCacheKey(key: string): boolean;

    /**
     * Removes a single cache entry.
     *
     * @param key Cache key.
     */
    clearCacheKey(key: string): void;

    /**
     * Removes all cache entries.
     */
    clearCache(): void;
}

/**
 * Creates an isolated shared request instance.
 *
 * Each instance maintains its own request cache and helper methods.
 */
export function createSharedRequest(): SharedRequest;

/**
 * Default shared request instance.
 *
 * Uses a module-level cache shared by every importer of the module.
 */
declare const sharedRequest: SharedRequest;

export default sharedRequest;
