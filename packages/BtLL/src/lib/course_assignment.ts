import { Data, FunctionMapEntry, Variables } from "../types";
import { Course, coursesEqual } from "./course";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

// Dedup a list-of-lists of courses into a flat course array + per-list
// indices into that array. Used by every matcher in this file so equality
// (subject + number) is computed once.
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

// Berkeley course-numbering convention:
//   - lower division: 1–99
//   - upper division: 100–199
//   - graduate: ≥ 200
// Course numbers may have a letter prefix (C/N/W) and/or a letter suffix
// (A/B/L/AC/…), e.g. "C100", "170L", "C170A". We strip both and parse the
// digits.
export function isUpperDivision(course: Course): boolean {
  const num = course.number?.data ?? "";
  const match = num.match(/^[A-Z]*(\d+)[A-Z]*$/);
  if (!match) return false;
  const n = parseInt(match[1], 10);
  return n >= 100 && n <= 199;
}

// ---------------------------------------------------------------------------
// assign_by_count — bipartite matching (Kuhn's augmenting-path algorithm)
// Each category needs ≥1 course; no course used twice. Maximizes categories
// satisfied.
// ---------------------------------------------------------------------------

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
  const { allCourses, eligible } = buildCourseIndex(eligibleLists);

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
    const satisfied = unitsAssigned.filter((u, i) => u >= thresholds[i]).length;
    if (satisfied > bestSatisfied) {
      bestSatisfied = satisfied;
      bestAssigned = assigned.map((b) => [...b]);
    }
    if (pos >= courseOrder.length) return;

    const remaining = courseOrder.slice(pos);
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
    for (const bi of courseEligible[ci]) {
      const units = allCourses[ci].units?.data ?? 0;
      assigned[bi].push(allCourses[ci]);
      unitsAssigned[bi] += units;
      backtrack(courseOrder, pos + 1);
      assigned[bi].pop();
      unitsAssigned[bi] -= units;
    }
    backtrack(courseOrder, pos + 1);
  }

  backtrack(sortedCourseIndices, 0);
  return bestAssigned;
}

// ---------------------------------------------------------------------------
// runJointAssignment — joint optimal matching across one or two majors
//
// Matching model
// --------------
// A "leaf" is an atomic, flexibly-fillable requirement in one major: either
// a count constraint ("≥N courses from this list") or a units constraint
// ("≥T units from this list"). Each leaf belongs to exactly one owner
// (ownerIdx ∈ {0,1}); ownerIdx=1 leaves are absent in the single-major case.
//
// Decision: for each (course c, leaf L), a 0/1 flag x_{c,L}. The matching
// must satisfy two structural rules and one policy rule:
//
//   1. Per-major exclusivity. A course can fill at most one leaf within a
//      single major: ∀ owner m, ∀ course c: Σ_{L: owner(L)=m} x_{c,L} ≤ 1.
//
//   2. Overlap cap. A course is "an overlap" iff it fills a leaf in BOTH
//      owner 0 AND owner 1. The number of upper-division (100–199) overlap
//      courses is capped at `overlapCap`. Lower-division courses may overlap
//      freely (Berkeley policy: only UD courses count against the cap).
//
//   3. Objective. Maximize total satisfied leaves across both owners; tiebreak
//      by minimizing total course-uses (avoids gratuitously stacking courses
//      into already-satisfied leaves).
//
// Note: courses are NOT pre-partitioned into "A only", "B only", "shared".
// The optimizer decides for each course. A course is allowed to be in zero,
// one, or both owners' assignments; it costs an overlap budget unit only if
// it ends up in both AND it's UD.
//
// Single-major degenerate case
// ----------------------------
// When `leaves` contains only ownerIdx=0 leaves (or overlapCap=0), no
// "both-owners" assignment is reachable, so the algorithm collapses to a
// single-major matching. This is intentional: the same primitive handles 1
// or 2 majors uniformly.
//
// Algorithm
// ---------
// Backtrack over courses in most-constrained-first order. At each course,
// branch over the disjoint options:
//   (a) skip
//   (b) assign to leaf L0 in owner 0
//   (c) assign to leaf L1 in owner 1
//   (d) assign to L0 AND L1 (only if owner 1 exists; budget-checked if UD)
// Bound by an upper estimate of remaining satisfiable leaves and prune.
// ---------------------------------------------------------------------------

export type LeafConstraint =
  | { kind: "count"; threshold: number }
  | { kind: "units"; threshold: number };

export interface JointLeaf {
  ownerIdx: 0 | 1;
  constraint: LeafConstraint;
  eligible: Course[];
}

