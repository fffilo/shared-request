# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/2.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-07-13
### Added
- Tests.
- TypeScript declarations.
- Support for isolated cache instances via `createSharedRequest()`.

### Changed
- Aborted callers now receive `AbortError` immediately, while the shared request continues in the background.

## [0.1.0] - 2026-07-10
### Added
- Initial release.
- Request deduplication.
- Automatic response parsing based on `Content-Type`.
- Custom response parser support.
- Custom cache keys.
- Cache TTL.
- Independent cancellation for every caller using `AbortSignal`.
- Cache management helpers (`hasCacheKey()`, `clearCacheKey()`, `clearCache()`).
