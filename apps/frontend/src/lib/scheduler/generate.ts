import { GeneratorPreferences } from "./preferences";

/*
 * Schedule generation as a small optimization problem.
 *
 * Each (class, component) pair is a variable. Its values are time slots:
 * sections that meet at exactly the same times, merged so results never
 * differ only by sections that look identical on a calendar.
 *
 * Every preference is either a cost per slot or a cost that can only grow as
 * meetings are added (days used, time on campus). The cost of a partial
 * schedule is then a floor for every way to finish it, which lets
 * branch-and-bound skip almost all of the search space. Fewer gaps fits this
 * rule because gap time is time on campus minus class time, and class time is
 * folded into each slot's cost.
 */

export interface GeneratorMeeting {
  days?: (boolean | null)[] | null;
  startTime?: string | null;
  endTime?: string | null;
}

export interface GeneratorSection {
  sectionId: string;
  component: string;
  meetings: GeneratorMeeting[];
  enrollment?: {
    latest?: {
      status?: string | null;
      enrolledCount: number;
      maxEnroll: number;
    } | null;
  } | null;
}

export interface GeneratorClass {
  class: {
    primarySection?: GeneratorSection | null;
    sections: GeneratorSection[];
  };
  selectedSections: { sectionId: string }[];
  locked?: boolean | null;
  blockedSections?: string[] | null;
  lockedComponents?: string[] | null;
}

export interface GeneratorEvent {
  days: (boolean | null)[];
  startTime: string;
  endTime: string;
}

export type Reason =
  | { kind: "closed" | "events"; classIndex: number; component: string }
  | { kind: "class"; classIndex: number }
  | { kind: "pair"; classIndexes: [number, number] }
  | { kind: "all" };

export interface GeneratedSchedule<C> {
  classes: { scheduleClass: C; sectionIds: string[] }[];
  cost: number;
  daysOnCampus: number;
  gapMinutes: number;
  closedSections: number;
}

export interface GenerateResult<C> {
  schedules: GeneratedSchedule<C>[];
  /** False when the time budget ran out, so results may not be the best. */
  complete: boolean;
  /** Why nothing fits, when there are no schedules. */
  reasons: Reason[];
}

const WEIGHTS = {
  /** Per minute a meeting falls outside the preferred hours. */
  outsideHours: 1,
  /** A closed section; one at least 90% full costs a quarter of this. */
  seatRisk: 60,
  /** Per minute between a day's first start and last end. */
  timeOnCampus: 1,
  /** Per day with a meeting. */
  dayOnCampus: 120,
  /** Per avoided day with a meeting. */
  avoidedDay: 500,
};

/** Breaks this short are passing time, not gaps. */
const PASSING_MINUTES = 10;

const ALL_DAYS = 0b1111111;

interface Interval {
  day: number;
  start: number;
  end: number;
}

interface Slot {
  variable: number;
  sections: GeneratorSection[];
  intervals: Interval[];
  dayMask: number;
  cost: number;
}

interface Variable {
  classIndex: number;
  component: string;
  /** Slot ids, cheapest first. */
  slots: number[];
}

interface Problem {
  variables: Variable[];
  slots: Slot[];
  conflicts: Uint8Array;
  reasons: Reason[];
  avoidMask: number;
  preferences: GeneratorPreferences;
}

const parseMinutes = (time?: string | null) => {
  if (!time) return null;
  const [hours, minutes] = time.split(":").map(Number);
  return Number.isFinite(hours) && Number.isFinite(minutes)
    ? hours * 60 + minutes
    : null;
};

// A 00:00 start is how SIS marks a time that has not been announced.
const toIntervals = (meetings: GeneratorMeeting[]): Interval[] =>
  meetings.flatMap(({ days, startTime, endTime }) => {
    const start = parseMinutes(startTime);
    const end = parseMinutes(endTime);
    if (!start || end === null || end <= start) return [];
    return (days ?? []).flatMap((meets, day) =>
      meets ? [{ day, start, end }] : []
    );
  });

const overlaps = (a: Interval[], b: Interval[]) =>
  a.some((x) =>
    b.some((y) => x.day === y.day && x.start < y.end && y.start < x.end)
  );

const popcount = (mask: number) => {
  let count = 0;
  for (let rest = mask; rest; rest &= rest - 1) count++;
  return count;
};

const isClosed = (section: GeneratorSection) =>
  section.enrollment?.latest?.status === "C";

const fill = (section: GeneratorSection) => {
  const latest = section.enrollment?.latest;
  return latest && latest.maxEnroll > 0
    ? latest.enrolledCount / latest.maxEnroll
    : 0;
};