export function runJointAssignment(
  leaves: JointLeaf[],
  overlapCap: number,
  isUD: (c: Course) => boolean = isUpperDivision
): Course[][] {
  const k = leaves.length;
  if (k === 0) return [];

  // Index all distinct courses across all leaves' eligibility lists.
  const { allCourses, eligible } = buildCourseIndex(
    leaves.map((l) => l.eligible)
  );
  const numCourses = allCourses.length;

  // For each course, list eligible leaves split by owner.
  const eligByOwner: { o0: number[]; o1: number[] }[] = allCourses.map(
    (_, ci) => ({ o0: [], o1: [] })
  );
  for (let li = 0; li < k; li++) {
    const owner = leaves[li].ownerIdx;
    for (const ci of eligible[li]) {
      if (owner === 0) eligByOwner[ci].o0.push(li);
      else eligByOwner[ci].o1.push(li);
    }
  }

  const hasOwner1 = leaves.some((l) => l.ownerIdx === 1);

  // Increment value contributed by adding course ci to leaf li (1 for count
  // constraints, course units for units constraints).
  const valueOf = (li: number, ci: number): number =>
    leaves[li].constraint.kind === "count"
      ? 1
      : (allCourses[ci].units?.data ?? 0);

  // Most-constrained-first ordering: fewer total eligible leaves → try
  // earlier so dead-end branches are detected sooner.
  const courseOrder = allCourses
    .map((_, i) => i)
    .sort(
      (a, b) =>
        eligByOwner[a].o0.length +
        eligByOwner[a].o1.length -
        (eligByOwner[b].o0.length + eligByOwner[b].o1.length)
    );

  // Mutable per-leaf state during backtracking.
  const accum = new Array<number>(k).fill(0);
  const assigned: number[][] = Array.from({ length: k }, () => []);

  // Best-so-far snapshot.
  let bestSatisfied = -1;
  let bestCoursesUsed = Infinity;
  let bestAssignment: number[][] = Array.from({ length: k }, () => []);

  const isSatisfied = (li: number) =>
    accum[li] >= leaves[li].constraint.threshold;

  const countSatisfied = (): number => {
    let n = 0;
    for (let li = 0; li < k; li++) if (isSatisfied(li)) n++;
    return n;
  };

  function backtrack(
    pos: number,
    overlapsUsed: number,
    coursesUsed: number
  ): void {
    const satisfied = countSatisfied();
    if (
      satisfied > bestSatisfied ||
      (satisfied === bestSatisfied && coursesUsed < bestCoursesUsed)
    ) {
      bestSatisfied = satisfied;
      bestCoursesUsed = coursesUsed;
      bestAssignment = assigned.map((b) => [...b]);
    }

    if (pos >= courseOrder.length) return;

    // Bound: optimistic max-possible-satisfied if every remaining course
    // contributes maximally to every leaf it's eligible for. This
    // overcounts (since per-major exclusivity isn't enforced in the bound)
    // but is a valid upper bound and prunes plenty in practice.
    const potential = new Array<number>(k).fill(0);
    for (let p = pos; p < courseOrder.length; p++) {
      const ci = courseOrder[p];
      for (const li of eligByOwner[ci].o0) potential[li] += valueOf(li, ci);
      for (const li of eligByOwner[ci].o1) potential[li] += valueOf(li, ci);
    }
    let upperBound = 0;
    for (let li = 0; li < k; li++) {
      if (
        isSatisfied(li) ||
        accum[li] + potential[li] >= leaves[li].constraint.threshold
      )
        upperBound++;
    }
    if (upperBound < bestSatisfied) return;
    if (upperBound === bestSatisfied && coursesUsed >= bestCoursesUsed) return;

    const ci = courseOrder[pos];
    const e0 = eligByOwner[ci].o0;
    const e1 = eligByOwner[ci].o1;

    // (a) skip
    backtrack(pos + 1, overlapsUsed, coursesUsed);

    // (b) assign to one leaf in owner 0
    for (const li of e0) {
      assigned[li].push(ci);
      accum[li] += valueOf(li, ci);
      backtrack(pos + 1, overlapsUsed, coursesUsed + 1);
      assigned[li].pop();
      accum[li] -= valueOf(li, ci);
    }

    // (c) assign to one leaf in owner 1
    if (hasOwner1) {
      for (const li of e1) {
        assigned[li].push(ci);
        accum[li] += valueOf(li, ci);
        backtrack(pos + 1, overlapsUsed, coursesUsed + 1);
        assigned[li].pop();
        accum[li] -= valueOf(li, ci);
      }
    }

    // (d) assign to both owners (overlap). LD overlap is free (cost 0); UD
    // overlap consumes 1 from the budget.
    if (hasOwner1 && e0.length > 0 && e1.length > 0) {
      const cost = isUD(allCourses[ci]) ? 1 : 0;
      if (overlapsUsed + cost <= overlapCap) {
        for (const li0 of e0) {
          for (const li1 of e1) {
            assigned[li0].push(ci);
            accum[li0] += valueOf(li0, ci);
            assigned[li1].push(ci);
            accum[li1] += valueOf(li1, ci);
            backtrack(pos + 1, overlapsUsed + cost, coursesUsed + 1);
            assigned[li0].pop();
            accum[li0] -= valueOf(li0, ci);
            assigned[li1].pop();
            accum[li1] -= valueOf(li1, ci);
          }
        }
      }
    }
  }

  // Suppress unused warning for numCourses (kept for clarity).
  void numCourses;

  backtrack(0, 0, 0);

  // Materialize: per-leaf list of Course objects (deduplicated indices →
  // Course refs).
  return bestAssignment.map((indices) => indices.map((ci) => allCourses[ci]));
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
