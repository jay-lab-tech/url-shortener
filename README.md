# URL Shortener

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

Stop services while preserving data:

```powershell
docker compose down
```

Do not use `docker compose down -v` unless intentionally deleting this project's database volume.

## Environment

See [`api/.env.example`](api/.env.example). Never commit `api/.env`, credentials, or JWT secrets.

## Documentation

- [Blueprint](BLUEPRINT.md)
- `POST /api/urls` — create a short URL.
- `GET /:shortCode` — redirect and enqueue click tracking.
- `GET /health` — check PostgreSQL and Redis readiness.