const seatRisk = (section: GeneratorSection) => {
  if (isClosed(section)) return 1;
  return fill(section) >= 0.9 ? 0.25 : 0;
};

const slotCost = (
  intervals: Interval[],
  sections: GeneratorSection[],
  { earliestStart, latestEnd }: GeneratorPreferences
) => {
  // Seat risk uses the best section in the slot, which is the one expanded.
  let cost = WEIGHTS.seatRisk * Math.min(...sections.map(seatRisk));

  for (const { start, end } of intervals) {
    if (earliestStart !== null)
      cost += WEIGHTS.outsideHours * Math.max(0, earliestStart - start);
    if (latestEnd !== null)
      cost += WEIGHTS.outsideHours * Math.max(0, end - latestEnd);
  }

  return cost;
};

const buildProblem = (
  classes: GeneratorClass[],
  events: GeneratorEvent[],
  preferences: GeneratorPreferences
): Problem => {
  const busy = toIntervals(events);
  const variables: Variable[] = [];
  const slots: Slot[] = [];
  const reasons: Reason[] = [];

  classes.forEach((scheduleClass, classIndex) => {
    const { primarySection, sections } = scheduleClass.class;
    const all = [primarySection, ...sections].filter(
      (section): section is GeneratorSection => !!section
    );
    const selected = new Set(
      scheduleClass.selectedSections.map(({ sectionId }) => String(sectionId))
    );
    const blocked = new Set((scheduleClass.blockedSections ?? []).map(String));
    const lockedComponents = scheduleClass.lockedComponents ?? [];
    const isSelected = (section: GeneratorSection) =>
      selected.has(String(section.sectionId));

    const groups: {
      component: string;
      candidates: GeneratorSection[];
      fixed: boolean;
    }[] = [];

    if (scheduleClass.locked) {
      // A locked class keeps exactly the sections it has.
      for (const section of all.filter(isSelected))
        groups.push({
          component: section.component,
          candidates: [section],
          fixed: true,
        });
    } else {
      const byComponent = new Map<string, GeneratorSection[]>();
      for (const section of all)
        byComponent.set(section.component, [
          ...(byComponent.get(section.component) ?? []),
          section,
        ]);

      for (const [component, group] of byComponent) {
        // A locked component with nothing selected is treated as unlocked.
        const kept = lockedComponents.includes(component)
          ? group.filter(isSelected)
          : [];

        groups.push(
          kept.length > 0
            ? { component, candidates: kept, fixed: true }
            : {
                component,
                candidates: group.filter(
                  (section) => !blocked.has(String(section.sectionId))
                ),
                fixed: false,
              }
        );
      }
    }

    for (const { component, candidates, fixed } of groups) {
      // Excluding every section of a component leaves it out of generation.
      if (candidates.length === 0) continue;

      const open =
        fixed || !preferences.onlyOpenSections
          ? candidates
          : candidates.filter((section) => !isClosed(section));
      const free = open.filter(
        (section) => !overlaps(toIntervals(section.meetings), busy)
      );

      if (open.length === 0)
        reasons.push({ kind: "closed", classIndex, component });
      else if (free.length === 0)
        reasons.push({ kind: "events", classIndex, component });

      const byTime = new Map<string, GeneratorSection[]>();
      for (const section of free) {
        const key = toIntervals(section.meetings)
          .map(({ day, start, end }) => `${day}:${start}-${end}`)
          .sort()
          .join("|");
        byTime.set(key, [...(byTime.get(key) ?? []), section]);
      }

      const variable = variables.length;
      const ids: number[] = [];
      for (const group of byTime.values()) {
        const intervals = toIntervals(group[0].meetings);
        ids.push(slots.length);
        slots.push({
          variable,
          sections: group,
          intervals,
          dayMask: intervals.reduce((mask, { day }) => mask | (1 << day), 0),
          cost: slotCost(intervals, group, preferences),
        });
      }

      if (preferences.fewerGaps) {
        // Gap time is time on campus minus class time; charge the class-time
        // part here so the time-on-campus part can stay a floor.
        const classTime = (id: number) =>
          slots[id].intervals.reduce(
            (sum, { start, end }) => sum + end - start,
            0
          );
        const most = Math.max(0, ...ids.map(classTime));
        for (const id of ids)
          slots[id].cost += WEIGHTS.timeOnCampus * (most - classTime(id));
      }

      ids.sort((a, b) => slots[a].cost - slots[b].cost);
      variables.push({ classIndex, component, slots: ids });
    }
  });

  const n = slots.length;
  const conflicts = new Uint8Array(n * n);
  for (let a = 0; a < n; a++)
    for (let b = a + 1; b < n; b++)
      if (
        slots[a].variable !== slots[b].variable &&
        overlaps(slots[a].intervals, slots[b].intervals)
      )
        conflicts[a * n + b] = conflicts[b * n + a] = 1;

  return {
    variables,
    slots,
    conflicts,
    reasons,
    avoidMask: preferences.avoidDays.reduce(
      (mask, avoid, day) => (avoid ? mask | (1 << day) : mask),
      0
    ),
    preferences,
  };
};

