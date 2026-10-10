# Changelog

Notable changes follow Keep a Changelog conventions. Entries are unreleased until a version is tagged.

## [Unreleased]

### Added
- URL creation with random Base62 codes and optional custom aliases, expiration, and ownership.
- Cache-first redirects with asynchronous BullMQ click tracking and PostgreSQL analytics.
- Owner-scoped URL listing/management, analytics access controls, OpenAPI documentation, Docker Compose, and integration tests.

### Security
- HTTP/HTTPS destination validation, Auth Service JWT verification, Redis request limits, and owner-scoped updates/deactivation.
