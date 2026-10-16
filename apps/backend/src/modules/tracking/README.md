# Tracking ingestion and reporting

Both `POST /api/tracking/beacon` and `trackEvents` use the same validation and
atomic Redis admission function. Anonymous collection remains enabled. Valid
requests can drop some or all events while retaining their success response.

## Limits

`TRACKING_GLOBAL_DAILY_EVENT_LIMIT` defaults to 100000 and
`TRACKING_IP_DAILY_EVENT_LIMIT` defaults to 10000. Both must be positive integers
at most 1000000000. Each is split 80% client / 20% server redirect (rounding the
redirect share down). The global shares are distributed across 288 five-minute
UTC windows, with rounding distributed so the windows sum to the configured
daily shares. Unused allowance expires; sources cannot borrow from each other.
Default client windows permit 277–278 events, and redirect windows 69–70 events.

Admission accepts the largest prefix that fits the window, source queue, and
per-IP daily allowance. Each IP/source also has a 30-request/minute limit.
Flushing does not replenish event quotas. Each event is limited to 4 KiB after
serialization, and queues hold at most 8000 client / 2000 redirect events.
The approximately 40 MiB payload bound excludes Redis allocation overhead and
the old queue retained temporarily for deployment compatibility.

These controls bound accepted writes, not incoming HTTP traffic or CPU used to
reject requests. Sustained distributed abuse can consume each new allowance;
shared campus IPs can also exhaust an IP allowance. The related IP-header trust
fix is still required. Neither fresh cookies nor client claims establish human
engagement.

## Timing and provenance

Reporting timestamps come from backend receipt time. Redis TIME determines
quota windows. Client timestamps are parsed when possible and retained only for
diagnostics; invalid, stale, or future client clocks do not reject events.

Only successful server redirect call sites assign `server-redirect` provenance.
Public input cannot assign provenance or identity. All outreach click query
shapes exclude client and historical events with unknown provenance. Other
engagement events and legacy outreach aggregate counters remain unverified.
Redirect observations can include bots and repeated clicks, and collection can
be incomplete because of quotas, outages, and queue limits.

## Redis failures and monitoring

The global quota hash has a fixed number of fields and no TTL, protecting it
from the deployed `volatile-lru` eviction policy. Source queues also have no TTL.
Per-IP counters expire at UTC midnight and request counters at minute boundaries.
Expiring counters can be evicted under memory pressure, weakening per-IP limits;
the global hash continues to bound a window during ordinary eviction.

Production Redis has no persistence. Restart/data loss resets quota allowances
and can lose queued events. Infrastructure is intentionally unchanged: limits
are best-effort across those failures. An initial deployment and a data-loss
reset both increment `tracking.quota.initialized`; correlate it with Redis
restart telemetry rather than treating every initialization as an incident.

Observe `tracking.events` by source/outcome/reason, `tracking.queue.depth`,
`tracking.flush.failures`, and `tracking.client_clock`. Investigate sustained
global/IP/queue drops, queue growth, or flush failures. Failure warnings are
limited to one per reason per minute. Metric labels contain no user/IP/target IDs.

## Rollout

Deploy the backend to every replica before the frontend redirect change. During
the rolling backend deployment, older replicas still use the previous reporting
rules; do not interpret mixed-version results as a complete verified series.
New workers drain the legacy queue but preserve unknown provenance. Quota state
uses new keys, avoiding old throttle/queue collisions.

Record the date/time when the backend rollout completes as the start of
server-observed reporting. Do not backfill historical trust. The staff chart
explains the changed coverage. Validate collection/drop rates after rollout and
tune the configured limits for observed campus traffic.

Malformed buffered records are discarded before Mongo insertion. Broader flush
lock renewal, crash recovery, and partial-insert duplication remain BER-35 work;
that existing risk can still duplicate accepted records on retries. The ingest
ceiling is a limit on newly accepted events, not an exactly-once write guarantee.

## Tests

Unit and local HTTP tests run without the app, MongoDB, or Docker:

```powershell
npm.cmd run generate --workspace=backend
npm.cmd run test --workspace=backend
```

Opt in to the Lua integration suite using a disposable standalone Redis:

```powershell
$env:TRACKING_TEST_REDIS_URL = 'redis://127.0.0.1:6379/15'
npm.cmd run test --workspace=backend
```

Integration tests use uniquely namespaced keys, replace only the clock for
deterministic rollover tests, and clean up their keys. They do not run FLUSHDB or
change server configuration. Do not point tests at production. A missing test
Redis URL skips this suite explicitly. Full `tests/api/tracking.spec.ts` requires
the application stack; its response-only assertions do not prove persistence.