const dayCost = (problem: Problem, dayMask: number) =>
  WEIGHTS.avoidedDay * popcount(dayMask & problem.avoidMask) +
  (problem.preferences.fewerDays ? WEIGHTS.dayOnCampus * popcount(dayMask) : 0);

const spanCost = (problem: Problem, first: number[], last: number[]) => {
  if (!problem.preferences.fewerGaps) return 0;

  let total = 0;
  for (let day = 0; day < 7; day++)
    if (last[day] > first[day]) total += last[day] - first[day];

  return WEIGHTS.timeOnCampus * total;
};

interface SearchOutcome {
  best: number[] | null;
  cost: number;
  stopped: boolean;
}

/**
 * Depth-first branch-and-bound for the cheapest schedule over the given
 * variables that differs from every earlier result in at least `minDistance`
 * choices.
 */
const search = (
  problem: Problem,
  variableIds: number[],
  previous: number[][],
  minDistance: number,
  deadline: number
): SearchOutcome => {
  const { variables, slots, conflicts } = problem;
  const n = slots.length;
  const removed = new Int32Array(n);
  const choice: number[] = variables.map(() => -1);
  const first: number[] = Array(7).fill(Infinity);
  const last: number[] = Array(7).fill(-Infinity);
  const differences: number[] = previous.map(() => 0);

  let best: number[] | null = null;
  let bestCost = Infinity;
  let nodes = 0;
  let stopped = false;

  const visit = (assigned: number, cost: number, dayMask: number) => {
    if (stopped || (++nodes % 1024 === 0 && performance.now() > deadline)) {
      stopped = true;
      return;
    }

    // Every earlier result must still be reachable at the required distance.
    const remaining = variableIds.length - assigned;
    if (differences.some((count) => count + remaining < minDistance)) return;

    const partial =
      cost + dayCost(problem, dayMask) + spanCost(problem, first, last);

    if (remaining === 0) {
      if (partial < bestCost) {
        bestCost = partial;
        best = [...choice];
      }
      return;
    }

    // Floor for any completion: the cheapest live slot of every open
    // variable, plus the days some variable uses whichever slot it gets.
    // Branch on the variable with the fewest live slots so dead ends show up
    // early.
    let floor = partial;
    let forced = dayMask;
    let next = -1;
    let fewest = Infinity;

    for (const variable of variableIds) {
      if (choice[variable] !== -1) continue;

      let live = 0;
      let cheapest = Infinity;
      let common = ALL_DAYS;

      for (const id of variables[variable].slots) {
        if (removed[id]) continue;
        live++;
        cheapest = Math.min(cheapest, slots[id].cost);
        common &= slots[id].dayMask;
      }

      if (live === 0) return;

      floor += cheapest;
      forced |= common;

      if (live < fewest) {
        fewest = live;
        next = variable;
      }
    }

    floor += dayCost(problem, forced) - dayCost(problem, dayMask);
    if (floor >= bestCost) return;

    for (const id of variables[next].slots) {
      if (removed[id]) continue;

      const slot = slots[id];
      choice[next] = id;
      previous.forEach((result, index) => {
        if (result[next] !== id) differences[index]++;
      });

      // Forward checking: remove slots that clash with this one.
      const dropped: number[] = [];
      for (const variable of variableIds) {
        if (choice[variable] !== -1) continue;
        for (const other of variables[variable].slots)
          if (conflicts[id * n + other]) {
            removed[other]++;
            dropped.push(other);
          }
      }

      const savedFirst = [...first];
      const savedLast = [...last];
      for (const { day, start, end } of slot.intervals) {
        first[day] = Math.min(first[day], start);
        last[day] = Math.max(last[day], end);
      }

      visit(assigned + 1, cost + slot.cost, dayMask | slot.dayMask);

      first.splice(0, 7, ...savedFirst);
      last.splice(0, 7, ...savedLast);
      for (const other of dropped) removed[other]--;
      previous.forEach((result, index) => {
        if (result[next] !== id) differences[index]--;
      });
      choice[next] = -1;

      if (stopped) return;
    }
  };

  visit(0, 0, 0);

  return { best, cost: bestCost, stopped };
};

