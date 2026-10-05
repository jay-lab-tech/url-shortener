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

Business endpoints are added in small, independently verified commits.

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
- OpenAPI contract will be added with the first public endpoint module.
