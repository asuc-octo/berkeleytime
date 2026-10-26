---
name: add-analytic
description: Add a metric to Berkeleytime end to end - decide if the question is answerable, instrument a tracking event, add a card to the staff dashboard, and verify it locally. Use when someone says "track X", "add a metric/analytic for Y", "how many users do Z", or "add a card to the staff Analytics/Engagement tab".
---

# Add a metric to Berkeleytime

Goal: get from "I want to know X" to a working number on the staff dashboard
with the fewest steps. Follow the steps in order. If this skill was invoked
with a description of the metric, start at Step 1 using it; otherwise ask the
user one question first: **"What do you want to measure, and on which page or
feature?"**

Instructions for Claude: do the edits yourself rather than just describing
them, show the user the diff, and do not commit or push unless asked.

## Step 1 - Is it answerable? (pick a verdict)

| If the question is... | Verdict | Do |
|---|---|---|
| About schedules, GradTrak plans, or class enrollment history | **Already in the DB** | Skip instrumentation. Jump to "Backend query" (Step 4b). |
| A count of one interaction per day (clicks, errors, opens, saves) | **New event + dashboard card** | Steps 2, 3, 4a, 5. The easy path. |
| Needs "per user", "returning users", or "by semester" | **Only if sign-in is required** | Event is tracked with `userId` only for signed-in users. Scheduler/GradTrak require sign-in; Catalog/Grades/search do not (you only get `sessionId`). If the feature is anonymous, say so and offer session-level counts instead. |
| Needs history from before today | **Not available** | New events only count from the day they ship. Check Step 4b's existing collections for a retroactive answer. |
| Needs a breakdown (top-N classes, funnel, cohort) | **New event + backend query** | Steps 2, 3, 4b, 5. |
| Needs lots of detail per event (full text, big objects) | **Trim it** | `metadata` is capped (see Limits); summarize before sending. |

Tell the user the verdict in one sentence before writing code.

Existing collections that answer retrospective questions with **no new
tracking**: `schedules` (`createdBy`, `year`, `semester`, embedded `classes`),
`plans` (GradTrak, `userEmail`, `planTerms`), `enrollmentHistories` (section
fill-up snapshots back to 2013).

## Step 2 - Name it

Reuse before inventing: check the inventory table below first. If an event
already measures it, go straight to Step 4a.

Defaults for anything new (match neighbors if a surface already has a style):

| Field | Rule | Example |
|---|---|---|
| `eventType` | `snake_case`, what happened | `schedule_saved`, `search_failed` |
| `targetType` | `kebab-case`, the surface or thing acted on; **required** - the dashboard query is skipped without it | `course-discovery`, `schedule` |
| `targetId` | stable id of the thing, or omit. Never PII or typed text | class id, filter name |
| `metadata` | a few primitive keys giving context | `{ source: "class-page" }` |

Do not put emails, names, or user-typed text in any field.

## Step 3 - Instrument it

First, **find the code users actually reach.** Check the route in
`apps/frontend/src/App.tsx` and follow it to the component. A feature can have
two implementations live at once (e.g. Grades: the legacy page serves `/grades`,
the redesigned page serves `/grades-new`), and instrumenting the wrong one
records nothing. If both are reachable, instrument both.

Then, in the component or hook where the interaction happens:

```tsx
import { useTracking } from "@/hooks/api/tracking/useTracking"; // full path - no index.ts here

const { trackEvent } = useTracking();

trackEvent("your_event_type", "your-target-type", optionalTargetId, {
  source: "where-it-fired",
});
```

- Named helpers exist when they fit: `trackClick`, `trackView`, `trackDismiss`
  `(targetType, targetId?, metadata?)`, `trackSearch`, `trackSearchClick`.
  `trackEvent` covers everything else.
- Fires from an effect (errors, loads)? Guard so it fires once per condition,
  not every render - see `trackedSearchErrorRef` in
  `apps/frontend/src/components/ClassBrowser/hooks/useCatalogQuery.ts`.
- Count the action once, at the single choke point (e.g. the mutation hook),
  not in every caller. See `useCreateSchedule.ts`.
- That is the whole backend: no schema, GraphQL, or migration changes. The
  `trackEvents` mutation and `trackingevents` collection are generic.
- Pitfall: `components/Class/index.tsx` has a local variable named `trackView`
  that is a legacy counter mutation, not the tracking system. Don't copy it.

