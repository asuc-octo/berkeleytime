import type { PipelineStage } from "mongoose";
import type { RedisClientType } from "redis";

import { normalizeSubject } from "@repo/common";
import {
  AggregatedMetricsModel,
  ClassModel,
  CourseModel,
  CuratedClassModel,
  NewEnrollmentHistoryModel,
  SectionModel,
} from "@repo/common/models";

import {
  type RecommendResult,
  recommendBecauseViewed,
  recommendTopPicks,
} from "../semantic-search/client";
import {
  CATALOG_SEMESTER_ORDER,
  getLatestCatalogTerm,
} from "../term/controller";
import { clusterForSubject } from "./imageClusterConfig";
import {
  type CanonicalClass,
  type ExploreCourseSnapshot,
  RECOMMEND_SCORE_TEMPERATURE_FRACTION,
  buildSnapshot,
  capLimit,
  inferUserCareer,
  perturbRecommendResults,
  rankByAdjustedScore,
  recommendPoolSize,
  scoreRange,
  shuffle,
  uniqueCourseIds,
  withoutAdministrative,
} from "./ranking";

export type { ExploreCourseSnapshot };

interface ScoredCandidate {
  courseId: string;
  score: number;
}

const BAYESIAN_PRIOR_STRENGTH = 20;
const RATING_METRICS = ["usefulness", "difficulty", "workload"] as const;
const POPULAR_SCORE_TEMPERATURE = 0.5;
const EXTENSION_ACADEMIC_GROUP = "UCBXT";
const DEFAULT_BECAUSE_VIEWED_ROWS = 5;
const MAX_BECAUSE_VIEWED_ROWS = 10;
const CANONICAL_CACHE_TTL_SECONDS = 300;
const POPULAR_CACHE_TTL_SECONDS = 300;

export type ExploreCache = RedisClientType | null | undefined;

async function cacheGetJson<T>(
  redis: ExploreCache,
  keys: string[]
): Promise<Map<string, T | null>> {
  const out = new Map<string, T | null>();
  if (!redis || !keys.length) return out;
  let raw: (string | null)[];
  try {
    raw = await redis.mGet(keys);
  } catch (err) {
    console.error("[explore] cache read failed:", err);
    return out;
  }
  keys.forEach((key, i) => {
    const value = raw[i];
    if (value == null) return;
    try {
      out.set(key, JSON.parse(value) as T | null);
    } catch {
      // Treated as a miss and overwritten on the next write.
    }
  });
  return out;
}

async function cacheSetJson(
  redis: ExploreCache,
  entries: Array<[string, unknown]>,
  ttlSeconds: number
): Promise<void> {
  if (!redis || !entries.length) return;
  try {
    await Promise.all(
      entries.map(([key, value]) =>
        redis.setEx(key, ttlSeconds, JSON.stringify(value))
      )
    );
  } catch (err) {
    console.error("[explore] cache write failed:", err);
  }
}

