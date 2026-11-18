import assert from "node:assert/strict";
import { test } from "node:test";

import { computeFormerNames, selectCourseListings } from "@repo/common";

const listing = (
  courseId: string,
  name: string,
  termIds: string[]
): {
  courseId: string;
  subject: string;
  courseNumber: string;
  termIds: string[];
} => {
  const [subject, courseNumber] = name.split(" ");
  return { courseId, subject, courseNumber, termIds };
};

const names = (listings: { subject: string; courseNumber: string }[]) =>
  listings.map((l) => `${l.subject} ${l.courseNumber}`).sort();

test("a listing renamed across subjects belongs to the current course", () => {
  // EE 64 was ELENG 16B in Fall 2019, then EECS 16B until Fall 2026.
  const listings = [
    listing("106328", "ELENG 16B", ["2198"]),
    listing("106328", "EECS 16B", ["2202", "2262"]),
    listing("106328", "ELENG 64", ["2268"]),
  ];

  assert.deepEqual(
    names(selectCourseListings(listings, new Set(["ELENG"]), "ELENG")),
    ["EECS 16B", "ELENG 16B", "ELENG 64"]
  );
});

test("an active cross-listed sibling keeps its own history", () => {
  // MATSCI C212 and MECENG C225 share courseId 124151 and are both current.
  const listings = [
    listing("124151", "MATSCI C212", ["2202", "2272"]),
    listing("124151", "MECENG C225", ["2202", "2272"]),
  ];
  const catalogSubjects = new Set(["MATSCI", "MECENG"]);

  assert.deepEqual(
    names(selectCourseListings(listings, catalogSubjects, "MATSCI")),
    ["MATSCI C212"]
  );
});

test("a sibling's former name stays with the sibling's subject", () => {
  // COMPSCI 88 became the cross-listed COMPSCI C88C / DATA C88C.
  const listings = [
    listing("1", "COMPSCI 88", ["2198"]),
    listing("1", "COMPSCI C88C", ["2228"]),
    listing("1", "DATA C88C", ["2228"]),
  ];
  const catalogSubjects = new Set(["COMPSCI", "DATA"]);

  assert.deepEqual(
    names(selectCourseListings(listings, catalogSubjects, "DATA")),
    ["DATA C88C"]
  );
});

test("a retired listing that ran alongside the course is not a former name", () => {
  // LS C60V was cross-listed with GERMAN C60V before GERMAN 60V existed.
  const listings = [
    listing("161026", "LS C60V", ["2212", "2232"]),
    listing("161026", "GERMAN C60V", ["2212"]),
  ];

  assert.deepEqual(
    names(selectCourseListings(listings, new Set(["GERMAN"]), "GERMAN")),
    ["GERMAN C60V"]
  );
});

test("former names exclude the course's own and current catalog names", () => {
  const [result] = computeFormerNames(
    [
      listing("106328", "ELENG 16B", ["2198"]),
      listing("106328", "EECS 16B", ["2202"]),
      listing("106328", "ELENG 64", ["2268"]),
    ],
    [
      {
        courseId: "106328",
        subject: "ELENG",
        number: "64",
        printInCatalog: true,
      },
    ]
  );

  assert.deepEqual(result.formerNames.sort(), ["EECS 16B", "ELENG 16B"]);
  assert.deepEqual(result.formerNameKeys.sort(), ["EECS16B", "ELENG16B"]);
});

test("a contested former name resolves to the course that ran most recently", () => {
  // ELENG C249B became EECS C249B, cross-listed with CIVENG C289, which has
  // never run under its own name.
  const results = computeFormerNames(
    [
      listing("124479", "ELENG C249B", ["2212"]),
      listing("124479", "EECS C249B", ["2252"]),
    ],
    [
      {
        courseId: "124479",
        subject: "CIVENG",
        number: "C289",
        printInCatalog: true,
      },
      {
        courseId: "124479",
        subject: "EECS",
        number: "C249B",
        printInCatalog: true,
      },
    ]
  );

  assert.deepEqual(results[0].formerNames, ["ELENG C249B"]);
  assert.deepEqual(results[1].formerNames, ["ELENG C249B"]);
  assert.deepEqual(results[0].formerNameKeys, []);
  assert.deepEqual(results[1].formerNameKeys, ["ELENGC249B"]);
});

test("a name with its own course entry under the courseId is not redirected", () => {
  const results = computeFormerNames(
    [
      listing("124246", "ESPM C12", ["2198"]),
      listing("124246", "ENGLISH C77", ["2228"]),
    ],
    [
      { courseId: "124246", subject: "ESPM", number: "C12" },
      {
        courseId: "124246",
        subject: "ENGLISH",
        number: "C77",
        printInCatalog: true,
      },
    ]
  );

  assert.deepEqual(results[1].formerNames, ["ESPM C12"]);
  assert.deepEqual(results[1].formerNameKeys, []);
});