const gapMinutes = (intervals: Interval[]) => {
  let total = 0;

  for (let day = 0; day < 7; day++) {
    const today = intervals
      .filter((interval) => interval.day === day)
      .sort((a, b) => a.start - b.start);

    let latest = -Infinity;
    for (const { start, end } of today) {
      if (latest > -Infinity && start - latest > PASSING_MINUTES)
        total += start - latest;
      latest = Math.max(latest, end);
    }
  }

  return total;
};

const expand = <C extends GeneratorClass>(
  problem: Problem,
  classes: C[],
  choice: number[],
  cost: number
): GeneratedSchedule<C> => {
  const sectionIds = classes.map((): string[] => []);
  const intervals: Interval[] = [];
  let closedSections = 0;

  choice.forEach((id, variable) => {
    const slot = problem.slots[id];
    const { classIndex } = problem.variables[variable];
    const selected = new Set(
      classes[classIndex].selectedSections.map(({ sectionId }) =>
        String(sectionId)
      )
    );

    // Keep the student's current section when it is in this slot; otherwise
    // take the one most likely to have a seat.
    const section =
      slot.sections.find((candidate) =>
        selected.has(String(candidate.sectionId))
      ) ??
      [...slot.sections].sort(
        (a, b) => seatRisk(a) - seatRisk(b) || fill(a) - fill(b)
      )[0];

    sectionIds[classIndex].push(section.sectionId);
    if (isClosed(section)) closedSections++;
    intervals.push(...slot.intervals);
  });

  return {
    classes: classes.map((scheduleClass, index) => ({
      scheduleClass,
      sectionIds: sectionIds[index],
    })),
    cost,
    daysOnCampus: new Set(intervals.map(({ day }) => day)).size,
    gapMinutes: gapMinutes(intervals),
    closedSections,
  };
};

const explain = (
  problem: Problem,
  classCount: number,
  deadline: number
): Reason[] => {
  const byClass = Array.from({ length: classCount }, (_, classIndex) =>
    problem.variables.flatMap((variable, index) =>
      variable.classIndex === classIndex ? [index] : []
    )
  );

  // A search cut short by the deadline counts as fitting, so it never
  // reports a conflict it did not prove.
  const fits = (variableIds: number[]) => {
    const outcome = search(problem, variableIds, [], 0, deadline);
    return outcome.best !== null || outcome.stopped;
  };

  const reasons: Reason[] = [];

  byClass.forEach((ids, classIndex) => {
    if (ids.length > 0 && !fits(ids))
      reasons.push({ kind: "class", classIndex });
  });
  if (reasons.length > 0) return reasons;

  for (let a = 0; a < classCount; a++)
    for (let b = a + 1; b < classCount; b++)
      if (!fits([...byClass[a], ...byClass[b]]))
        reasons.push({ kind: "pair", classIndexes: [a, b] });

  return reasons.length > 0 ? reasons : [{ kind: "all" }];
};

/**
 * Finds up to `count` conflict-free schedules, best first. The first is the
 * cheapest schedule for the preferences; each later one is the cheapest that
 * differs from every earlier result in at least half of the flexible choices,
 * relaxing that distance only when no such schedule exists.
 */
export const generateSchedules = <C extends GeneratorClass>(
  classes: C[],
  events: GeneratorEvent[],
  preferences: GeneratorPreferences,
  {
    count = 8,
    timeBudgetMs = 300,
  }: { count?: number; timeBudgetMs?: number } = {}
): GenerateResult<C> => {
  const problem = buildProblem(classes, events, preferences);

  if (problem.reasons.length > 0)
    return { schedules: [], complete: true, reasons: problem.reasons };

  const variableIds = problem.variables.map((_, index) => index);
  const flexible = problem.variables.filter(
    (variable) => variable.slots.length > 1
  ).length;
  const deadline = performance.now() + timeBudgetMs;

  const results: number[][] = [];
  const costs: number[] = [];
  let minDistance = Math.max(1, Math.ceil(flexible / 2));
  let complete = true;

  while (results.length < count && minDistance > 0) {
    const outcome = search(
      problem,
      variableIds,
      results,
      minDistance,
      deadline
    );

    if (outcome.stopped) complete = false;

    if (outcome.best) {
      results.push(outcome.best);
      costs.push(outcome.cost);
      continue;
    }

    if (outcome.stopped) break;
    minDistance--;
  }

  if (results.length === 0)
    return {
      schedules: [],
      complete,
      reasons: complete
        ? explain(problem, classes.length, performance.now() + timeBudgetMs)
        : [],
    };

  return {
    schedules: results.map((choice, index) =>
      expand(problem, classes, choice, costs[index])
    ),
    complete,
    reasons: [],
  };
};