/** Picks the class each course deep-links to, preferring open seats. */
async function resolveCanonicalClasses(
  courseIds: string[],
  year: number,
  semester: string,
  redis?: ExploreCache
): Promise<Map<string, CanonicalClass>> {
  if (!courseIds.length) return new Map();

  const keyFor = (courseId: string) =>
    `explore:canonical:${year}:${semester}:${courseId}`;
  const resolved = new Map<string, CanonicalClass>();

  const cached = await cacheGetJson<CanonicalClass>(
    redis,
    courseIds.map(keyFor)
  );
  const missing = courseIds.filter((courseId) => {
    if (!cached.has(keyFor(courseId))) return true;
    const hit = cached.get(keyFor(courseId));
    if (hit) resolved.set(courseId, hit);
    return false;
  });
  if (!missing.length) return resolved;

  const rows = (await ClassModel.aggregate([
    {
      $match: {
        courseId: { $in: missing },
        year,
        semester,
        anyPrintInScheduleOfClasses: true,
      },
    },
    {
      $lookup: {
        from: SectionModel.collection.name,
        let: {
          sess: "$sessionId",
          cid: "$courseId",
          num: "$number",
          subj: "$subject",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$year", year] },
                  { $eq: ["$semester", semester] },
                  { $eq: ["$sessionId", "$$sess"] },
                  { $eq: ["$courseId", "$$cid"] },
                  { $eq: ["$classNumber", "$$num"] },
                  { $eq: ["$primary", true] },
                ],
              },
            },
          },
          {
            $addFields: {
              subjectMatch: { $cond: [{ $eq: ["$subject", "$$subj"] }, 1, 0] },
            },
          },
          { $sort: { subjectMatch: -1, sectionId: 1 } },
          { $project: { _id: 0, sectionId: 1 } },
          { $limit: 1 },
        ],
        as: "primarySection",
      },
    },
    { $unwind: { path: "$primarySection", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: NewEnrollmentHistoryModel.collection.name,
        let: {
          term: "$termId",
          sess: "$sessionId",
          sid: "$primarySection.sectionId",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$termId", "$$term"] },
                  { $eq: ["$sessionId", "$$sess"] },
                  { $eq: ["$sectionId", "$$sid"] },
                ],
              },
            },
          },
          { $project: { _id: 0, latest: { $arrayElemAt: ["$history", -1] } } },
          { $limit: 1 },
        ],
        as: "enrollment",
      },
    },
    { $unwind: { path: "$enrollment", preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        // 2 = open seats, 1 = capacity unpublished, 0 = full.
        seatScore: {
          $switch: {
            branches: [
              {
                case: {
                  $or: [
                    { $eq: ["$enrollment.latest.maxEnroll", null] },
                    { $eq: ["$enrollment.latest.maxEnroll", 0] },
                  ],
                },
                then: 1,
              },
              {
                case: {
                  $lt: [
                    { $ifNull: ["$enrollment.latest.enrolledCount", 0] },
                    "$enrollment.latest.maxEnroll",
                  ],
                },
                then: 2,
              },
            ],
            default: 0,
          },
        },
        classNumberInt: {
          $convert: {
            input: "$number",
            to: "int",
            onError: 9999,
            onNull: 9999,
          },
        },
      },
    },
    {
      $sort: {
        courseId: 1,
        seatScore: -1,
        classNumberInt: 1,
        number: 1,
        subject: 1,
      },
    },
    {
      $group: {
        _id: "$courseId",
        subject: { $first: "$subject" },
        courseNumber: { $first: "$courseNumber" },
        classNumber: { $first: "$number" },
        sessionId: { $first: "$sessionId" },
        seatScore: { $first: "$seatScore" },
      },
    },
  ])) as Array<{ _id: string } & CanonicalClass>;

  const fetched = new Map<string, CanonicalClass>(
    rows.map((r) => [
      r._id,
      {
        subject: r.subject,
        courseNumber: r.courseNumber,
        classNumber: r.classNumber,
        sessionId: r.sessionId,
        seatScore: r.seatScore,
      },
    ])
  );
  for (const [courseId, canonical] of fetched)
    resolved.set(courseId, canonical);

  await cacheSetJson(
    redis,
    missing.map(
      (courseId) => [keyFor(courseId), fetched.get(courseId) ?? null] as const
    ),
    CANONICAL_CACHE_TTL_SECONDS
  );
  return resolved;
}

/** One course's deterministic popularity score (before jitter). */
interface PopularScore {
  courseId: string;
  bayesianQuality: number;
  shrinkageCount: number;
}

