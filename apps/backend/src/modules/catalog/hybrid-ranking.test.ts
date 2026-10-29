import assert from "node:assert/strict";
import test from "node:test";

import type { ICatalogClassItem } from "@repo/common/models";

import { rankHybridCatalog } from "./hybrid-ranking";

const course = (
  subject: string,
  courseNumber: string,
  title: string,
  number = "001",
  searchableNames: string[] = [`${subject} ${courseNumber}`]
): ICatalogClassItem =>
  ({
    year: 2026,
    semester: "Fall",
    termId: "term",
    sessionId: "session",
    subject,
    courseNumber,
    number,
    courseId: `${subject}:${courseNumber}`,
    unitsMin: 0,
    unitsMax: 0,
    courseTitle: title,
    searchableNames,
  }) as ICatalogClassItem;

test("exact nickname course identifiers outrank conflicting semantic results", () => {
  const cs61a = course(
    "COMPSCI",
    "61A",
    "The Structure and Interpretation of Computer Programs"
  );
  const cs36 = course("COMPSCI", "36", "CS Scholars Seminar");
  const cs47a = course("COMPSCI", "47A", "Completion of Work in CS 61A");

  const ranked = rankHybridCatalog({
    query: "CS 61A",
    catalog: [cs36, cs47a, cs61a],
    lexicalMatches: [cs47a, cs36],
    semanticMatches: [cs36, cs47a],
  });

  assert.equal(ranked[0], cs61a);
});

test("a title prefix outranks semantically related courses", () => {
  const cs61a = course(
    "COMPSCI",
    "61A",
    "The Structure and Interpretation of Computer Programs"
  );
  const philosophy = course("PHILOS", "135", "Theory of Meaning");
  const linguistics = course("LINGUIS", "120", "Language and Meaning");

  const ranked = rankHybridCatalog({
    query: "The structure and interpretation",
    catalog: [philosophy, linguistics, cs61a],
    lexicalMatches: [philosophy],
    semanticMatches: [linguistics, philosophy],
  });

  assert.equal(ranked[0], cs61a);
});

test("reciprocal-rank fusion rewards agreement between retrieval methods", () => {
  const systems = course("COMPSCI", "162", "Operating Systems");
  const networks = course("COMPSCI", "168", "Internet Architecture");
  const databases = course("COMPSCI", "186", "Database Systems");

  const ranked = rankHybridCatalog({
    query: "reliable distributed services",
    catalog: [networks, databases, systems],
    lexicalMatches: [systems, databases],
    semanticMatches: [networks, systems],
  });

  assert.equal(ranked[0], systems);
});

test("all sections of a selected course remain adjacent and ordered", () => {
  const sectionTwo = course("COMPSCI", "61A", "SICP", "002");
  const sectionOne = course("COMPSCI", "61A", "SICP", "001");

  const ranked = rankHybridCatalog({
    query: "CS 61A",
    catalog: [sectionTwo, sectionOne],
    lexicalMatches: [sectionTwo],
    semanticMatches: [],
  });

  assert.deepEqual(
    ranked.map((item) => item.number),
    ["001", "002"]
  );
});
