# API Reference

Local base URL: `http://localhost:3002`. Swagger UI: `/docs`; OpenAPI contract: [`docs/openapi.yaml`](docs/openapi.yaml).

## Conventions

Requests and successful payloads use JSON. Success responses wrap values in `data`; errors use `{ "error": { "code": "...", "message": "..." } }`. Bearer tokens are Auth Service HS256 access tokens with matching issuer and audience. Auth is optional for create and analytics, required to list/manage owned URLs. IDs are UUIDs.

Rate limits: creation 30/minute/IP; redirects 120/minute/IP. `429` responses include `Retry-After` and `RateLimit-*` headers. `/health` reports PostgreSQL and Redis dependencies.

## Routes

| Method and path | Access | Purpose |
|---|---|---|
| `GET /health` | Public | Dependency readiness |
| `POST /api/urls` | Optional Bearer | Create a short URL |
| `GET /api/urls?limit=50` | Bearer | List caller-owned URLs (max 100) |
| `PATCH /api/urls/:id` | Owner Bearer | Update owned URL |
| `DELETE /api/urls/:id` | Owner Bearer | Deactivate owned URL |
| `GET /api/urls/:id/stats` | Public for anonymous URL; otherwise owner or ADMIN | URL analytics |
| `GET /:shortCode` | Public | Redirect to destination |

## Create URL

`POST /api/urls` body:

```json
{"originalUrl":"https://example.com/docs","customAlias":"docs-home","title":"Docs","expiresAt":"2027-01-01T00:00:00.000Z"}
```

`originalUrl` must be valid HTTP or HTTPS. `customAlias` is optional, 3–50 characters (`A-Z`, `a-z`, digits, `_`, `-`); title max 200 characters; optional expiry must be in the future. If authenticated, the URL is owned by the JWT subject. A random seven-character Base62 shortCode is generated regardless of whether a custom alias is supplied. Success: `201 {data:{id,userId,shortCode,customAlias,originalUrl,title,expiresAt,isActive,clickCount,createdAt,updatedAt}}`. Invalid body: `400`; duplicate alias: `409`.

## Redirect

`GET /:shortCode` accepts either the generated code or custom alias. Success is `302` with `Location` pointing to the original URL and `X-Redirect-Cache: hit|miss`. Click metadata is enqueued asynchronously. Unknown identifier: `404`; expired URL: `410`; limit exceeded: `429`.

## List and manage owned URLs

- `GET /api/urls?limit=50`: limit is integer 1–100, default 50. Returns `{data:[...],meta:{count,limit}}`. Requires Bearer; no token `401`, invalid limit `400`.
- `PATCH /api/urls/:id`: accepts one or more of `originalUrl` (HTTP/HTTPS URL), `title` (string or null, max 200), `expiresAt` (future ISO date or null), `isActive` (boolean). Empty body is invalid. Success `200 {data:...}`; malformed UUID/body `400`; absent or not owned `404`.
- `DELETE /api/urls/:id`: soft-deactivates the owned URL, preserves clicks, invalidates redirect cache, returns `200 {data:...}`. Errors `400`, `401`, or `404` as applicable.

## Analytics

`GET /api/urls/:id/stats` returns `{data:{url,dailyClicks,devices,referrers}}`; referrers are limited to the top ten. Invalid UUID `400`; missing URL `404`; owned URL without token `401`; another user's URL `403`. Anonymous-created URLs have public analytics. IP addresses are not included in this response.

## Common errors

`400` validation/invalid ID; `401` authentication required or token invalid; `403` ownership failure; `404` missing URL/route; `409` alias collision; `410` expired redirect; `429` request limit; `503` health check dependency failure. See OpenAPI for machine-readable schemas.
