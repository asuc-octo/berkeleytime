import {
  getAverageGrade,
  getDistribution,
  getPnpPercentage,
  getWeightedDistribution,
} from "@repo/common";
import {
  GradeDistributionModel,
  IGradeDistributionItem,
  SectionModel,
  TermModel,
} from "@repo/common/models";

import { buildSubjectQuery } from "../../utils/subject";

const EMA_ALPHA = 0.1;

/**
 * Core aggregation: computes grade distribution stats from raw records.
 * All grade distribution lookups funnel through this single function.
 *
 * Applies exponential decay so recent semesters weigh more than older ones.
 * Weight of the nth semester back: (1 - alpha)^n
 *   alpha = 0   → simple sum (backward compatible)
 *   alpha = 0.1 → slow decay (default)
 */
export const aggregateGradeDistributions = (
  distributions: IGradeDistributionItem[],
  options?: { alpha?: number }
) => {
  const alpha = options?.alpha ?? EMA_ALPHA;

  if (alpha === 0 || distributions.length === 0) {
    const distribution = getDistribution(distributions);
    return {
      average: getAverageGrade(distribution),
      distribution,
      pnpPercentage: getPnpPercentage(distribution),
    };
  }

  // Group by termId, then sort chronologically (newest first).
  // Berkeley term IDs (e.g. "2242", "2248", "2252") sort lexicographically.
  const byTerm = new Map<string, IGradeDistributionItem[]>();
  for (const dist of distributions) {
    const arr = byTerm.get(dist.termId) ?? [];
    arr.push(dist);
    byTerm.set(dist.termId, arr);
  }

  const sortedTermIds = [...byTerm.keys()].sort().reverse();

  // Assign decay weights: n=0 (newest) → 1, n=1 → (1-α), n=2 → (1-α)², ...
  const allDistributions: IGradeDistributionItem[] = [];
  const weights: number[] = [];

  for (let n = 0; n < sortedTermIds.length; n++) {
    const termDists = byTerm.get(sortedTermIds[n])!;
    const weight = Math.pow(1 - alpha, n);
    for (const dist of termDists) {
      allDistributions.push(dist);
      weights.push(weight);
    }
  }

  const distribution = getWeightedDistribution(allDistributions, weights);
  return {
    average: getAverageGrade(distribution),
    distribution,
    pnpPercentage: getPnpPercentage(distribution),
  };
};

/**
 * Fetches and aggregates grade distributions for a set of section IDs.
 * This is the canonical way to get grade distribution data — all lookups
 * resolve section IDs first, then call this function.
 */
export const getGradeDistributionBySectionIds = async (
  sectionIds: string[]
) => {
  if (sectionIds.length === 0) return aggregateGradeDistributions([]);

  const distributions = await GradeDistributionModel.find({
    sectionId: { $in: sectionIds },
  });

  return aggregateGradeDistributions(distributions);
};

/**
 * Batch version: fetches grade distributions for multiple courses at once,
 * grouped by courseId. Used by the catalog for efficient batch loading.
 */
export const getGradeDistributionsByCourseIds = async (
  courseIds: string[]
) => {
  if (courseIds.length === 0) return new Map<string, ReturnType<typeof aggregateGradeDistributions>>();

  const sections = await SectionModel.find({
    courseId: { $in: courseIds },
    primary: true,
  })
    .select({ sectionId: 1, courseId: 1 })
    .lean();

  if (sections.length === 0) return new Map<string, ReturnType<typeof aggregateGradeDistributions>>();

  const allSectionIds = sections.map((s) => s.sectionId);
  const distributions = await GradeDistributionModel.find({
    sectionId: { $in: allSectionIds },
  }).lean();

  // Build sectionId → courseId lookup
  const sectionIdToCourseId = new Map<string, string>();
  for (const section of sections) {
    sectionIdToCourseId.set(section.sectionId, section.courseId);
  }

  // Group distributions by courseId
  const byCourseId = new Map<string, IGradeDistributionItem[]>();
  for (const dist of distributions) {
    const courseId = sectionIdToCourseId.get(dist.sectionId);
    if (!courseId) continue;
    const arr = byCourseId.get(courseId) ?? [];
    arr.push(dist);
    byCourseId.set(courseId, arr);
  }

  // Aggregate each course's distributions
  const result = new Map<string, ReturnType<typeof aggregateGradeDistributions>>();
  for (const [courseId, dists] of byCourseId) {
    result.set(courseId, aggregateGradeDistributions(dists));
  }

  return result;
};

