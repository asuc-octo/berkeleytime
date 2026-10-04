# Schedule generator (`lib/scheduler`)

This folder powers the **Generate** button in the schedule editor. Given the
classes in a schedule, the student's busy times and their preferences, it
returns up to 8 conflict-free schedules, best first, each clearly different
from the ones before it. When nothing fits, it says why.

Everything here is plain TypeScript with no React or network access.

```ts
import { generateSchedules } from "@/lib/scheduler";
import { DEFAULT_PREFERENCES } from "@/lib/scheduler/preferences";

const result = generateSchedules(classes, events, DEFAULT_PREFERENCES);

result.schedules[0].classes; // [{ classIndex, sections: [{ sectionId }] }]
result.stoppedEarly; // true if the time budget ran out
result.reasons; // why nothing fits, when schedules is empty
```

`classes` and `events` are the schedule's non-hidden `IScheduleClass` and
`IScheduleEvent` objects. The call takes a few milliseconds, so the dialog
runs it directly in a `useMemo`.

## How it works

The solver makes one decision per (class, component), called a **variable**:
which section to use. Sections of one variable that meet at exactly the same
times and weeks are merged into one **time slot**, because they are
interchangeable for scheduling. The search picks slots; real sections are
chosen at the end.

1. **Build the problem** (`normalize.ts`). Applies locks and excluded
   sections, merges sections into slots, drops slots that overlap a busy
   time, gives each slot a cost, and records which slots overlap. If a
   variable has no slot left, it returns the reason and nothing is searched.
2. **Search** (`search.ts`). Depth-first branch-and-bound. It picks one slot
   per variable, cheapest first, always working on the variable with the
   fewest options left. Picking a slot removes every clashing slot from the
   other variables, so dead ends show up immediately. It skips any partial
   schedule whose floor (below) cannot beat the best schedule found so far.
3. **Variety** (`diversify.ts`). The first search returns the cheapest
   schedule. Each later search returns the cheapest schedule that differs
   from every earlier result in at least half of the variables that have a
   choice, so results are not near-copies. That distance drops by one only
   when no schedule that far away exists.
4. **Expand** (`expand.ts`). Each chosen slot becomes a real section: the one
   the student already has if it is in the slot, otherwise the one most
   likely to have a seat.
5. **Explain** (`explain.ts`). Runs only when nothing fits. It searches each
   class alone, then each pair, and reports the smallest groups that cannot
   fit, for example "CS 61A and Data 8 always overlap".

**Time budget.** All searches in one call share a budget (100 ms by default).
If it runs out, the search stops and returns what it has, with
`stoppedEarly: true`. On the worst-case test input the full search takes
about 3 ms, so this is a safety net, not an expected path.

## Scoring, and the one rule for adding a preference

A schedule's cost is a weighted sum (`objective.ts`); lower is better. Every
term must be one of two kinds:

- **Per-slot:** depends on one slot alone, such as minutes outside the
  preferred hours, or seat risk.
- **Monotone:** depends on the whole schedule but can only grow as meetings
  are added, such as days on campus or time on campus.

### Why the floor is valid

The floor of a partial schedule is the cost of its chosen slots, plus the
cheapest remaining slot of every open variable, plus the monotone terms so
far. Per-slot costs of chosen slots are final, each open variable adds at
least its cheapest slot, and monotone terms never shrink, so no completion
can cost less. A term that is neither per-slot nor monotone breaks this, and
the solver would silently return a worse schedule.

"Fewer gaps" shows how to make a term fit. Gap time is time on campus minus
class time. Time on campus is monotone, and the class-time part is charged
per slot.

### Steps

1. Decide which kind the preference is. If it is neither, rewrite it: a
   reward ("prefer breaks") becomes a penalty on its opposite (long
   back-to-back runs).
2. Add it to `objective.ts`. A per-slot term goes in `slotCost`. A monotone
   term needs its own function, used in both the partial cost and the floor
   in `search.ts`.
3. Add the field to `GeneratorPreferences`, `DEFAULT_PREFERENCES` and
   `sanitizePreferences` in `preferences.ts`, and a control in the dialog.
4. Add a brute-force test in `index.test.ts`, like "puts the true best
   schedule first". It fails if the term breaks the floor.

## Known limits

Checked against Fall 2026 data by `scripts/measure-schedule-generator.ts`:

- **Optional components.** Every component is treated as required, including
  the 19 Voluntary (VOL) and Supplementary (SUP) sections. To make them
  optional, skip those component codes in `toGroups` in `normalize.ts`.
- **Berkeley time.** End times ending in 9 are rounded up one minute
  (`roundListedEnd`), because SIS lists 10:10-11:00 as 10:00-10:59.
- **Time not announced.** A section meeting that starts at 00:00 is treated
  as having no time and never conflicts. Events are exempt from this rule.
- **Half-term sections.** Conflicts respect each section's date range, but
  gap and day costs do not, so two sections that never run in the same weeks
  can still count as a gap.
- **Seat data.** Seat risk uses `enrollment.latest`, which is polled every
  15 minutes.
- **Explanations.** Clashes that need three or more classes are reported as
  "no combination fits".

## Testing

From `apps/frontend`:

```sh
npx vitest run src/lib/scheduler     # unit and brute-force tests
npx vitest bench src/lib/scheduler   # timings on the two large test inputs
```

`index.test.ts` compares the solver with brute force on 40 random inputs and
covers locks, exclusions, busy times, unannounced times, date ranges and the
time budget.