async function scorePopular(
  subjectsNormalized: string[] | null,
  catalogTerm: { year: number; semester: string }
): Promise<PopularScore[]> {
  const [offered, extensionIds] = await Promise.all([
    ClassModel.distinct("courseId", {
      year: catalogTerm.year,
      semester: catalogTerm.semester,
      anyPrintInScheduleOfClasses: true,
    }),
    CourseModel.distinct("courseId", {
      academicGroup: EXTENSION_ACADEMIC_GROUP,
    }),
  ]);
  const extension = new Set(extensionIds);
  const offeredInLatestTerm = offered.filter((id) => !extension.has(id));
  if (!offeredInLatestTerm.length) return [];

  const initialMatch: Record<string, unknown> = {
    categoryCount: { $gt: 0 },
    metricName: { $exists: true },
    courseId: { $in: offeredInLatestTerm },
  };
  if (subjectsNormalized && subjectsNormalized.length > 0) {
    initialMatch.subject = { $in: subjectsNormalized };
  }

  const baseScorePipeline: PipelineStage[] = [
    { $match: initialMatch },
    {
      $group: {
        _id: { courseId: "$courseId", metricName: "$metricName" },
        count: { $sum: "$categoryCount" },
        weightedSum: {
          $sum: { $multiply: ["$categoryValue", "$categoryCount"] },
        },
      },
    },
    {
      $project: {
        _id: 0,
        courseId: "$_id.courseId",
        metricName: { $toLower: "$_id.metricName" },
        count: 1,
        mean: {
          $cond: [
            { $eq: ["$count", 0] },
            null,
            { $divide: ["$weightedSum", "$count"] },
          ],
        },
      },
    },
    { $match: { metricName: { $in: [...RATING_METRICS] } } },
    {
      $group: {
        _id: "$courseId",
        metrics: {
          $push: {
            metricName: "$metricName",
            count: "$count",
            mean: "$mean",
          },
        },
        totalRatingCount: { $sum: "$count" },
      },
    },
    {
      $project: {
        _id: 0,
        courseId: "$_id",
        totalRatingCount: 1,
        usefulnessMean: {
          $first: {
            $map: {
              input: {
                $filter: {
                  input: "$metrics",
                  as: "m",
                  cond: { $eq: ["$$m.metricName", "usefulness"] },
                },
              },
              as: "m",
              in: "$$m.mean",
            },
          },
        },
        usefulnessCount: {
          $ifNull: [
            {
              $first: {
                $map: {
                  input: {
                    $filter: {
                      input: "$metrics",
                      as: "m",
                      cond: { $eq: ["$$m.metricName", "usefulness"] },
                    },
                  },
                  as: "m",
                  in: "$$m.count",
                },
              },
            },
            0,
          ],
        },
        difficultyMean: {
          $first: {
            $map: {
              input: {
                $filter: {
                  input: "$metrics",
                  as: "m",
                  cond: { $eq: ["$$m.metricName", "difficulty"] },
                },
              },
              as: "m",
              in: "$$m.mean",
            },
          },
        },
        difficultyCount: {
          $ifNull: [
            {
              $first: {
                $map: {
                  input: {
                    $filter: {
                      input: "$metrics",
                      as: "m",
                      cond: { $eq: ["$$m.metricName", "difficulty"] },
                    },
                  },
                  as: "m",
                  in: "$$m.count",
                },
              },
            },
            0,
          ],
        },
        workloadMean: {
          $first: {
            $map: {
              input: {
                $filter: {
                  input: "$metrics",
                  as: "m",
                  cond: { $eq: ["$$m.metricName", "workload"] },
                },
              },
              as: "m",
              in: "$$m.mean",
            },
          },
        },
        workloadCount: {
          $ifNull: [
            {
              $first: {
                $map: {
                  input: {
                    $filter: {
                      input: "$metrics",
                      as: "m",
                      cond: { $eq: ["$$m.metricName", "workload"] },
                    },
                  },
                  as: "m",
                  in: "$$m.count",
                },
              },
            },
            0,
          ],
        },
      },
    },
    {
      $match: {
        usefulnessMean: { $ne: null },
        difficultyMean: { $ne: null },
        workloadMean: { $ne: null },
      },
    },
  ];

  const pipeline: PipelineStage[] = [
    ...baseScorePipeline,
    {
      $addFields: {
        rawQuality: {
          $divide: [
            {
              $add: [
                "$usefulnessMean",
                { $subtract: [6, "$difficultyMean"] },
                { $subtract: [6, "$workloadMean"] },
              ],
            },
            3,
          ],
        },
        shrinkageCount: {
          $min: ["$usefulnessCount", "$difficultyCount", "$workloadCount"],
        },
      },
    },
    {
      $group: {
        _id: null,
        docs: { $push: "$$ROOT" },
        globalMeanQuality: { $avg: "$rawQuality" },
      },
    },
    { $unwind: "$docs" },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [
            "$docs",
            { globalMeanQuality: { $ifNull: ["$globalMeanQuality", 3] } },
          ],
        },
      },
    },
    {
      $addFields: {
        bayesianQuality: {
          $add: [
            {
              $multiply: [
                {
                  $divide: [
                    "$shrinkageCount",
                    { $add: ["$shrinkageCount", BAYESIAN_PRIOR_STRENGTH] },
                  ],
                },
                "$rawQuality",
              ],
            },
            {
              $multiply: [
                {
                  $divide: [
                    BAYESIAN_PRIOR_STRENGTH,
                    { $add: ["$shrinkageCount", BAYESIAN_PRIOR_STRENGTH] },
                  ],
                },
                "$globalMeanQuality",
              ],
            },
          ],
        },
      },
    },
    {
      $sort: {
        bayesianQuality: -1,
        shrinkageCount: -1,
        courseId: 1,
      },
    },
    {
      $project: { _id: 0, courseId: 1, bayesianQuality: 1, shrinkageCount: 1 },
    },
  ];

  return (await AggregatedMetricsModel.aggregate(
    pipeline
  )) as unknown as PopularScore[];
}