// --- Convenience functions that resolve sections, then delegate ---

export const getGradeDistributionByCourse = async (
  subject: string,
  number: string
) => {
  const subjectQuery = buildSubjectQuery(subject);

  const sections = await SectionModel.find({
    subject: subjectQuery,
    courseNumber: number,
    primary: true,
  })
    .select({ sectionId: 1 })
    .lean();

  const sectionIds = sections.map((section) => section.sectionId);
  return getGradeDistributionBySectionIds(sectionIds);
};

export const getGradeDistributionByClass = async (
  year: number,
  semester: string,
  sessionId: string,
  subject: string,
  courseNumber: string,
  sectionNumber: string
) => {
  const subjectQuery = buildSubjectQuery(subject);

  const section = await SectionModel.findOne({
    year,
    semester,
    sessionId,
    subject: subjectQuery,
    courseNumber,
    number: sectionNumber,
    primary: true,
  })
    .select({ sectionId: 1 })
    .lean();

  if (!section) throw new Error("Class not found");

  return getGradeDistributionBySectionIds([section.sectionId]);
};

export const getGradeDistributionBySemester = async (
  year: number,
  semester: string,
  sessionId: string,
  subject: string,
  courseNumber: string
) => {
  const subjectQuery = buildSubjectQuery(subject);

  const sections = await SectionModel.find({
    year,
    semester,
    sessionId,
    subject: subjectQuery,
    courseNumber,
    primary: true,
  })
    .select({ sectionId: 1 })
    .lean();

  const sectionIds = sections.map((section) => section.sectionId);
  return getGradeDistributionBySectionIds(sectionIds);
};

export const getGradeDistributionByInstructor = async (
  subject: string,
  courseNumber: string,
  familyName: string,
  givenName: string
) => {
  const subjectQuery = buildSubjectQuery(subject);

  const sections = await SectionModel.find({
    subject: subjectQuery,
    courseNumber,
    "meetings.instructors.familyName": familyName,
    "meetings.instructors.givenName": givenName,
    primary: true,
  })
    .select({ sectionId: 1 })
    .lean();

  if (sections.length === 0) throw new Error("No classes found");

  const sectionIds = sections.map((section) => section.sectionId);
  return getGradeDistributionBySectionIds(sectionIds);
};

export const getGradeDistributionByInstructorAndSemester = async (
  year: number,
  semester: string,
  sessionId: string,
  subject: string,
  courseNumber: string,
  familyName: string,
  givenName: string
) => {
  const subjectQuery = buildSubjectQuery(subject);

  const sections = await SectionModel.find({
    year,
    semester,
    sessionId,
    subject: subjectQuery,
    courseNumber,
    "meetings.instructors.familyName": familyName,
    "meetings.instructors.givenName": givenName,
    primary: true,
  })
    .select({ sectionId: 1 })
    .lean();

  if (sections.length === 0) throw new Error("No classes found");

  const sectionIds = sections.map((section) => section.sectionId);

  const term = await TermModel.findOne({
    name: `${year} ${semester}`,
  })
    .select({ id: 1 })
    .lean();

  if (!term) throw new Error("Term not found");

  const distributions = await GradeDistributionModel.find({
    sectionId: { $in: sectionIds },
    termId: term.id,
    sessionId: sessionId,
  });

  if (distributions.length === 0) throw new Error("No grades found");

  return aggregateGradeDistributions(distributions);
};
