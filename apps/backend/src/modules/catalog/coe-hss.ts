import type { FilterQuery } from "mongoose";

import type { ICatalogClassItem } from "@repo/common/models";

// Course eligibility, not a degree audit (six unique courses, two upper division,
// grades, and exam credit depend on the student's record).
// Reviewed 2026-10-26 against:
// https://engineering.berkeley.edu/students/undergraduate-guide/degree-requirements/humanities-and-social-sciences/
const HSS_BREADTHS = [
  "Arts & Literature",
  "Historical Studies",
  "International Studies",
  "Philosophy & Values",
  "Social & Behavioral Sciences",
];

const HSS_UNIVERSITY_REQUIREMENTS = [
  "American Cultures",
  "American Hist & Institutions",
  "American History",
  "American Institutions",
  "Am Cultures & Am History",
];

const HSS_READING_AND_COMPOSITION = [
  "Reading and Composition A",
  "Reading and Composition B",
  "Reading and Composition A or B",
  "Entry Level Writing & Reading Composition A",
];

// These are the FL attributes selected by the approved-language list linked
// from the CoE guide. Use campus attributes, not a list of language departments:
// a literature course in a language department is not necessarily approved.
const HSS_LANGUAGE_LEVELS = ["BEG1", "BEG2", "INT1", "INT2", "ADV1", "ADV2"];

// R&C must be taken for a letter grade. A P/NP-only offering cannot fulfill it,
// though it can still qualify independently through an approved breadth/AC/FL.
const LETTER_GRADE_BASES = ["GRD", "OPT"];

const ENGINEERING_SUBJECTS = [
  "AEROENG",
  "BIOENG",
  "CHMENG",
  "CIVENG",
  "COMPSCI",
  "DEVENG",
  "EECS",
  "ELENG",
  "ENGIN",
  "INDENG",
  "MATSCI",
  "MECENG",
  "NSE",
  "NUCENG",
];

const ENGINEERING_EXCEPTIONS: Record<string, string[]> = {
  BIOENG: ["100"],
  COMPSCI: ["C79"],
  ENGIN: ["125", "157AC", "184", "185"],
  MECENG: ["191K"],
};

// Prefixes/suffixes (e.g. R1A, C196A, N100) do not change the numeric level.
// Exclude 97-99 and everything above 196, including graduate courses.
const HSS_COURSE_NUMBER =
  /^[A-Z]*(?:0*(?:[1-9]|[1-8][0-9]|9[0-6]|1[0-8][0-9]|19[0-6]))[A-Z]*$/;

export function matchesCoEHss(item: ICatalogClassItem): boolean {
  // Variable-unit offerings qualify only when taken for at least three units.
  if (!(item.unitsMax >= 3) || !HSS_COURSE_NUMBER.test(item.courseNumber)) {
    return false;
  }

  if (ENGINEERING_EXCEPTIONS[item.subject]?.includes(item.courseNumber)) {
    return true;
  }
  if (ENGINEERING_SUBJECTS.includes(item.subject)) return false;

  return (
    (item.breadthRequirements ?? []).some(
      (requirement) =>
        HSS_BREADTHS.includes(requirement) ||
        HSS_UNIVERSITY_REQUIREMENTS.includes(requirement)
    ) ||
    (item.universityRequirements ?? []).some((requirement) =>
      HSS_UNIVERSITY_REQUIREMENTS.includes(requirement)
    ) ||
    (LETTER_GRADE_BASES.includes(item.gradingBasis ?? "") &&
      [
        ...(item.breadthRequirements ?? []),
        ...(item.universityRequirements ?? []),
      ].some((requirement) =>
        HSS_READING_AND_COMPOSITION.includes(requirement)
      )) ||
    (item.sectionAttributes ?? []).some(
      (attribute) =>
        attribute.attribute?.code === "FL" &&
        HSS_LANGUAGE_LEVELS.includes(attribute.value?.code ?? "")
    )
  );
}

// Keep the database and in-memory search paths equivalent. No denormalized
// flag/backfill is needed: existing catalog documents contain these attributes.
export function buildCoEHssQuery(): FilterQuery<ICatalogClassItem> {
  return {
    unitsMax: { $gte: 3 },
    courseNumber: HSS_COURSE_NUMBER,
    $or: [
      ...Object.entries(ENGINEERING_EXCEPTIONS).map(([subject, numbers]) => ({
        subject,
        courseNumber: { $in: numbers },
      })),
      {
        subject: { $nin: ENGINEERING_SUBJECTS },
        $or: [
          {
            breadthRequirements: {
              $in: [...HSS_BREADTHS, ...HSS_UNIVERSITY_REQUIREMENTS],
            },
          },
          { universityRequirements: { $in: HSS_UNIVERSITY_REQUIREMENTS } },
          {
            gradingBasis: { $in: LETTER_GRADE_BASES },
            $or: [
              { breadthRequirements: { $in: HSS_READING_AND_COMPOSITION } },
              { universityRequirements: { $in: HSS_READING_AND_COMPOSITION } },
            ],
          },
          {
            sectionAttributes: {
              $elemMatch: {
                "attribute.code": "FL",
                "value.code": { $in: HSS_LANGUAGE_LEVELS },
              },
            },
          },
        ],
      },
    ],
  };
}
