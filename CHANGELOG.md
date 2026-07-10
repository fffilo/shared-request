# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog,
and this project adheres to Semantic Versioning.

## [0.1.0] - 2026-07-10

### Added

- Initial release.
- Request deduplication.
- Automatic response parsing based on `Content-Type`.
- Custom response parser support.
- Custom cache keys.
- Cache TTL.
- Cache management helpers (`hasCacheKey()`, `clearCacheKey()`, `clearCache()`).
- Independent cancellation for every caller using `AbortSignal`.
