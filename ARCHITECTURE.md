# Architecture

## Components

```text
Client → Express API ───────────────→ PostgreSQL (URL + click records)
            ├─ URL management             ↑
            ├─ redirect read: Redis first │
            │                 miss → DB ──┘
            └─ enqueue click → Redis/BullMQ → click worker → PostgreSQL
```

The API and worker are separate Node processes built from the same `api/` package. PostgreSQL is the source of truth. Redis provides redirect caching and BullMQ transport; analytics click writes happen asynchronously so the redirect can return without waiting for the analytics insert. `/health` checks PostgreSQL and Redis availability.

## Request paths

- **Create/manage:** Zod validates input, optional/required Auth Service JWT middleware provides an owner ID, and Prisma persists URL records. Custom aliases and generated short codes are separately unique.
- **Redirect:** lookup checks Redis using either short code or custom alias. Cache entries include URL ID, target, and expiry; TTL is at most 24 hours and capped at the URL expiry. Cache miss reads PostgreSQL and populates Redis. Expiry is checked on both paths.
- **Click capture:** after resolving a target, API enqueues timestamp, identifier, IP, user agent, and referrer; the worker infers device type and records the click/increments aggregate count. Queue errors are logged without failing the redirect.
- **Analytics:** database aggregation returns daily clicks, device breakdown, and top referrers. Anonymous-created URLs have public analytics; owned URL analytics require owner or ADMIN JWT.

## Data model

```text
Url 1 ── * Click
Url: id (UUID), nullable userId (external Auth Service subject), shortCode,
     optional customAlias, originalUrl, title, expiresAt, isActive, clickCount,
     createdAt, updatedAt
Click: urlId, clickedAt, ipAddress, userAgent, referrer, country, deviceType
```

There is intentionally no cross-database foreign key to Auth Service users. Deleting/deactivating a URL is implemented as `isActive=false`; click history remains.

## Design trade-offs and limitations

- Cache-first redirect lowers repeated database reads but introduces Redis dependency and invalidation requirements. Update/deactivate operations invalidate both identifiers.
- Click tracking is best-effort asynchronous; queue failure is logged, and a redirect still succeeds. Analytics may lag and is not a guaranteed audit ledger.
- The click schema can store IP address and raw user-agent/referrer. Operators should set retention and privacy controls before public deployment.
- `country` is part of the click model, but no geolocation lookup is currently part of the documented request pipeline.
- The JWT secret, issuer, and audience must match Auth Service; a shared signing secret has a larger compromise blast radius.
