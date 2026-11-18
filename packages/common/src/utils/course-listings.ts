import { normalizeSubject } from "./subject";

export interface CourseListing {
  subject: string;
  courseNumber: string;
}

export interface CourseListingTerms extends CourseListing {
  termIds: string[];
}

/**
 * Selects the subject/number listings that make up a course's history.
 *
 * SIS keeps a course's courseId across renames (e.g. "EECS 16B" -> "ELENG
 * 64"), but cross-listed courses share a courseId too, so courseId alone
 * over-matches. A listing under another subject counts as a former name only
 * if (1) no current catalog course with this courseId uses that subject, so
 * a sibling's history stays with the sibling, and (2) it never ran in the
 * same term as this subject, so it isn't a cross-listing running alongside it.
 */
export const selectCourseListings = <T extends CourseListingTerms>(
  listings: T[],
  catalogSubjects: Set<string>,
  subject: string
): T[] => {
  const currentSubject = normalizeSubject(subject);

  const isCurrent = (listing: CourseListing) =>
    normalizeSubject(listing.subject) === currentSubject;

  const currentTermIds = new Set(
    listings.filter(isCurrent).flatMap((listing) => listing.termIds)
  );

  return listings.filter(
    (listing) =>
      isCurrent(listing) ||
      (!catalogSubjects.has(normalizeSubject(listing.subject)) &&
        !listing.termIds.some((termId) => currentTermIds.has(termId)))
  );
};

export const normalizeCourseNameKey = (name: string) =>
  name.replace(/[,\s]/g, "").toUpperCase();

export interface FormerNameCourse {
  courseId: string;
  subject: string;
  number: string;
  printInCatalog?: boolean;
}

export interface CourseFormerNames {
  // Display names, e.g. ["ELENG 16B", "EECS 16B"] for ELENG 64.
  formerNames: string[];
  // Normalized former names that resolve to this course on lookup. Each key
  // belongs to at most one course.
  formerNameKeys: string[];
}

/**
 * Computes former names for every course from all class listings. Returns
 * one entry per course, in the same order as `courses`.
 */
export const computeFormerNames = (
  listings: (CourseListingTerms & { courseId: string })[],
  courses: FormerNameCourse[]
): CourseFormerNames[] => {
  const listingsByCourseId = new Map<string, CourseListingTerms[]>();
  for (const listing of listings) {
    const courseListings = listingsByCourseId.get(listing.courseId) ?? [];
    courseListings.push(listing);
    listingsByCourseId.set(listing.courseId, courseListings);
  }

  const catalogSubjectsByCourseId = new Map<string, Set<string>>();
  const catalogNames = new Set<string>();
  const ownNameKeys = new Set<string>();
  for (const course of courses) {
    ownNameKeys.add(
      `${course.courseId} ${normalizeCourseNameKey(`${course.subject} ${course.number}`)}`
    );
    if (!course.printInCatalog) continue;

    catalogNames.add(`${course.subject} ${course.number}`);
    const subjects =
      catalogSubjectsByCourseId.get(course.courseId) ?? new Set();
    subjects.add(normalizeSubject(course.subject));
    catalogSubjectsByCourseId.set(course.courseId, subjects);
  }

  const results = courses.map(() => ({
    formerNames: [] as string[],
    formerNameKeys: [] as string[],
  }));
  // When two courses claim a former name, prefer catalog courses, then the
  // one that ran most recently under its own subject.
  const claims = new Map<string, { index: number; rank: [number, string] }>();

  courses.forEach((course, index) => {
    const courseListings = selectCourseListings(
      listingsByCourseId.get(course.courseId) ?? [],
      catalogSubjectsByCourseId.get(course.courseId) ?? new Set(),
      course.subject
    );

    const ownName = `${course.subject} ${course.number}`;
    const formerNames = courseListings
      .map((listing) => `${listing.subject} ${listing.courseNumber}`)
      .filter((name) => name !== ownName && !catalogNames.has(name));
    results[index].formerNames = formerNames;

    const latestTermId =
      courseListings
        .filter(
          (listing) =>
            normalizeSubject(listing.subject) ===
            normalizeSubject(course.subject)
        )
        .flatMap((listing) => listing.termIds)
        .sort()
        .at(-1) ?? "";
    const rank: [number, string] = [
      course.printInCatalog ? 1 : 0,
      latestTermId,
    ];

    for (const name of formerNames) {
      const key = normalizeCourseNameKey(name);

      // A name with its own course entry under this courseId resolves to
      // that entry, not to the course that replaced it.
      if (ownNameKeys.has(`${course.courseId} ${key}`)) continue;

      const claim = claims.get(key);
      if (
        claim &&
        (claim.rank[0] > rank[0] ||
          (claim.rank[0] === rank[0] && claim.rank[1] >= rank[1]))
      )
        continue;

      claims.set(key, { index, rank });
    }
  });

  for (const [key, { index }] of claims) {
    results[index].formerNameKeys.push(key);
  }

  // Sorted so recomputing unchanged data yields identical arrays.
  for (const result of results) {
    result.formerNames.sort();
    result.formerNameKeys.sort();
  }

  return results;
};
