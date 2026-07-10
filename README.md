# shared-request

[![npm version](https://img.shields.io/npm/v/shared-request.svg)](https://www.npmjs.com/package/shared-request)
[![npm downloads](https://img.shields.io/npm/dm/shared-request.svg)](https://www.npmjs.com/package/shared-request)
[![bundle size](https://img.shields.io/bundlephobia/minzip/shared-request.svg)](https://bundlephobia.com/package/shared-request)
[![License](https://img.shields.io/github/license/fffilo/shared-request.svg)](https://github.com/fffilo/shared-request/blob/master/LICENSE)

A tiny utility for deduplicating identical `fetch()` requests while caching the parsed response.

---

## Why?

Native `fetch()` does not deduplicate identical requests. If multiple components request the same resource, each caller creates a separate network request.

`shared-request` keeps one shared request and lets every caller consume the same parsed result.

If multiple callers request the same resource at the same time, only one network request is made. Every caller receives the same result.

```text
Caller A ─────┐
              │
Caller B ─────┼────► shared request ───► network
              │
Caller C ─────┘
```

Unlike native `fetch()`, aborting one caller does **not** abort the shared request. Instead, only that caller's returned `Promise` rejects with `AbortError`.

## Features

- 🚀 Deduplicates concurrent requests
- 💾 Caches successful responses
- ⏱ Optional cache expiration (TTL)
- 🧩 Custom cache keys
- 📦 Automatic response parsing
- 🛑 Independent cancellation for every caller
- 🔄 Failed requests are automatically removed from cache

## Requirements

Requires an environment with:
- `fetch`
- `AbortController`
- ES modules support

---

## Installation

```bash
npm install shared-request
```

## Basic usage

```js
import sharedRequest from "shared-request";

const data = await sharedRequest("/api/users");
```

The first request performs the network call.

Subsequent requests for the same URL return the cached result.

---

## Request deduplication

```js
const a = sharedRequest("/api/users");
const b = sharedRequest("/api/users");

console.log(a === b); // false

const [users1, users2] = await Promise.all([a, b]);
```

Only **one** HTTP request is sent.

---

## Cancellation

```js
const controller = new AbortController();

sharedRequest("/api/users", {
    signal: controller.signal,
});

controller.abort();
```

Aborting one caller **does not** cancel the shared request.

Instead, only that caller receives an `AbortError`.

Other callers waiting for the same resource continue normally.

---

## Cache TTL

```js
await sharedRequest("/api/users", {
    ttl: 60000,
});
```

The cached response is automatically removed after one minute.

The TTL starts after the response has been successfully fetched and parsed.

---

## Custom cache key

By default, the cache key is:

```
<METHOD> <URL>
```

For example:

```
GET /api/users
```

You can override it:

```js
sharedRequest("/api/users", {
    key: "users",
});
```

---

## Custom parser

By default, responses are parsed according to their `Content-Type`.

| Content-Type | Parser |
|---------------|---------|
| `application/json` | `response.json()` |
| `text/*` | `response.text()` |
| `application/xml` | `response.text()` |
| `image/svg+xml` | `response.text()` |
| `multipart/form-data` | `response.formData()` |
| `image/*` | `response.blob()` |
| everything else | `response.arrayBuffer()` |

You can provide your own parser:

```js
sharedRequest(url, {
    parser: response => response.blob(),
});
```

---

## API

### sharedRequest(url, options)

Returns a `Promise` containing the parsed response.

### Options

| Option | Description |
|---------|-------------|
| `signal` | Abort signal for the current caller. |
| `ttl` | Cache lifetime in milliseconds. |
| `key` | Custom cache key. |
| `parser` | Custom response parser. |
| Any other option | Passed directly to `fetch()`. |

---

## Cache helpers

### hasCacheKey(key)

```js
import { hasCacheKey, clearCacheKey, clearCache } from "shared-request";

if (hasCacheKey("users")) {
    ...
}
```

Returns whether the cache contains the specified key.

---

### clearCacheKey(key)

```js
clearCacheKey("users");
```

Removes a single cache entry.

---

### clearCache()

```js
clearCache();
```

Removes all cached entries.

---

## Notes

### Why cache the parsed response?

`Response` bodies are streams and can only be consumed once.

Instead of caching the `Response`, this library caches the parsed result (`text`, `json`, `blob`, etc.), allowing it to be safely reused by every caller.

---

### Abort behavior

The abort behavior intentionally differs slightly from native `fetch()`.

Native `fetch()` rejects immediately when aborted.

`shared-request` keeps the shared request alive so the response can still be cached for other callers. The caller that aborted will receive an `AbortError` after the shared request completes.

This trade-off keeps the implementation simple while still providing the expected behavior for components: an aborted caller never receives the response.

---

## License

MIT
