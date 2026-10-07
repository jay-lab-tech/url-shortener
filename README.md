# URL Shortener

![CI](https://github.com/jay-lab-tech/url-shortener/actions/workflows/ci.yml/badge.svg)

Performance-focused URL shortener with Redis caching, asynchronous click tracking, and analytics-ready PostgreSQL storage.

## Current status

Foundation phase:

- TypeScript + Express API scaffold.
- Prisma schema for URLs and click events.
- PostgreSQL and Redis Docker Compose stack.
- BullMQ queue/worker bootstrap.
- Dependency health endpoint.
- Auth Service JWT configuration contract.
- URL creation with generated short codes and optional custom aliases.
- Cache-first redirects with asynchronous click-event jobs.

Business endpoints are added in small, independently verified commits.

## URL API

Create a short URL anonymously or with an Auth Service Bearer token:

```http
POST /api/urls
Content-Type: application/json

{
  "originalUrl": "https://example.com/docs",
  "customAlias": "docs-home",
  "title": "Documentation",
  "expiresAt": "2027-01-01T00:00:00.000Z"
}
```

`customAlias`, `title`, and `expiresAt` are optional. Without a custom alias, the API generates a random seven-character Base62 `shortCode`. The response contains both identifiers; custom aliases are stored independently and must be unique.

Redirect using either the generated short code or the custom alias:

```http
GET /:shortCode
```

The API returns `302 Found` with a `Location` header, records `X-Redirect-Cache: hit|miss`, and sends click metadata to the BullMQ worker asynchronously. Missing URLs return `404 Not Found`; expired URLs return `410 Gone`.

Rate limits are applied per client IP: URL creation is limited to 30 requests per minute and redirects to 120 requests per minute. Limited responses return `429 Too Many Requests` with `Retry-After` and `RateLimit-*` headers.

Read analytics for a URL by its UUID:

```http
GET /api/urls/:id/stats
```

The response includes URL metadata, the current `clickCount`, daily click totals, device breakdown, and the ten most common referrers. Device type is inferred from the user agent by the worker. Analytics for anonymous URLs are public; analytics for owned URLs require the owner or an `ADMIN` access token. An invalid UUID returns `400`; an unknown URL returns `404`.

Authenticated users can list their own URLs:

```http
GET /api/urls?limit=50
Authorization: Bearer <auth-service-access-token>
```

The `limit` parameter defaults to 50 and is capped at 100. Anonymous URL creation remains supported, but anonymous URLs are not included in an authenticated user's list.

Owners can update or deactivate their URLs:

```http
PATCH /api/urls/:id
DELETE /api/urls/:id
Authorization: Bearer <auth-service-access-token>
```

`PATCH` accepts `originalUrl`, `title`, `expiresAt`, and `isActive`. `DELETE` performs a soft-delete by setting `isActive` to `false`, preserving click history. Redirect cache entries are invalidated after either operation.

## Repository layout

```text
url-shortener/
├── api/
│   ├── src/
│   │   ├── config/
│   │   ├── jobs/
│   │   ├── middlewares/
│   │   ├── utils/
│   │   ├── app.ts
│   │   ├── server.ts
│   │   └── worker.ts
│   ├── prisma/
│   ├── tests/
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── BLUEPRINT.md
├── docker-compose.yml
└── README.md
```

## Quick start

Requirements: Node.js 24 and Docker Desktop.

```powershell
Copy-Item api/.env.example api/.env
$env:JWT_ACCESS_SECRET = "local-url-shortener-development-secret-32chars-min"
docker compose up --build
```

The API listens on `http://localhost:3002`, PostgreSQL on `5435`, and Redis on `6382` so it can run alongside the other projects.

Check readiness:

```powershell
Invoke-RestMethod http://localhost:3002/health | ConvertTo-Json -Depth 5
```

Run API checks locally:

```powershell
cd api
npm install
npm run typecheck
npm run build
npm audit
```

GitHub Actions runs the same checks on every push and pull request, including PostgreSQL/Redis-backed integration tests.

With the Docker Compose stack running, execute integration tests:

```powershell
$env:JWT_ACCESS_SECRET = "local-url-shortener-development-secret-32chars-min"
npm run test:integration
```

The suite verifies validation errors, duplicate aliases, URL creation, cache-first redirects, missing and expired URLs, asynchronous click analytics, JWT ownership, update, and soft-delete flows.

Stop services while preserving data:

```powershell
docker compose down
```

Do not use `docker compose down -v` unless intentionally deleting this project's database volume.

## Environment

See [`api/.env.example`](api/.env.example). Never commit `api/.env`, credentials, or JWT secrets.

## Documentation

- [Blueprint](BLUEPRINT.md)
- [OpenAPI contract](docs/openapi.yaml)
- Interactive Swagger UI: `http://localhost:3002/docs`
- `POST /api/urls` — create a short URL.
- `GET /api/urls?limit=50` — list URLs owned by the authenticated user.
- `PATCH /api/urls/:id` — update an owned URL.
- `DELETE /api/urls/:id` — deactivate an owned URL without deleting analytics.
- `GET /:shortCode` — redirect and enqueue click tracking.
- `GET /api/urls/:id/stats` — read click analytics by URL UUID.
- `GET /health` — check PostgreSQL and Redis readiness.
