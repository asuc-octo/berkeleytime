import type { RecommendResult } from "../semantic-search/client";
import { clusterForSubject } from "./imageClusterConfig";

export interface ExploreCourseSnapshot {
  courseId: string;
  subject: string;
  /** Catalog course number, e.g. "61A". */
  number: string;
  /** Class section to deep-link to, e.g. "001". */
  classNumber: string;
  sessionId: string;
  title: string;
  totalRatingCount: number;
  gradeAverage: number | null;
  imageCluster?: string | null;
  seatScore: number;
  academicCareer: string | null;
}

export interface CanonicalClass {
  subject: string;
  courseNumber: string;
  classNumber: string;
  sessionId: string;
  seatScore: number;
}

export const SeatScore = {
  Full: 0,
  Unknown: 1,
  Open: 2,
} as const;

export type Rng = () => number;

export const MAX_LIMIT = 48;
export const RECOMMEND_SCORE_TEMPERATURE_FRACTION = 0.5;
export const RECOMMEND_FULL_SEAT_PENALTY_FRACTION = 0.4;
export const RECOMMEND_CAREER_MISMATCH_PENALTY_FRACTION = 0.7;
export const RECOMMEND_CROSS_RAIL_PENALTY_FRACTION = 0.55;
export const RECOMMEND_POOL_FACTOR = 3;
export const RECOMMEND_MAX_POOL = 48;

export const ADMINISTRATIVE_TITLE =
  /^(completion of work|professional preparation|dissertation (research|writing)|research for graduate students|research$|(supervised|directed|individual|independent|graduate|special|group|field|special advanced)\s+(group\s+)?(advanced\s+)?(study|studies|research|reading|readings|teaching))/i;

export function recommendPoolSize(take: number): number {
  return Math.min(RECOMMEND_MAX_POOL, take * RECOMMEND_POOL_FACTOR);
}

export function capLimit(limit: number | undefined | null): number {
  if (limit == null || Number.isNaN(limit)) return 20;
  return Math.min(MAX_LIMIT, Math.max(1, Math.floor(limit)));
}

export function uniqueCourseIds(ids: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of ids) {
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

export function shuffle<T>(items: readonly T[], rng: Rng = Math.random): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

export function buildSnapshot(
  courseId: string,
  canonical: CanonicalClass,
  meta: {
    title: string;
    gradeAverage: number | null;
    totalRatingCount: number;
    academicCareer?: string | null;
  }
): ExploreCourseSnapshot {
  return {
    courseId,
    subject: canonical.subject,
    number: canonical.courseNumber,
    classNumber: canonical.classNumber,
    sessionId: canonical.sessionId,
    title: meta.title,
    totalRatingCount: meta.totalRatingCount,
    gradeAverage: meta.gradeAverage,
    imageCluster: clusterForSubject(canonical.subject),
    seatScore: canonical.seatScore,
    academicCareer: meta.academicCareer ?? null,
  };
}

export function scoreRange(results: RecommendResult[]): number {
  if (results.length <= 1) return 0;
  const scores = results.map((r) => r.score);
  return Math.max(...scores) - Math.min(...scores);
}

export function perturbRecommendResults(
  results: RecommendResult[],
  fraction: number,
  range: number,
  rng: Rng = Math.random
): RecommendResult[] {
  if (fraction <= 0 || results.length <= 1) return results;
  const temperature = range * fraction;
  if (temperature <= 0) return results;
  return results
    .map((r) => ({
      ...r,
      score: r.score + (rng() - 0.5) * 2 * temperature,
    }))
    .sort((a, b) => b.score - a.score);
}

export function inferUserCareer(careers: Array<string | null>): string {
  const counts = new Map<string, number>();
  for (const c of careers) {
    if (!c) continue;
    counts.set(c, (counts.get(c) ?? 0) + 1);
  }
  let best = "UGRD";
  let bestCount = 0;
  for (const [career, count] of counts) {
    if (count > bestCount) {
      best = career;
      bestCount = count;
    }
  }
  return best;
}

export function withoutAdministrative(
  snapshots: ExploreCourseSnapshot[]
): ExploreCourseSnapshot[] {
  return snapshots.filter((s) => !ADMINISTRATIVE_TITLE.test(s.title));
}

export function rankByAdjustedScore(
  snapshots: ExploreCourseSnapshot[],
  scoreByCourseId: Map<string, number>,
  userCareer: string,
  range: number,
  alreadyShown?: ReadonlySet<string>
): ExploreCourseSnapshot[] {
  const adjusted = (s: ExploreCourseSnapshot) => {
    let score = scoreByCourseId.get(s.courseId) ?? 0;
    if (s.seatScore === SeatScore.Full) {
      score -= range * RECOMMEND_FULL_SEAT_PENALTY_FRACTION;
    }
    if (s.academicCareer && s.academicCareer !== userCareer) {
      score -= range * RECOMMEND_CAREER_MISMATCH_PENALTY_FRACTION;
    }
    if (alreadyShown?.has(s.courseId)) {
      score -= range * RECOMMEND_CROSS_RAIL_PENALTY_FRACTION;
    }
    return score;
  };
  return [...snapshots].sort((a, b) => adjusted(b) - adjusted(a));
}