async function cachedPopularScores(
  subjectsNormalized: string[] | null,
  catalogTerm: { year: number; semester: string },
  redis?: ExploreCache
): Promise<PopularScore[]> {
  const key = `explore:popular:${catalogTerm.year}:${catalogTerm.semester}:${
    subjectsNormalized?.join(",") ?? "*"
  }`;
  const cached = await cacheGetJson<PopularScore[]>(redis, [key]);
  const hit = cached.get(key);
  if (hit) return hit;

  const scores = await scorePopular(subjectsNormalized, catalogTerm);
  await cacheSetJson(redis, [[key, scores]], POPULAR_CACHE_TTL_SECONDS);
  return scores;
}

async function popularSnapshots(
  subjectsNormalized: string[] | null,
  take: number,
  redis?: ExploreCache
): Promise<ExploreCourseSnapshot[]> {
  const catalogTerm = await getLatestCatalogTerm();
  if (!catalogTerm) return [];

  const scores = await cachedPopularScores(
    subjectsNormalized,
    catalogTerm,
    redis
  );
  if (!scores.length) return [];

  const chosen = scores
    .map((s) => ({
      ...s,
      noisyQuality:
        s.bayesianQuality +
        (Math.random() - 0.5) * 2 * POPULAR_SCORE_TEMPERATURE,
    }))
    .sort(
      (a, b) =>
        b.noisyQuality - a.noisyQuality ||
        b.bayesianQuality - a.bayesianQuality ||
        b.shrinkageCount - a.shrinkageCount ||
        a.courseId.localeCompare(b.courseId)
    )
    .slice(0, take);

  return snapshotsForCourseIds(
    chosen.map((s) => s.courseId),
    catalogTerm,
    redis
  );
}

export async function getExplorePopularCourseSnapshots(
  limit?: number | null,
  redis?: ExploreCache
): Promise<ExploreCourseSnapshot[]> {
  return popularSnapshots(null, capLimit(limit), redis);
}

export async function getExploreSnapshotsForSubjects(
  subjects: string[],
  limit?: number | null,
  redis?: ExploreCache
): Promise<ExploreCourseSnapshot[]> {
  if (!subjects.length) return [];

  const normalized = [
    ...new Set(subjects.map((s) => normalizeSubject(s)).filter(Boolean)),
  ].sort();
  if (!normalized.length) return [];

  return popularSnapshots(normalized, capLimit(limit), redis);
}

