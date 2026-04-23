import { Data, FunctionMapEntry, Variables } from "../types";
import { Course, coursesEqual } from "./course";

// ---------------------------------------------------------------------------
// assign_by_count — bipartite matching (Kuhn's augmenting-path algorithm)
// Each category needs ≥1 course; no course used twice. Maximizes categories
// satisfied.
// ---------------------------------------------------------------------------

function buildCourseIndex(eligibleLists: Course[][]): {
  allCourses: Course[];
  eligible: number[][];
} {
  const allCourses: Course[] = [];
  const courseIdx = (c: Course): number => {
    const idx = allCourses.findIndex((x) => coursesEqual(x, c));
    if (idx >= 0) return idx;
    allCourses.push(c);
    return allCourses.length - 1;
  };
  const eligible = eligibleLists.map((list) => list.map(courseIdx));
  return { allCourses, eligible };
}

function tryAugment(
  cat: number,
  eligible: number[][],
  matchCat: number[],
  matchCourse: Map<number, number>,
  visited: boolean[]
): boolean {
  for (const courseIdx of eligible[cat]) {
    const owner = matchCourse.get(courseIdx) ?? -1;
    if (owner === -1) {
      matchCat[cat] = courseIdx;
      matchCourse.set(courseIdx, cat);
      return true;
    }
    if (!visited[owner]) {
      visited[owner] = true;
      if (tryAugment(owner, eligible, matchCat, matchCourse, visited)) {
        matchCat[cat] = courseIdx;
        matchCourse.set(courseIdx, cat);
        return true;
      }
    }
  }
  return false;
}

export function runBipartiteMatch(eligibleLists: Course[][]): Course[][] {
  const n = eligibleLists.length;
  const { allCourses, eligible } = buildCourseIndex(eligibleLists);
  const matchCat = new Array<number>(n).fill(-1);
  const matchCourse = new Map<number, number>();

  for (let c = 0; c < n; c++) {
    const visited = new Array<boolean>(n).fill(false);
    visited[c] = true;
    tryAugment(c, eligible, matchCat, matchCourse, visited);
  }

  return matchCat.map((ci) => (ci >= 0 ? [allCourses[ci]] : []));
}

// ---------------------------------------------------------------------------
// assign_by_units — unit-threshold bucket assignment (backtracking)
// Each bucket needs ≥T_k units; no course used twice. Maximizes buckets
// satisfied. Uses most-constrained-first ordering to prune early.
// ---------------------------------------------------------------------------

export function runUnitAssignment(
  eligibleLists: Course[][],
  thresholds: number[]
): Course[][] {
  const k = eligibleLists.length;

  // Deduplicate courses and build per-course bucket eligibility
  const allCourses: Course[] = [];
  const courseIdx = (c: Course): number => {
    const idx = allCourses.findIndex((x) => coursesEqual(x, c));
    if (idx >= 0) return idx;
    allCourses.push(c);
    return allCourses.length - 1;
  };
  const eligible: number[][] = eligibleLists.map((list) => list.map(courseIdx));

  // Per-course: which buckets is it eligible for
  const courseEligible: number[][] = allCourses.map((_, ci) =>
    eligible.reduce<number[]>((acc, bucketList, bi) => {
      if (bucketList.includes(ci)) acc.push(bi);
      return acc;
    }, [])
  );

  // Sort courses: most constrained first (fewest eligible buckets)
  const sortedCourseIndices = allCourses
    .map((_, i) => i)
    .sort((a, b) => courseEligible[a].length - courseEligible[b].length);

  const unitsAssigned = new Array<number>(k).fill(0);
  const assigned: Course[][] = Array.from({ length: k }, () => []);

  let bestSatisfied = 0;
  let bestAssigned: Course[][] = Array.from({ length: k }, () => []);

  function backtrack(courseOrder: number[], pos: number): void {
    // Count currently satisfied buckets
    const satisfied = unitsAssigned.filter((u, i) => u >= thresholds[i]).length;
    if (satisfied > bestSatisfied) {
      bestSatisfied = satisfied;
      bestAssigned = assigned.map((b) => [...b]);
    }
    // Pruning: even if all remaining courses go to unsatisfied buckets, can we beat best?
    if (pos >= courseOrder.length) return;

    const remaining = courseOrder.slice(pos);
    // Max additional units per bucket from remaining courses
    const potentialUnits = new Array<number>(k).fill(0);
    for (const ci of remaining) {
      for (const bi of courseEligible[ci]) {
        potentialUnits[bi] += allCourses[ci].units?.data ?? 0;
      }
    }
    const maxPossible = unitsAssigned.filter(
      (u, i) => u >= thresholds[i] || u + potentialUnits[i] >= thresholds[i]
    ).length;
    if (maxPossible <= bestSatisfied) return;

    const ci = courseOrder[pos];
    // Try assigning to each eligible bucket
    for (const bi of courseEligible[ci]) {
      const units = allCourses[ci].units?.data ?? 0;
      assigned[bi].push(allCourses[ci]);
      unitsAssigned[bi] += units;
      backtrack(courseOrder, pos + 1);
      assigned[bi].pop();
      unitsAssigned[bi] -= units;
    }
    // Try skipping this course
    backtrack(courseOrder, pos + 1);
  }

  backtrack(sortedCourseIndices, 0);
  return bestAssigned;
}

// ---------------------------------------------------------------------------
// BtLL built-in registrations
// ---------------------------------------------------------------------------

export const functions: FunctionMapEntry[] = [
  [
    "assign_by_count",
    {
      type: "Function<List<Course>>(List<Course>, List<Course>, List<Course>, List<Course>, List<Course>, List<Course>, List<Course>, number)",
      data: {
        eval: (
          _: Variables,
          l0: Data<Course[]>,
          l1: Data<Course[]>,
          l2: Data<Course[]>,
          l3: Data<Course[]>,
          l4: Data<Course[]>,
          l5: Data<Course[]>,
          l6: Data<Course[]>,
          slot: Data<number>
        ): Data<Course[]> => {
          const lists = [l0, l1, l2, l3, l4, l5, l6];
          const result = runBipartiteMatch(lists.map((l) => l.data));
          return { data: result[slot.data], type: "List<Course>" };
        },
        args: [
          "List<Course>",
          "List<Course>",
          "List<Course>",
          "List<Course>",
          "List<Course>",
          "List<Course>",
          "List<Course>",
          "number",
        ],
      },
    },
  ],
  [
    "assign_by_units",
    {
      type: "Function<List<Course>>(List<Course>, List<Course>, List<Course>, List<Course>, number, number, number, number, number)",
      data: {
        eval: (
          _: Variables,
          l0: Data<Course[]>,
          l1: Data<Course[]>,
          l2: Data<Course[]>,
          l3: Data<Course[]>,
          t0: Data<number>,
          t1: Data<number>,
          t2: Data<number>,
          t3: Data<number>,
          slot: Data<number>
        ): Data<Course[]> => {
          const lists = [l0, l1, l2, l3];
          const thresholds = [t0.data, t1.data, t2.data, t3.data];
          const result = runUnitAssignment(
            lists.map((l) => l.data),
            thresholds
          );
          return { data: result[slot.data], type: "List<Course>" };
        },
        args: [
          "List<Course>",
          "List<Course>",
          "List<Course>",
          "List<Course>",
          "number",
          "number",
          "number",
          "number",
          "number",
        ],
      },
    },
  ],
];
