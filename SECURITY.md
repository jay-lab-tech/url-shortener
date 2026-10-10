# Security Policy

## Reporting

Do not publish exploit details in a public issue. Use GitHub private vulnerability reporting if enabled, or contact the maintainer privately through GitHub. Include the affected commit, impact, and reproducible steps; never include real user data or secrets.

## Safeguards in the current implementation

- Zod strict validation restricts destinations to HTTP/HTTPS and validates aliases, expiry and update fields.
- Auth Service access tokens are verified using HS256, issuer, and audience. Owner list/update/delete operations scope queries by token subject; analytics checks owner/admin.
- Redis-backed per-IP limits protect creation and redirect routes.
- Helmet, CORS middleware, bounded JSON body, centralized errors, parameterized Prisma queries, and unique database constraints.
- URL deactivation preserves history; cache keys for both short code and alias are invalidated after owner updates.

## Deployment considerations and known limits

Use HTTPS, strong unique shared JWT secrets, private PostgreSQL/Redis networking, least-privilege credentials, patched dependencies, backups, and monitoring. Set `TRUST_PROXY` only for a trusted proxy chain; otherwise IP-based limits may be inaccurate. Keep `.env` and production connection strings out of Git.

The shared Auth Service signing secret means compromise permits forged identities across consumers. Anonymous URL creation and public analytics for anonymous links are intentional behaviors but can be abused; operators should monitor and tune limits. Click capture is best-effort: queue failures do not fail redirects. Click metadata includes IP, user-agent, and referrer and needs retention/privacy controls. No geolocation enrichment or privacy/anonymization pipeline is currently documented. Only current repository state is maintained; no prior release support window is promised.
