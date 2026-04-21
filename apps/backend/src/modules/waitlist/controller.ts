import {
  EnrollmentTimeframeModel,
  NewEnrollmentHistoryModel,
} from "@repo/common/models";

import { Semester } from "../../generated-types/graphql";
import { buildSubjectQuery } from "../../utils/subject";

const LAMBDA_DEFAULT = 0.5; // waitlist decreases per day when no estimate available
const SEMESTERS_FOR_LAMBDA_ESTIMATE = 3;
/** Once waitlist has been at 0 for this many days, we stop counting (waitlist phase ended). */
const WAITLIST_ZERO_CUTOFF_DAYS = 10;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Semester order for "most recent first": Fall > Spring > Summer within a year.
const SEMESTER_ORDER: Record<string, number> = {
  Fall: 3,
  Spring: 2,
  Summer: 1,
};

// P(X < k) for X ~ Poisson(lambdaT). Sum of e^{-lambdaT} * (lambdaT)^i / i! for i = 0 .. k-1.
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

// P(get in) = 1 - P(X < k) where X is number of drops in time T, X ~ Poisson(lambda * T)

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
 * Includes the first zero bucket so we count the final decrease (e.g. 5 -> 0)
 * and elapsed time up to that transition.
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
        return runStart;
      }
    } else {
      runStart = null;
    }
  }
  return sorted.length - 1;
}

/**
 * Count waitlist decreases and the active-window length, measured only within
 * the waitlist-relevant period:
 *   - Drop any entries at/after the adjustment phase start (post-adjustment
 *     waitlist data is noise — once classes start the waitlist is effectively
 *     frozen/ignored, so including it would dilute the drop rate to ~0).
 *   - Drop the leading run of entries with waitlistedCount === 0 (pre-enrollment
 *     dead time) so those idle days don't dilute the drop rate.
 *   - Stop once waitlist has been 0 for WAITLIST_ZERO_CUTOFF_DAYS (waitlist
 *     phase ended naturally).
 */
function waitlistDecreasesAndDaysFromHistory(
  history: HistoryEntry[],
  adjustmentStartMs: number | null
): { waitlistDecreases: number; days: number } {
  if (history.length === 0) return { waitlistDecreases: 0, days: 0 };

  let sorted = [...history].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  // Drop everything at/after the adjustment phase start. If the final kept
  // entry straddles that boundary, clamp its endTime.
  if (adjustmentStartMs !== null) {
    sorted = sorted.filter(
      (e) => new Date(e.startTime).getTime() < adjustmentStartMs
    );
    if (sorted.length === 0) return { waitlistDecreases: 0, days: 0 };

    const last = sorted[sorted.length - 1];
    if (new Date(last.endTime).getTime() > adjustmentStartMs) {
      sorted[sorted.length - 1] = {
        ...last,
        endTime: new Date(adjustmentStartMs),
      };
    }
  }

  // Trim the leading zero-waitlist run: those are pre-waitlist-period days
  // and dilute the per-day drop rate if counted.
  const firstActiveIdx = sorted.findIndex(
    (e) => (e.waitlistedCount ?? 0) > 0
  );
  if (firstActiveIdx === -1) {
    return { waitlistDecreases: 0, days: 0 };
  }
  // Keep one entry before the first non-zero so the 0 -> N transition and
  // the moment the waitlist opens are represented.
  const windowStartIdx = Math.max(0, firstActiveIdx - 1);
  const windowed = sorted.slice(windowStartIdx);

  const lastIdx = truncateAtWaitlistZeroCutoff(windowed);
  if (lastIdx <= 0) return { waitlistDecreases: 0, days: 0 };

  let waitlistDecreases = 0;
  for (let i = 1; i <= lastIdx; i++) {
    const prev = windowed[i - 1].waitlistedCount ?? 0;
    const curr = windowed[i].waitlistedCount ?? 0;
    if (prev > curr) waitlistDecreases += prev - curr;
  }

  const firstStart = new Date(windowed[0].startTime).getTime();
  const lastEnd = new Date(windowed[lastIdx].endTime).getTime();
  const days = Math.max(0, (lastEnd - firstStart) / MS_PER_DAY);

  return { waitlistDecreases, days };
}

/** Map (year, semester) -> earliest adjustment-phase start time (ms). */
async function fetchAdjustmentStartMsByTerm(
  terms: { year: number; semester: string }[]
): Promise<Map<string, number>> {
  const result = new Map<string, number>();
  if (terms.length === 0) return result;

  const uniqueTerms = Array.from(
    new Map(
      terms.map((t) => [`${t.year}-${t.semester}`, t] as const)
    ).values()
  );

  const timeframes = await EnrollmentTimeframeModel.find({
    isAdjustment: true,
    $or: uniqueTerms.map((t) => ({ year: t.year, semester: t.semester })),
  })
    .select({ year: 1, semester: 1, startDate: 1 })
    .lean();

  for (const tf of timeframes) {
    const key = `${tf.year}-${tf.semester}`;
    const ms = new Date(tf.startDate).getTime();
    const existing = result.get(key);
    if (existing === undefined || ms < existing) {
      result.set(key, ms);
    }
  }

  return result;
}

export async function getAdjustmentStartMs(
  year: number,
  semester: string
): Promise<number | null> {
  const map = await fetchAdjustmentStartMsByTerm([{ year, semester }]);
  return map.get(`${year}-${semester}`) ?? null;
}

/**
 * Estimate lambda (waitlist decreases per day) from a section's enrollment history
 * across the last 3 semesters, truncating each semester at the adjustment phase
 * start (since waitlist activity past that point is effectively dead data).
 * Returns null if no usable history.
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

  const adjustmentStartByTerm = await fetchAdjustmentStartMsByTerm(
    lastN.map((doc) => ({ year: doc.year, semester: doc.semester }))
  );

  let totalWaitlistDecreases = 0;
  let totalDays = 0;

  for (const doc of lastN) {
    const history = (doc.history ?? []) as HistoryEntry[];
    if (history.length === 0) continue;

    const adjustmentStartMs =
      adjustmentStartByTerm.get(`${doc.year}-${doc.semester}`) ?? null;

    const { waitlistDecreases, days } = waitlistDecreasesAndDaysFromHistory(
      history,
      adjustmentStartMs
    );
    totalWaitlistDecreases += waitlistDecreases;
    totalDays += days;
  }

  if (totalDays <= 0) return null;
  return totalWaitlistDecreases / totalDays;
}
