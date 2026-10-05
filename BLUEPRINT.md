# URL Shortener — Blueprint

URL shortener dengan analytics, Redis caching, dan asynchronous click tracking.

## Scope

- Short code random Base62 dan custom alias.
- Optional expiration dan soft delete.
- Redis cache-first redirect.
- Click tracking asynchronous melalui BullMQ.
- PostgreSQL untuk URL dan click events.
- Analytics dashboard disiapkan sebagai tahap frontend berikutnya.

## Architecture

```text
Client → Express API → PostgreSQL
                  ↘ Redis cache / BullMQ
                         ↓
                    Click worker
                         ↓
                    PostgreSQL
```

API memisahkan write path URL management dari read path redirect. Redirect membaca Redis terlebih dahulu, mengantrikan click event secara non-blocking, lalu mengembalikan HTTP 302.

## Planned modules

1. Backend foundation, schema, healthcheck, and Docker.
2. URL management and Base62 short-code generation.
3. Cache-first redirect.
4. BullMQ click worker and analytics aggregation.
5. Next.js dashboard.
6. Integration tests, benchmark, and deployment.

## Identity

User identity akan dikonsumsi dari Auth Service melalui JWT. Database URL shortener tidak menggandakan tabel user; `userId` disimpan sebagai UUID reference tanpa foreign key lintas database.
