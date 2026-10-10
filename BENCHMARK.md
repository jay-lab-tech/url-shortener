# Redirect Benchmark

## Status

No controlled cache-vs-database benchmark has been run for this repository yet. Therefore this document intentionally contains no latency, throughput, or percentage-improvement claims. The cache-first design is an architectural choice, not a measured performance result.

## Reproducible comparison

Run against the same machine, Docker engine, PostgreSQL/Redis versions, dataset, and URL target. Keep the app and dependencies warm; test one client region; record CPU, memory, Node version, container limits, and whether Docker Desktop/WSL is used.

1. Start the stack with `docker compose up --build -d` and verify `GET http://localhost:3002/health`.
2. Create a test URL and capture its identifier. Make one redirect request to warm Redis.
3. Measure repeated redirects for a cache-hit run. Capture `X-Redirect-Cache`, status, latency percentiles (p50/p95/p99), throughput, and error rate.
4. For a cache-miss run, clear only that URL's Redis key between requests (or use unique test URLs); do not flush shared Redis. Ensure database/cache contents are otherwise equivalent.
5. Run both at low concurrency and a declared fixed concurrency, repeat at least three times, and report median run results. Avoid production data and do not run destructive cache/database commands on shared environments.

Example request for a single sample (not a benchmark tool):

```powershell
Measure-Command { Invoke-WebRequest -Uri http://localhost:3002/<shortCode> -MaximumRedirection 0 -ErrorAction SilentlyContinue }
```

For meaningful load testing, use a dedicated tool (for example `autocannon`) with pinned version and documented command/configuration; benchmark redirect responses without following redirects, or measure destination-following separately.

## Results template

| Path | Requests | Concurrency | p50 | p95 | p99 | req/s | Errors | Runs |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Redis cache hit | Not measured | — | — | — | — | — | — | — |
| PostgreSQL cache miss | Not measured | — | — | — | — | — | — | — |

Do not publish a cache speedup conclusion until the table is populated from repeatable measurements on a stated environment.
