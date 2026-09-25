---
name: add-analytic
description: Guides adding a new user-behavior analytic to Berkeleytime — where the tracking data lives, whether a requested analytic is actually feasible given what's captured, how to instrument a new event, and how to add a card for it on the staff Analytics page's Engagement tab. Use when a pod wants to track a new interaction, answer a product question with tracking data, or add a panel to the staff dashboard.
---

# Adding an analytic to Berkeleytime

Berkeleytime has one first-party event-tracking pipeline. This skill tells you
where its data lives, how to tell whether what you want is actually
answerable, and the exact steps for the two things people usually mean by
"add an analytic": **instrumenting a new event** and **showing it on the staff
dashboard**.

Read "Is this feasible?" before writing any code — it's the part most likely
to save you from instrumenting something that already exists, or building a
query the data can't answer.

## Where the data lives

```
trackEvent(...) in a React component
  -> TrackingProvider (apps/frontend/src/providers/TrackingProvider.tsx)
     batches client-side: flush at 50 events OR 30s OR page unload (sendBeacon)
  -> trackEvents GraphQL mutation (no auth required)
  -> apps/backend/src/modules/tracking/controller.ts
     sanitizes + rate-limits (30 calls/IP/min), pushes to Redis list
     "tracking-events-buffer"
  -> background job flushes Redis -> Mongo every 5 minutes
  -> `trackingevents` collection (packages/common/src/models/tracking-event.ts)
  -> trackingEventsTimeSeries GraphQL query (staff-only, @auth)
  -> staff-frontend: Analytics page -> Engagement tab
```

**The `trackingevents` document shape** (every event has all of these; the
client only supplies the first four):

| Field | Set by | Notes |
|---|---|---|
| `eventType` | client | free string, e.g. `"click"`, `"page_error"` |
| `targetType` | client | free string naming what was acted on |
| `targetId` | client | optional, identifier of the target |
| `metadata` | client | optional JSON — **capped**, see limits below |
| `timestamp` | client | set automatically by `TrackingProvider` |
| `sessionId` | server | always present |
| `userId` | server | only if signed in — **this is what makes retention/cohort questions answerable, and only for surfaces that require sign-in** |
| `ipHash`, `userAgent`, `referrer` | server | |

Indexed for: `{eventType, targetType, timestamp}`, `{targetId, timestamp}`,
`{sessionId, timestamp}`, `{userId, timestamp}` (sparse).

**Metadata limits** (enforced server-side in `tracking/controller.ts` —
violations are silently dropped, not errors, so check this before assuming
your metadata arrived):
- Max 2 levels of nested objects (deeper nesting collapses to `{}`)
- Max 20 keys
- String values truncated to 256 chars
- Whole `metadata` object dropped if it serializes over 1KB **after**
  sanitization
- `eventType`/`targetType`/`targetId` are each sanitized to `[\w\-.:/]` and
  truncated to 128 chars

**`eventType`/`targetType` are plain strings, not enums.** Nothing enforces a
taxonomy. Two naming conventions already coexist (see below) — pick whichever
is closer to precedent for the surface you're touching, and be internally
consistent within it. Don't invent a third if you can help it.

## What's already tracked

"Dashboard card" is the exported block in
`apps/staff-frontend/src/app/Analytics/components/EngagementAnalytics.tsx`
(Engagement tab) unless noted. **"none" means data is being collected but
nobody can see it yet** — that's a one-block addition (Path B).

| eventType | targetType | targetId | Instrumented in | Dashboard card |
|---|---|---|---|---|
| `schedule_saved` | `schedule` | schedule id | `hooks/api/schedules/useCreateSchedule.ts` | `SchedulesSavedBlock` |
| `schedule_generate` | `schedule` | schedule id | `app/Schedule/Editor/GenerateSchedulesDialog` | `SchedulesGeneratedBlock` |
| `course_result_clicked` | `class` | `subject-courseNumber` | `ClassBrowser/List/index.tsx` | `CourseResultsClickedBlock` |
| `search_filter_applied` | `catalog_filter` | filter name (`sort`, `level`, `units`, ...) | `ClassBrowser/Filters/index.tsx` | `SearchFiltersAppliedBlock` |
| `page_error` | `course-discovery` | — | `components/CatalogErrorBoundary` | `PageErrorsBlock` |
| `data_load_failed` | `course-discovery` | — | `app/Catalog/index.tsx` | `DataLoadFailuresBlock` |
| `search_failed` | `course-discovery` | — | `ClassBrowser/hooks/useCatalogQuery.ts`, `components/CourseSearch/index.tsx` | `SearchFailuresBlock` |
| `click` / `view` / `dismiss` | `banner`, `redirect`, `targeted-message`, `nav-item` | entity id | `Banner`, `RootWrapper` (redirects) | `OutreachAnalytics.tsx` (Analytics -> Outreach tab, target-type picker) |
| `click` | `apply-button` | position | `app/Apply/index.tsx` | none |
| `view` | `class` | course id | `components/Class/index.tsx` | none |
| `search` / `search_click` | `course` | — / result id | `components/CourseSearch/index.tsx` | none |