export async function getExploreCuratedHandpickedCourses(
  redis?: ExploreCache
): Promise<ExploreCourseSnapshot[]> {
  const catalogTerm = await getLatestCatalogTerm();
  if (!catalogTerm) return [];

  const curatedRows = (await CuratedClassModel.find()
    .select("subject courseNumber number sessionId year semester")
    .lean()) as Array<{
    subject: string;
    courseNumber: string;
    number: string;
    sessionId: string;
    year: number;
    semester: string;
  }>;
  if (!curatedRows.length) return [];

  const courses = (await CourseModel.find(
    {
      $or: curatedRows.map((r) => ({
        subject: r.subject,
        number: r.courseNumber,
      })),
    },
    { courseId: 1, subject: 1, number: 1, _id: 0 }
  ).lean()) as Array<{ courseId: string; subject: string; number: string }>;
  const courseIdByPair = new Map(
    courses.map((c) => [`${c.subject}::${c.number}`, c.courseId])
  );

  const currentPins = curatedRows.filter(
    (r) => r.year === catalogTerm.year && r.semester === catalogTerm.semester
  );
  const printedPins = currentPins.length
    ? ((await ClassModel.find(
        {
          $or: currentPins.map((r) => ({
            subject: r.subject,
            courseNumber: r.courseNumber,
            number: r.number,
            sessionId: r.sessionId,
          })),
          year: catalogTerm.year,
          semester: catalogTerm.semester,
          anyPrintInScheduleOfClasses: true,
        },
        {
          courseId: 1,
          subject: 1,
          courseNumber: 1,
          number: 1,
          sessionId: 1,
          _id: 0,
        }
      ).lean()) as Array<{
        courseId: string;
        subject: string;
        courseNumber: string;
        number: string;
        sessionId: string;
      }>)
    : [];

  // Current-term pins prioritized, then the most recent past terms fill the rest.
  const termRank = (year: number, semester: string) =>
    year * 10 + (CATALOG_SEMESTER_ORDER[semester] ?? -1);
  const currentRank = termRank(catalogTerm.year, catalogTerm.semester);
  const orderedRows = [...curatedRows].sort((a, b) => {
    const rankA = termRank(a.year, a.semester);
    const rankB = termRank(b.year, b.semester);
    if (rankA === rankB) return 0;
    if (rankA === currentRank) return -1;
    if (rankB === currentRank) return 1;
    return rankB - rankA;
  });

  const courseIds: string[] = [];
  for (const row of orderedRows) {
    const courseId = courseIdByPair.get(`${row.subject}::${row.courseNumber}`);
    if (courseId) courseIds.push(courseId);
  }

  const pinned = new Map<
    string,
    { subject: string; number: string; classNumber: string; sessionId: string }
  >();
  for (const cls of printedPins) {
    if (pinned.has(cls.courseId)) continue;
    pinned.set(cls.courseId, {
      subject: cls.subject,
      number: cls.courseNumber,
      classNumber: cls.number,
      sessionId: cls.sessionId,
    });
  }

  const snapshots = await snapshotsForCourseIds(courseIds, catalogTerm, redis);
  return snapshots.map((snapshot) => {
    const pin = pinned.get(snapshot.courseId);
    if (!pin) return snapshot;
    return {
      ...snapshot,
      ...pin,
      imageCluster: clusterForSubject(pin.subject),
    };
  });
}