## Step 4a - Dashboard card (the easy case)

Three edits, no backend. In `apps/staff-frontend/src/app/Analytics/`:

1. `components/EngagementAnalytics.tsx` - append:
   ```tsx
   export function YourMetricBlock() {
     return (
       <EventCard
         title="Your metric"
         description="One line on what a count of this means"
         eventType="your_event_type"
         targetType="your-target-type"
         valueLabel="occurrences"
       />
     );
   }
   ```
2. `index.tsx` - add `YourMetricBlock` to the existing import from
   `./components/EngagementAnalytics`.
3. `index.tsx` - inside the `{showEngagement && (<>...</>)}` fragment, add:
   ```tsx
   <div className={styles.cell}>
     <YourMetricBlock />
   </div>
   ```

Don't create a new route or nav link; the Engagement page was folded into the
Analytics page as a tab. Many cards? Add a new file under
`Analytics/components/` and a new `Tab` value, mirroring `"engagement"`.

## Step 4b - Backend query (breakdowns, cohorts, existing collections)

`trackingEventsTimeSeries` only returns "count per day for one eventType +
targetType (+targetId)". For anything else add a staff-only query, copying
`apps/backend/src/modules/analytics/controllers/schedule.ts`
(`getSchedulerAnalyticsData`; every function starts with
`await requireStaffAuth(context)`):

1. Controller function in `apps/backend/src/modules/analytics/controllers/`.
2. Type in `packages/gql-typedefs/<domain>.ts`; `extend type Query` field in
   `packages/gql-typedefs/analytics.ts` (end it with `@auth`).
