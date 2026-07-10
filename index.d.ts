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
}

/**
 * Shared fetch with request deduplication.
 *
 * Multiple callers requesting the same resource share a single network
 * request. Successful responses are cached and returned to all callers.
 *
 * If a caller aborts via AbortController, only that caller receives an
 * AbortError. The shared request continues so other callers can still
 * receive the response.
 */
export default function sharedRequest<T = unknown>(
    url: string,
    options?: SharedRequestOptions<T>
): Promise<T>;

/**
 * Returns whether a cache entry exists.
 */
export function hasCacheKey(key: string): boolean;

/**
 * Removes a single cache entry.
 */
export function clearCacheKey(key: string): void;

/**
 * Removes all cache entries.
 */
export function clearCache(): void;
