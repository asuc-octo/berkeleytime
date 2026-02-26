import { NewEnrollmentHistoryModel } from "@repo/common/models";

import { Semester } from "../../generated-types/graphql";
import { buildSubjectQuery } from "../../utils/subject";

const LAMBDA_DEFAULT = 0.5; // waitlist decreases per day when no estimate available
const SEMESTERS_FOR_LAMBDA_ESTIMATE = 3;
/** Once waitlist has been at 0 for this many days, we stop counting (waitlist phase ended). */
const WAITLIST_ZERO_CUTOFF_DAYS = 10;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

//Semester order for "most recent first": Fall > Spring > Summer within a year.
//TODO i think there's a universal semester order somewhere?
const SEMESTER_ORDER: Record<string, number> = {
  Fall: 3,
  Spring: 2,
  Summer: 1,
};

//P(X < k) for X ~ Poisson(lambdaT). Sum of e^{-lambdaT} * (lambdaT)^i / i! for i = 0 .. k-1.
function poissonCdf(k: number, lambdaT: number): number {
  if (lambdaT < 0 || k < 1) return 0;
  let sum = 0;
  let term = Math.exp(-lambdaT);
  for (let i = 0; i < k; i++) {
    sum += term;
    term *= lambdaT / (i + 1);
  }
  return sum;
}

//P(get in) = 1 - P(X < k) where X is number of drops in time T, X ~ Poisson(lambda * T)

export function getWaitlistGetInProbability(
  k: number,
  timeRemainingDays: number,
  lambda?: number
): { probability: number; lambdaUsed: number } {
  const lambdaUsed = lambda ?? LAMBDA_DEFAULT;
  const lambdaT = lambdaUsed * timeRemainingDays;
  const pNoGetIn = poissonCdf(k, lambdaT);
  const probability = Math.max(0, Math.min(1, 1 - pNoGetIn));
  return { probability, lambdaUsed };
}

export interface WaitlistSectionInput {
  year: number;
  semester: Semester;
  sessionId: string | null;
  subject: string;
  courseNumber: string;
  sectionNumber: string;
}

type HistoryEntry = {
  startTime: Date;
  endTime: Date;
  waitlistedCount?: number;
};

/**
 * Find the index to truncate at: once waitlist has been 0 for at least
 * WAITLIST_ZERO_CUTOFF_DAYS, we stop (waitlist phase ended). Returns the last
 * index to include (inclusive), or sorted.length - 1 if no such cutoff.
 */
function truncateAtWaitlistZeroCutoff(sorted: HistoryEntry[]): number {
  let runStart: number | null = null;

  for (let i = 0; i < sorted.length; i++) {
    const w = sorted[i].waitlistedCount ?? 0;
    if (w === 0) {
      if (runStart === null) runStart = i;
      const runStartTime = new Date(sorted[runStart].startTime).getTime();
      const runEndTime = new Date(sorted[i].endTime).getTime();
      const runDays = (runEndTime - runStartTime) / MS_PER_DAY;
      if (runDays >= WAITLIST_ZERO_CUTOFF_DAYS) {
        return runStart - 1;
      }
    } else {
      runStart = null;
    }
  }
  return sorted.length - 1;
}

/**
 * Count waitlist decreases and time span from a semester's history.
 * Only decreases in waitlistedCount count; increases count as 0 (not negative).
 * Stops counting once waitlist has been at 0 for WAITLIST_ZERO_CUTOFF_DAYS
 * (waitlist phase ended).
 */
function waitlistDecreasesAndDaysFromHistory(history: HistoryEntry[]): {
  waitlistDecreases: number;
  days: number;
} {
  if (history.length === 0) return { waitlistDecreases: 0, days: 0 };

  const sorted = [...history].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  const lastIdx = truncateAtWaitlistZeroCutoff(sorted);
  if (lastIdx < 0) return { waitlistDecreases: 0, days: 0 };

  let waitlistDecreases = 0;
  for (let i = 1; i <= lastIdx; i++) {
    const prev = sorted[i - 1].waitlistedCount ?? 0;
    const curr = sorted[i].waitlistedCount ?? 0;
    if (prev > curr) waitlistDecreases += prev - curr;
  }

  const firstStart = new Date(sorted[0].startTime).getTime();
  const lastEnd = new Date(sorted[lastIdx].endTime).getTime();
  const days = Math.max(0, (lastEnd - firstStart) / MS_PER_DAY);

  return { waitlistDecreases, days };
}

/**
 * Estimate lambda (waitlist decreases per day) from a section's enrollment history
 * across the last 3 semesters. Uses consecutive history entries: decreases in
 * waitlistedCount count as waitlist decreases; increases count as 0.
 * Returns null if no history or not enough data.
 */
export async function estimateLambdaFromEnrollmentHistory(
  section: WaitlistSectionInput
): Promise<number | null> {
  const subjectQuery = buildSubjectQuery(section.subject);

  const enrollments = await NewEnrollmentHistoryModel.find({
    sessionId: section.sessionId ?? "1",
    subject: subjectQuery,
    courseNumber: section.courseNumber,
    sectionNumber: section.sectionNumber,
  })
    .select({ year: 1, semester: 1, history: 1 })
    .lean();

  if (enrollments.length === 0) return null;

  const sortedEnrollments = [...enrollments].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return (
      (SEMESTER_ORDER[b.semester] ?? 0) - (SEMESTER_ORDER[a.semester] ?? 0)
    );
  });

  const lastN = sortedEnrollments.slice(0, SEMESTERS_FOR_LAMBDA_ESTIMATE);

  let totalWaitlistDecreases = 0;
  let totalDays = 0;

  for (const doc of lastN) {
    const history = (doc.history ?? []) as HistoryEntry[];
    if (history.length === 0) continue;
    const { waitlistDecreases, days } =
      waitlistDecreasesAndDaysFromHistory(history);
    totalWaitlistDecreases += waitlistDecreases;
    totalDays += days;
  }

  if (totalDays <= 0) return null;
  return totalWaitlistDecreases / totalDays;
}