Two naming conventions are visible: `course-discovery` / `catalog_filter`
name the *surface*; everything else names the *entity being acted on*
(`banner`, `class`, `schedule`). Both are legitimate; know which yours is
closer to. Note `targeted-message` and `nav-item` are selectable in the
Outreach panel but nothing currently emits events for them — those options
show empty data.

**Known trap:** `components/Class/index.tsx` has a local variable literally
named `trackView` that is *not* the tracking system — it's
`const [trackView] = useMutation(TRACK_CLASS_VIEW)`, a legacy per-feature
view counter fired alongside the real `useTracking().trackView` (aliased there
as `trackUnifiedView`). Don't copy that file's naming.

**Two other collections already hold analytics-relevant data with zero
tracking instrumentation involved** — check these before assuming you need a
new event:
- `schedules` (`packages/common/src/models/schedule.ts`) — every saved
  schedule, with `createdBy` (userId), `year`, `semester`, and embedded
  `classes: [{subject, courseNumber, ...}]`. Answers "how many students have
  course X in their schedule this semester" and "did this user's schedule
  usage return semester over semester" — **today, with full history**, no
  new instrumentation. (Nothing aggregates it by course yet; that would be a
  new backend query.)
- `enrollmentHistories` — official SIS enrollment snapshots per section, back
  to 2013 (daily resolution pre-2025, ~15min for the current term). Answers
  "how fast did this class fill up."

## Is this feasible?

Work through these before writing code:

1. **Does it need identity (`userId`)?** Only present when the user is signed
   in. Scheduler and GradTrak require sign-in, so `userId`-based questions
   (retention, per-user cohorts) work there. Catalog/search do not — you only
   get `sessionId`, not a stable identity across visits.
2. **Does it need history from before today?** New `trackEvent` calls only
   accumulate from the moment they ship — there is no backfill. If the
   question is retrospective, check `schedules` / `enrollmentHistories`
   (above) first instead of waiting weeks for enough events.
3. **Does the metadata fit the limits?** More than ~20 shallow fields, or
   anything resembling a stack trace/full object dump, is silently dropped,
   not truncated-and-kept. Summarize before sending.
4. **Is it a count-by-day for one `eventType` + `targetType`?** Then it's
   already answerable via `trackingEventsTimeSeries` with zero backend work
   (Path B). A breakdown by `targetId` (top-N), a `userId` cohort, or any new
   Mongo aggregation shape needs a new backend resolver (Path B, hard case).

## Path A: instrument a new event

1. Pick `eventType` and `targetType` (see conventions above — reuse an
   existing `targetType` if your surface already has one).
2. In the component: `const { trackEvent } = useTracking();` (import from
   `@/hooks/api/tracking/useTracking` — the full path; there's no barrel
   `index.ts` in that folder), then call it where the interaction happens:
   ```tsx
   trackEvent("schedule_saved", "schedule", schedule._id, {
     source: "class-page",
   });
   ```
   Use a named helper when one fits: `trackClick`/`trackView`/`trackDismiss
   (targetType, targetId?, metadata?)`, or `trackSearch`/`trackSearchClick`.
   `trackEvent` is the general escape hatch for everything else.
3. Guard against re-firing on every render for the same condition (e.g. an
   `error` object that stays truthy) with a ref comparison — see
   `useCatalogQuery.ts`'s `trackedSearchErrorRef`.
4. No backend, schema, or GraphQL changes needed — the mutation, buffer, and
   Mongo collection are fully generic.
5. **Verify it actually landed** before building on top of it (see
   Verification).

## Path B: show it on the staff dashboard

**Easy case — a count-by-day for one `eventType` + `targetType`:** this is
exactly what `trackingEventsTimeSeries` returns, and the Engagement tab is
built for it. Adding a card is three small edits, no backend work:

