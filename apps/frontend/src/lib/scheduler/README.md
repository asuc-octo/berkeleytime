# Schedule generator (`lib/scheduler`)

Powers the **Generate** button in the schedule editor. Given the classes in a
schedule, the student's busy times and their rules ("no classes before 10",
"keep Fridays free"), it picks a section for each component of each class and
returns up to 8 schedules that follow every rule. The first is the best for
the sort key the student picked; each next one is the best that is clearly
different from those before it. When nothing fits, it says why and which rule
to turn off.

```ts
import { generateSchedules } from "@/lib/scheduler";
import { DEFAULT_PREFERENCES } from "@/lib/scheduler/preferences";

const result = generateSchedules(classes, events, {
  ...DEFAULT_PREFERENCES,
  earliestStart: 10 * 60, // no classes before 10:00
  sortBy: "fewest-days",
});

result.schedules[0].classes; // [{ classIndex, sectionIds }]
result.stoppedEarly; // the 100 ms time budget ran out
result.reasons; // why nothing fits, when schedules is empty
result.relaxations; // rules that, turned off alone, would let a schedule fit
```

`classes` and `events` are the schedule's non-hidden `IScheduleClass` and
`IScheduleEvent` objects, as they are.

## How it works

Real class sets have 10^8 or more section combinations even after merging, so
listing and sorting them isn't possible, and sorting a capped sample misses
the best (on `realLikeClasses`, 240–480 min of gaps instead of 60–270).

1. **Build the problem** (`normalize.ts`). One _choice_ per class component
   (LEC, DIS, LAB). Sections that break a rule or overlap a busy time are
   dropped, locked ones included. Sections that meet at the same times are
   merged into one _option_. Each option records what it clashes with.
2. **Find the best** (`search.ts`). Depth-first branch-and-bound: fill the
   choice with the fewest options left, cross out options that now clash, and
   skip a partial schedule when its _floor_ (the least cost any completion can
   have) can't beat the best found so far. `objective.ts` turns the sort key
   and its tie-breaks into that one cost.
3. **Find the next ones** (`diversify.ts`). Search again for the best schedule
   that differs from every earlier result in at least half of the flexible
   choices, relaxing the distance only when nothing that far away exists.
4. **Explain** (`explain.ts`, `index.ts`). Only when nothing fits: which rule
   emptied a component, or which class or pair of classes can't fit, and which
   single rules would let a schedule fit if turned off.

All searches share a 100 ms budget, checked every 256 nodes. The test inputs
take 3–31 ms, so it runs on the main thread. The `schedule_generate` tracking
event sends `elapsedMs`, `nodes` and `stoppedEarly` to check real devices.

## Files

- `index.ts`: `generateSchedules`, `turnOff`, `totalsOf`.
- `types.ts`: public input and output types.
- `normalize.ts`, `objective.ts`, `search.ts`, `diversify.ts`, `explain.ts`: the steps above.
- `time.ts`: meeting times to intervals, date ranges, overlap checks, `formatMinutes`.
- `preferences.ts`: the rules form's data, saved in `localStorage`.
- `apply.ts`: applies a result, changing only the selected sections of generated classes.
- `fixtures.ts`: input builders for tests and benchmarks; not used by the app.

## Changing it

- **Every sort term needs a valid floor.** A wrong one makes the search skip
  schedules it shouldn't and silently return a worse result. The brute-force
  tests in `index.test.ts` loop over every sort key and fail when a floor is
  wrong.
- **A new rule:** add it to `GeneratorPreferences` and `sanitizePreferences`
  (`preferences.ts`), a check in `checks()` (`normalize.ts`) with a `Reason`
  kind, `Rule` (`types.ts`), `RULES` and `isActive` (`index.ts`), and a
  control, reason message and relaxation label in the dialog.
- **A new sort key:** add it to `SORT_KEYS` (`preferences.ts`) and `ORDER`
  (`objective.ts`), give any new term a floor in `search.ts`, and add it to
  the dialog's "Sort by" list.

## Known limits

- End times on :x9 are rounded up a minute (`roundListedEnd`), since SIS lists
  10:10–11:00 as 10:00–10:59.
- A 00:00 start means the time isn't announced. Such sections never clash and
  pass every rule, so they rank last. Busy times at 00:00 really are at
  midnight.
- Every component is required, including the 19 Voluntary and Supplementary
  sections in Fall 2026. To make them optional, skip those codes in
  `toGroups` (`normalize.ts`).
- A rule can't be limited to the classes still being chosen, so a locked 8 AM
  section and "no classes before 10" can't both hold.
- Clashes respect half-term date ranges; gaps and days don't.
- Only single-rule relaxations are suggested, and conflicts needing three or
  more classes get a general message.

## Testing

From `apps/frontend`: `npx vitest run src/lib/scheduler` for the tests, and
`npx vitest bench src/lib/scheduler` for the benchmarks in `generate.bench.ts`.
