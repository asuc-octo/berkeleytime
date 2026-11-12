import { Data, FunctionMapEntry, Variables } from "../types";
import { Course, coursesEqual } from "./course";

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
];