/** Resolves course IDs to snapshots in order. */
async function snapshotsForCourseIds(
  courseIds: string[],
  catalogTerm: { year: number; semester: string },
  redis?: ExploreCache
): Promise<ExploreCourseSnapshot[]> {
  const uniqueIds = uniqueCourseIds(courseIds);
  if (!uniqueIds.length) return [];

  const canonicalByCourseId = await resolveCanonicalClasses(
    uniqueIds,
    catalogTerm.year,
    catalogTerm.semester,
    redis
  );
  const offeredIds = uniqueIds.filter((id) => canonicalByCourseId.has(id));
  if (!offeredIds.length) return [];

  const [metricRows, courseTitleRows] = await Promise.all([
    AggregatedMetricsModel.aggregate([
      { $match: { courseId: { $in: offeredIds } } },
      {
        $group: {
          _id: "$courseId",
          totalRatingCount: { $sum: "$categoryCount" },
        },
      },
    ]),
    CourseModel.aggregate([
      { $match: { courseId: { $in: offeredIds } } },
      {
        $addFields: {
          hasGrade: {
            $cond: [{ $gt: ["$allTimeAverageGrade", null] }, 1, 0],
          },
        },
      },
      // hasGrade breaks ties
      { $sort: { printInCatalog: -1, fromDate: -1, hasGrade: -1 } },
      {
        $group: {
          _id: "$courseId",
          title: { $first: "$title" },
          allTimeAverageGrade: { $first: "$allTimeAverageGrade" },
          academicCareer: { $first: "$academicCareer" },
          academicGroup: { $first: "$academicGroup" },
        },
      },
    ]),
  ]);

  const ratingByCourseId = new Map<string, number>(
    (metricRows as { _id: string; totalRatingCount: number }[]).map((r) => [
      r._id,
      r.totalRatingCount,
    ])
  );
  const metaByCourseId = new Map<
    string,
    {
      title: string;
      gradeAverage: number | null;
      academicCareer: string | null;
      academicGroup: string | null;
    }
  >(
    (
      courseTitleRows as {
        _id: string;
        title?: string;
        allTimeAverageGrade?: number;
        academicCareer?: string;
        academicGroup?: string;
      }[]
    ).map((r) => [
      r._id,
      {
        title: typeof r.title === "string" ? r.title : "",
        gradeAverage:
          typeof r.allTimeAverageGrade === "number"
            ? r.allTimeAverageGrade
            : null,
        academicCareer:
          typeof r.academicCareer === "string" ? r.academicCareer : null,
        academicGroup:
          typeof r.academicGroup === "string" ? r.academicGroup : null,
      },
    ])
  );

  return offeredIds.flatMap((courseId) => {
    const canonical = canonicalByCourseId.get(courseId);
    if (!canonical) return [];
    const meta = metaByCourseId.get(courseId);
    if (meta?.academicGroup === EXTENSION_ACADEMIC_GROUP) return [];
    return [
      buildSnapshot(courseId, canonical, {
        title: meta?.title ?? "",
        gradeAverage: meta?.gradeAverage ?? null,
        totalRatingCount: ratingByCourseId.get(courseId) ?? 0,
        academicCareer: meta?.academicCareer ?? null,
      }),
    ];
  });
}

/** Numeric course ID, title and career per pair, keyed subject::courseNumber. */
async function resolveCoursePairMeta(
  pairs: Array<{ subject: string; courseNumber: string }>,
  year: number,
  semester: string
): Promise<
  Map<
    string,
    { courseId: string; academicCareer: string | null; title: string | null }
  >
> {
  if (!pairs.length) return new Map();

  const classRows = (await ClassModel.find(
    {
      year,
      semester,
      $or: pairs.map((p) => ({
        subject: p.subject,
        courseNumber: p.courseNumber,
      })),
    },
    { courseId: 1, subject: 1, courseNumber: 1, _id: 0 }
  ).lean()) as unknown as {
    courseId: string;
    subject: string;
    courseNumber: string;
  }[];

  const idByKey = new Map<string, string>(
    classRows.map((r) => [`${r.subject}::${r.courseNumber}`, r.courseId])
  );
  const ids = [...new Set(idByKey.values())];
  if (!ids.length) return new Map();

  const courseRows = (await CourseModel.aggregate([
    { $match: { courseId: { $in: ids } } },
    { $sort: { printInCatalog: -1, fromDate: -1 } },
    {
      $group: {
        _id: "$courseId",
        academicCareer: { $first: "$academicCareer" },
        title: { $first: "$title" },
      },
    },
  ])) as { _id: string; academicCareer?: string; title?: string }[];

  const metaById = new Map(
    courseRows.map((r) => [
      r._id,
      {
        academicCareer:
          typeof r.academicCareer === "string" ? r.academicCareer : null,
        title: typeof r.title === "string" && r.title ? r.title : null,
      },
    ])
  );

  const out = new Map<
    string,
    { courseId: string; academicCareer: string | null; title: string | null }
  >();
  for (const [key, courseId] of idByKey) {
    const meta = metaById.get(courseId);
    out.set(key, {
      courseId,
      academicCareer: meta?.academicCareer ?? null,
      title: meta?.title ?? null,
    });
  }
  return out;
}

