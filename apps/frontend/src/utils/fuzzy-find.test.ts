import { describe, expect, it } from "vitest";

import coursesData from "./courses.json";
import { FuzzySearch } from "./fuzzy-find";

interface Course {
  title: string;
  name: string;
  alternateNames?: string[];
}

const courses = coursesData as Course[];

// same settings as used in prod
const fuzzySearch = new FuzzySearch(courses, {
  includeScore: true,
  threshold: 0.25,
  keys: [
    "name",
    "title",
    {
      name: "alternateNames",
      weight: 2,
    },
  ],
});

const assertFirstResultEquals = (query: string, expected: string): void => {
  const results = fuzzySearch.search(query);
  expect(results[0]?.item.name).toBe(expected);
};

// ADD TEST CASES HERE
const tests: string[][] = [
  ["econ1", "ECON 1"],
  ["cs61a", "COMPSCI 61A"],
  ["16a", "EECS 16A"],
  ["math16a", "MATH 16A"],
];

describe("fuzzyFind", () => {
  tests.forEach(([query, expected]) => {
    it(`"${query}" -> "${expected}"`, () => {
      assertFirstResultEquals(query, expected);
    });
  });
});