3. Resolver entry in `apps/backend/src/modules/analytics/resolver.ts` (copy an
   existing entry's try/catch).
4. Run `npx turbo run generate` from the repo root before importing generated
   types.
5. Staff frontend: gql document in `apps/staff-frontend/src/lib/api/analytics.ts`,
   hook in `hooks/api/analytics/` (copy `useSchedulerAnalyticsData.ts`), panel in
   `Analytics/components/`. Staff-frontend hand-writes its types; no codegen.

## Step 5 - Verify locally

Start the core stack with `docker compose up -d` (app on :3000), and the staff
dashboard with `docker compose --profile staff up -d` (on :3002).

1. Do the action in the app, then reload the page. Reloading flushes the
   client's 30s batch immediately.
2. Confirm the event landed with the right shape. Don't just trust that the
   code compiled. Where to look:
   - **Redis** list `tracking-events-buffer` (in the `redis` container), where
     events appear right away. Password is `REDIS_PASSWORD` in `.env`.
   - **Mongo** collection `trackingevents` (in the `mongodb` container), where
     events appear after the backend's ~5 minute flush. Connect with
     `MONGODB_ROOT_USERNAME` / `MONGODB_ROOT_PASSWORD` from `.env`,
     database `bt`, `authSource=admin`.
   Filter on your `eventType` (and `targetType`) and check the metadata arrived
   intact. If it's missing, the usual causes are: the action never ran, the
   client hasn't flushed yet (reload), or the metadata was dropped for size.
3. To see the card, open the staff dashboard (http://localhost:3002 ->
   Analytics -> Engagement). Cards only show data once events are in Mongo
   (the ~5 minute flush; a freshly restarted backend waits ~90s before its
   first one).
   - **Sign in on the main app, not the staff page.** The staff page only has a
     "Sign in" button and no dev dropdown. Log in as the seeded dev user at
     `http://localhost:3000/api/dev/login?userId=<users _id>&redirect_uri=/`
     (get the `_id` of `dev@berkeleytime.local` from the Mongo `users`
     collection), or use the "Select User" dropdown on :3000. The login cookie
     is shared with :3002, so reload the staff page afterwards.
   - **Staff access needs a `staff-members` document** for that user, not just
     being signed in. If there isn't one, insert it in Mongo: `userId` = the
     user's `_id`, a `name`, and `addedBy` (required; point it at the
     document's own `_id`).
   - The two Cloudflare cards on the General tab show "Error loading data"
     locally. That is expected (no API key), not your change.
4. Testing an error event? `docker compose stop backend`, do the action,
   `docker compose start backend` within a few seconds. Failed tracking
   requests are not retried, so the backend must be back before the batch
   flushes or the event is lost.

## Step 6 - Leave it better

- Add your row to the inventory table below (this file is the team's list).
- Update the PR description: the event name, what it answers, where the card is.
- Expect merge conflicts in the shared files (`TrackingProvider.tsx`,
  `Analytics/index.tsx`, `EngagementAnalytics.tsx`); other pods edit them too.
  Pull `main` before opening the PR.

## Reference

**Pipeline:** `trackEvent` -> `TrackingProvider` (batches: 50 events, 30s, or
page hide) -> `trackEvents` mutation (no auth) -> backend sanitizes and
rate-limits (30 calls/IP/min) -> Redis list `tracking-events-buffer` -> flushed
to Mongo `trackingevents` every ~5 min -> `trackingEventsTimeSeries` query
(staff only) -> staff dashboard.

**Stored per event:** `eventType`, `targetType`, `targetId?`, `metadata?`,
`timestamp` (client); `sessionId` always, `userId` only if signed in,
`ipHash`, `userAgent`, `referrer` (server). Schema:
`packages/common/src/models/tracking-event.ts`.

**Limits** (enforced in `apps/backend/src/modules/tracking/controller.ts`;
violations are dropped silently): metadata max 2 levels deep, 20 keys, strings
cut to 256 chars, whole `metadata` dropped if over 1KB; names reduced to
`[A-Za-z0-9_.:/-]` and cut to 128 chars.

**Inventory** (instrumented in -> dashboard card in `EngagementAnalytics.tsx`
unless noted; "none" = collected but not shown yet, a one-card job):

| eventType | targetType | targetId | Instrumented in | Card |
|---|---|---|---|---|
| `schedule_saved` | `schedule` | schedule id | `hooks/api/schedules/useCreateSchedule.ts` | `SchedulesSavedBlock` |
| `schedule_generate` | `schedule` | schedule id | `app/Schedule/Editor/GenerateSchedulesDialog` | `SchedulesGeneratedBlock` |
| `course_result_clicked` | `class` | `subject-courseNumber` | `ClassBrowser/List/index.tsx` | `CourseResultsClickedBlock` |
| `search_filter_applied` | `catalog_filter` | filter name | `ClassBrowser/Filters/index.tsx` | `SearchFiltersAppliedBlock` |
| `page_error` | `course-discovery` | - | `components/CatalogErrorBoundary` | `PageErrorsBlock` |
| `data_load_failed` | `course-discovery` | - | `app/Catalog/index.tsx` | `DataLoadFailuresBlock` |
| `search_failed` | `course-discovery` | - | `ClassBrowser/hooks/useCatalogQuery.ts`, `components/CourseSearch` | `SearchFailuresBlock` |
| `click` / `view` / `dismiss` | `banner`, `redirect`, `targeted-message`, `nav-item` | entity id | `Banner`, `RootWrapper` | Outreach tab (`OutreachAnalytics.tsx`) |
| `click` | `apply-button` | position | `app/Apply/index.tsx` | none |
| `view` | `class` | course id | `components/Class/index.tsx` | none |
| `search` / `search_click` | `course` | - / result id | `components/CourseSearch/index.tsx` | none |

`targeted-message` and `nav-item` are selectable in the Outreach panel but
nothing emits them yet. `packages/gql-typedefs/tracking.ts`'s example list of
`targetType`s is out of date; use this table.

## Worked example

Ask: "How often do people hit the Add Course button on Grades?"

1. Step 1: anonymous page, daily count -> new event + card.
2. Step 2: `eventType` `grades_course_added`, `targetType` `grades-page`.
3. Step 3: `App.tsx` shows `/grades` renders the legacy page, so the `add`
   function is in
   `apps/frontend/src/app/_legacy/GradeDistributions/CourseInput/index.tsx`
   (the redesigned page's `add` is in `app/Grades/index.tsx`, served at
   `/grades-new`). After the course is added, call
   `trackEvent("grades_course_added", "grades-page", undefined, { mode: "instructor" })`.
   Use readable metadata values: the page's raw `selectedType` is an internal
   code (`"P"` / `"T"`), which would be meaningless on a dashboard.
4. Step 4a: `GradesCourseAddedBlock` with `valueLabel="added"`, wired into the
   Engagement tab.
5. Step 5: add a course, reload, then look for `grades_course_added` /
   `grades-page` in the Redis buffer or the Mongo `trackingevents` collection.
6. Step 6: add the table row, open the PR.