/** Resolves (subject, courseNumber) to numeric course IDs, in input order. */
async function resolveRecommendResults(
  results: RecommendResult[],
  year: number,
  semester: string
): Promise<ScoredCandidate[]> {
  if (!results.length) return [];

  const classRows = (await ClassModel.find(
    {
      year,
      semester,
      $or: results.map((r) => ({
        subject: r.subject,
        courseNumber: r.courseNumber,
      })),
    },
    { courseId: 1, subject: 1, courseNumber: 1, _id: 0 }
  ).lean()) as unknown as {
    courseId: string;
    subject: string;
    courseNumber: string;
  }[];

  const keyToNumericId = new Map<string, string>(
    classRows.map((r) => [`${r.subject}::${r.courseNumber}`, r.courseId])
  );

  const seen = new Set<string>();
  const out: ScoredCandidate[] = [];
  for (const r of results) {
    const courseId = keyToNumericId.get(`${r.subject}::${r.courseNumber}`);
    if (courseId === undefined || seen.has(courseId)) continue;
    seen.add(courseId);
    out.push({ courseId, score: r.score });
  }
  return out;
}

export interface ExploreBecauseViewedGroup {
  subject: string;
  courseNumber: string;
  title: string | null;
  courses: ExploreCourseSnapshot[];
}

type BecauseViewedAnchor = { subject: string; courseNumber: string };

/** Scored recommender candidates for one anchor, without that anchor and jittered. */
async function becauseViewedCandidates(
  anchor: BecauseViewedAnchor,
  year: number,
  semester: string,
  poolSize: number,
  anchorCourseId: string | null
): Promise<{ candidates: ScoredCandidate[]; range: number }> {
  let results: RecommendResult[];
  try {
    results = await recommendBecauseViewed(
      anchor.subject,
      anchor.courseNumber,
      year,
      semester,
      poolSize
    );
  } catch (err) {
    console.error(
      "[explore] because-viewed recommendation failed:",
      anchor,
      err
    );
    return { candidates: [], range: 0 };
  }
  if (!results.length) return { candidates: [], range: 0 };

  const range = scoreRange(results);
  results = perturbRecommendResults(
    results,
    RECOMMEND_SCORE_TEMPERATURE_FRACTION,
    range
  );
  const candidates = await resolveRecommendResults(results, year, semester);
  return {
    candidates: anchorCourseId
      ? candidates.filter((c) => c.courseId !== anchorCourseId)
      : candidates,
    range,
  };
}