1. **`apps/staff-frontend/src/app/Analytics/components/EngagementAnalytics.tsx`**
   — add an exported block wrapping the shared `EventCard`:
   ```tsx
   export function YourEventBlock() {
     return (
       <EventCard
         title="Your event"
         description="One line on what a count of this means"
         eventType="your_event_type"
         targetType="your-target-type"
         valueLabel="occurrences"
       />
     );
   }
   ```
   `targetType` is required — the staff hook skips the query unless
   `targetType` or `targetId` is set, and the resolver match is exact-string.
2. **`apps/staff-frontend/src/app/Analytics/index.tsx`** — import
   `YourEventBlock` alongside the other Engagement imports.
3. In the same file, inside the `{showEngagement && (<>...</>)}` fragment, add:
   ```tsx
   <div className={styles.cell}>
     <YourEventBlock />
   </div>
   ```

That's the whole path. Don't add a new route or nav link — the Engagement
page used to be standalone (`app/Engagement/`, `/engagement`) but was folded
into the Analytics page as a tab to match the Scheduler/Ratings/GradTrak/
Bookmarks/Outreach tabs. Follow that tab pattern for anything new; if you
need a whole new group of cards rather than one, add a new exported block
file under `Analytics/components/` and a new `Tab` value in
`Analytics/index.tsx`, mirroring how `"engagement"` was added.

**Hard case — anything `trackingEventsTimeSeries` can't express** (top-N by
`targetId`, `userId` cohorts/retention, joining another collection): add a
backend aggregation following
`apps/backend/src/modules/analytics/controllers/schedule.ts`'s
`getSchedulerAnalyticsData` — every function there starts with
`await requireStaffAuth(context)`. Wire it the same three places: a new type
+ `extend type Query` field in `packages/gql-typedefs/` (the type goes in the
domain file, e.g. `schedule.ts`; the Query field goes in `analytics.ts`), a
resolver entry in `apps/backend/src/modules/analytics/resolver.ts`, then run
`npx turbo run generate` (repo root) before importing generated types. On the
frontend, add a gql document in `apps/staff-frontend/src/lib/api/analytics.ts`
and a hook under `hooks/api/analytics/` (staff-frontend hand-writes these, no
codegen), following `useSchedulerAnalyticsData.ts`.

## Verification

Confirm the event actually reaches Mongo with the shape you expect — don't
trust that it compiled. With the local stack up (`docker compose up -d`):

```bash
# Redis buffer (events land here first, flushed to Mongo every 5 min)
docker compose exec redis redis-cli -a "$(grep '^REDIS_PASSWORD=' .env | cut -d= -f2-)" \
  --no-auth-warning LRANGE tracking-events-buffer 0 -1

# Mongo directly (after a flush)
docker exec berkeleytime-mongodb-1 mongosh \
  "mongodb://bt_dev:$(grep '^MONGODB_ROOT_PASSWORD=' .env | cut -d= -f2-)@localhost:27017/bt?authSource=admin&replicaSet=rs0" \
  --quiet --eval 'db.trackingevents.find({ eventType: "YOUR_EVENT_TYPE" }).sort({timestamp:-1}).limit(5).forEach(printjson)'
```

To flush fast instead of waiting the 30s client batch window, reload the page
(triggers `pagehide` -> `sendBeacon` immediately).

To test an error-path event (`*_failed` / `*_error`), the reliable way to
induce a real failure locally is `docker compose stop backend`, do the
action, then `docker compose start backend` within a few seconds — failed
tracking mutations are **not retried** (`TrackingProvider.tsx`'s `flush()`
swallows the error), so the backend needs to be back before the 30s flush
fires or the queued event is lost.

To view the dashboard: `docker compose --profile staff up -d`, then open
`http://localhost:3002`. Access requires a `staff-members` record for your
user, not just being signed in.

## Gotchas

- `trackingEventsTimeSeries`'s `targetType` match is exact-string — no
  partial/prefix matching.
- `packages/gql-typedefs/tracking.ts`'s doc comment listing example
  `targetType`s is stale (predates `course-discovery`/`catalog_filter`); this
  file's inventory table is the more current list.
- If port 3000 is already taken on your machine, the local app 404s or
  Playwright's pre-push hook fails with "already used" — see the repo's
  `playwright.config.ts` (`REUSE_EXISTING_TEST_SERVER=true` reuses a running
  stack) or free the port.