/** "Because you viewed" for several anchors. */
export async function getExploreBecauseYouViewedBatch(
  anchors: BecauseViewedAnchor[],
  year: number,
  semester: string,
  limit?: number | null,
  history?: BecauseViewedAnchor[] | null,
  maxRows?: number | null,
  redis?: ExploreCache
): Promise<ExploreBecauseViewedGroup[]> {
  if (!anchors.length) return [];
  const take = capLimit(limit);
  const rows =
    maxRows == null || Number.isNaN(maxRows)
      ? DEFAULT_BECAUSE_VIEWED_ROWS
      : Math.min(MAX_BECAUSE_VIEWED_ROWS, Math.max(1, Math.floor(maxRows)));

  const pool: BecauseViewedAnchor[] = [];
  const seenAnchors = new Set<string>();
  for (const a of anchors) {
    const k = `${a.subject}::${a.courseNumber}`;
    if (seenAnchors.has(k)) continue;
    seenAnchors.add(k);
    pool.push(a);
  }
  const key = (a: BecauseViewedAnchor) => `${a.subject}::${a.courseNumber}`;

  const poolMeta = await resolveCoursePairMeta(pool, year, semester);

  const seenCanonical = new Set<string>();
  const uniqueAnchors: BecauseViewedAnchor[] = [];
  for (const a of shuffle(pool)) {
    const canonical = poolMeta.get(key(a))?.courseId ?? key(a);
    if (seenCanonical.has(canonical)) continue;
    seenCanonical.add(canonical);
    uniqueAnchors.push(a);
    if (uniqueAnchors.length >= rows) break;
  }
  const anchorMeta = poolMeta;

  const poolSize = recommendPoolSize(take);
  const candidatesByAnchor = new Map<
    string,
    { candidates: ScoredCandidate[]; range: number }
  >();
  await Promise.all(
    uniqueAnchors.map(async (a) => {
      candidatesByAnchor.set(
        key(a),
        await becauseViewedCandidates(
          a,
          year,
          semester,
          poolSize,
          anchorMeta.get(key(a))?.courseId ?? null
        )
      );
    })
  );

  const unionIds = uniqueAnchors.flatMap((a) =>
    (candidatesByAnchor.get(key(a))?.candidates ?? []).map((c) => c.courseId)
  );
  const snapshots = await snapshotsForCourseIds(
    unionIds,
    { year, semester },
    redis
  );
  const snapshotById = new Map(snapshots.map((s) => [s.courseId, s]));

  const viewedIds = new Set(
    [...(await resolveCoursePairMeta(history ?? [], year, semester)).values()]
      .map((m) => m.courseId)
      .concat([...anchorMeta.values()].map((m) => m.courseId))
  );

  const shownIds = new Set<string>();

  return uniqueAnchors.map((a) => {
    const { candidates, range } = candidatesByAnchor.get(key(a)) ?? {
      candidates: [],
      range: 0,
    };
    const resolved = withoutAdministrative(
      candidates.flatMap((c) => {
        const snapshot = snapshotById.get(c.courseId);
        return snapshot && !viewedIds.has(c.courseId) ? [snapshot] : [];
      })
    );
    const scoreByCourseId = new Map(
      candidates.map((c) => [c.courseId, c.score])
    );
    const userCareer = inferUserCareer([
      anchorMeta.get(key(a))?.academicCareer ?? null,
    ]);
    const courses = rankByAdjustedScore(
      resolved,
      scoreByCourseId,
      userCareer,
      range,
      shownIds
    ).slice(0, take);
    for (const c of courses) shownIds.add(c.courseId);
    return {
      subject: a.subject,
      courseNumber: a.courseNumber,
      title: anchorMeta.get(key(a))?.title ?? null,
      courses,
    };
  });
}

export async function getExploreTopPicks(
  history: Array<{ subject: string; courseNumber: string }>,
  year: number,
  semester: string,
  limit?: number | null,
  redis?: ExploreCache
): Promise<ExploreCourseSnapshot[]> {
  if (!history.length) return [];
  const take = capLimit(limit);
  let results: RecommendResult[];
  try {
    results = await recommendTopPicks(
      history,
      year,
      semester,
      recommendPoolSize(take)
    );
  } catch (err) {
    console.error("[explore] top-picks recommendation failed:", err);
    return [];
  }
  if (!results.length) return [];

  const range = scoreRange(results);
  results = perturbRecommendResults(
    results,
    RECOMMEND_SCORE_TEMPERATURE_FRACTION,
    range
  );
  const candidates = await resolveRecommendResults(results, year, semester);
  const [snapshots, historyMeta] = await Promise.all([
    snapshotsForCourseIds(
      candidates.map((c) => c.courseId),
      { year, semester },
      redis
    ),
    resolveCoursePairMeta(history, year, semester),
  ]);
  const scoreByCourseId = new Map(candidates.map((c) => [c.courseId, c.score]));
  const userCareer = inferUserCareer(
    [...historyMeta.values()].map((m) => m.academicCareer)
  );
  return rankByAdjustedScore(
    withoutAdministrative(snapshots),
    scoreByCourseId,
    userCareer,
    range
  ).slice(0, take);
}
