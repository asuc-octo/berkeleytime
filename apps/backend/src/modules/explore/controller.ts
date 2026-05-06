import type { PipelineStage } from "mongoose";

import { normalizeSubject } from "@repo/common";
import {
  AggregatedMetricsModel,
  ClassModel,
  CourseModel,
} from "@repo/common/models";

import { getCuratedClasses } from "../curated-classes/controller";
import {
  type RecommendResult,
  recommendBecauseViewed,
  recommendTopPicks,
} from "../semantic-search/client";
import { getLatestCatalogTerm } from "../term/controller";
import {
  DEFAULT_EXPLORE_IMAGE,
  SUBJECT_CLUSTER_IMAGE,
} from "./imageClusterConfig";

export interface ExploreCourseSnapshot {
  courseId: string;
  subject: string;
  number: string;
  title: string;
  totalRatingCount: number;
  gradeAverage: number | null;
  imageUrl?: string | null;
}

const MAX_LIMIT = 48;
const FETCH_HEADROOM = 6;
const BAYESIAN_PRIOR_STRENGTH = 20;
const RATING_METRICS = ["usefulness", "difficulty", "workload"] as const;
const POPULAR_SCORE_TEMPERATURE = 0.5;
const RECOMMEND_SCORE_TEMPERATURE = 0.05;

function capLimit(limit: number | undefined | null): number {
  if (limit == null || Number.isNaN(limit)) return 20;
  return Math.min(MAX_LIMIT, Math.max(1, Math.floor(limit)));
}

function uniqueCourseIds(ids: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of ids) {
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

function perturbRecommendResults(
  results: RecommendResult[],
  temperature: number
): RecommendResult[] {
  if (temperature <= 0 || results.length <= 1) return results;

  return [...results]
    .map((row) => ({
      ...row,
      noisyScore: row.score + (Math.random() - 0.5) * 2 * temperature,
    }))
    .sort((a, b) => b.noisyScore - a.noisyScore)
    .map(({ noisyScore, ...row }) => {
      // Explicitly mark `noisyScore` as used (we intentionally drop it from output).
      void noisyScore;
      return row;
    });
}

function imageForSubject(subject: string): string {
  const normalized = normalizeSubject(subject);
  return SUBJECT_CLUSTER_IMAGE[normalized] ?? DEFAULT_EXPLORE_IMAGE;
}

async function attachCourseImageUrls(
  snapshots: ExploreCourseSnapshot[]
): Promise<ExploreCourseSnapshot[]> {
  if (snapshots.length === 0) return snapshots;
  return snapshots.map((s) => ({ ...s, imageUrl: imageForSubject(s.subject) }));
}

async function aggregatePopularWithSubjectFilter(
  subjectsNormalized: string[] | null,
  limit: number
): Promise<ExploreCourseSnapshot[]> {
  const take = capLimit(limit);
  const maxScan = Math.min(take * FETCH_HEADROOM, 200);
  const latestCatalogTerm = await getLatestCatalogTerm();
  if (!latestCatalogTerm) return [];

  const offeredInLatestTerm = await ClassModel.distinct("courseId", {
    year: latestCatalogTerm.year,
    semester: latestCatalogTerm.semester,
    anyPrintInScheduleOfClasses: true,
  });
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

  const globalMeanRows = await AggregatedMetricsModel.aggregate([
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
      },
    },
    {
      $group: {
        _id: null,
        globalMeanQuality: { $avg: "$rawQuality" },
      },
    },
  ]);
  const globalMeanQuality =
    typeof globalMeanRows[0]?.globalMeanQuality === "number"
      ? globalMeanRows[0].globalMeanQuality
      : 3;

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
                globalMeanQuality,
              ],
            },
          ],
        },
      },
    },
    {
      $addFields: {
        noisyPopularityScore: {
          $add: [
            "$bayesianQuality",
            {
              $multiply: [
                { $subtract: [{ $multiply: [{ $rand: {} }, 2] }, 1] },
                POPULAR_SCORE_TEMPERATURE,
              ],
            },
          ],
        },
      },
    },
    {
      $sort: {
        noisyPopularityScore: -1,
        bayesianQuality: -1,
        shrinkageCount: -1,
        courseId: 1,
      },
    },
    { $limit: maxScan },
    {
      $lookup: {
        from: "classes",
        let: { cid: "$courseId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$courseId", "$$cid"] },
                  { $eq: ["$year", latestCatalogTerm.year] },
                  { $eq: ["$semester", latestCatalogTerm.semester] },
                  { $eq: ["$anyPrintInScheduleOfClasses", true] },
                ],
              },
            },
          },
          { $sort: { updatedAt: -1, _id: -1 } },
          { $limit: 1 },
          {
            $project: {
              courseId: 1,
              subject: 1,
              number: "$courseNumber",
            },
          },
        ],
        as: "canonicalClass",
      },
    },
    { $unwind: "$canonicalClass" },
    {
      $lookup: {
        from: "courses",
        let: { cid: "$courseId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$courseId", "$$cid"] },
                  { $eq: ["$printInCatalog", true] },
                ],
              },
            },
          },
          { $sort: { fromDate: -1 } },
          { $limit: 1 },
          {
            $project: {
              title: 1,
              allTimeAverageGrade: 1,
            },
          },
        ],
        as: "courseMeta",
      },
    },
    {
      $unwind: {
        path: "$courseMeta",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [
            "$canonicalClass",
            "$courseMeta",
            { totalRatingCount: "$totalRatingCount" },
          ],
        },
      },
    },
    { $limit: take },
  ];

  const rows = await AggregatedMetricsModel.aggregate(pipeline);
  const snapshots = rows.map((raw) => {
    const doc = raw as Record<string, unknown>;
    const grade = doc.allTimeAverageGrade;
    return {
      courseId: doc.courseId as string,
      subject: doc.subject as string,
      number: doc.number as string,
      title: typeof doc.title === "string" ? doc.title : "",
      totalRatingCount: Number(doc.totalRatingCount ?? 0),
      gradeAverage: typeof grade === "number" ? grade : null,
    };
  });

  return attachCourseImageUrls(snapshots);
}

export async function getExplorePopularCourseSnapshots(
  limit?: number | null
): Promise<ExploreCourseSnapshot[]> {
  return aggregatePopularWithSubjectFilter(null, capLimit(limit));
}

export async function getExploreSnapshotsForSubjects(
  subjects: string[],
  limit?: number | null
): Promise<ExploreCourseSnapshot[]> {
  if (!subjects.length) return [];

  const normalized = [
    ...new Set(subjects.map((s) => normalizeSubject(s)).filter(Boolean)),
  ];
  return aggregatePopularWithSubjectFilter(normalized, capLimit(limit));
}

/**
 * Courses from staff-curated class pins, one row per catalog course, only if the course has a
 * class printed in the schedule for the same term as the latest catalog term (`hasCatalogData`).
 */
export async function getExploreCuratedHandpickedCourses(): Promise<
  ExploreCourseSnapshot[]
> {
  const curatedRows = await getCuratedClasses();
  const catalogTerm = await getLatestCatalogTerm();

  const byCourseId = new Map<string, ExploreCourseSnapshot>();

  for (const row of curatedRows) {
    const cls = row.class as {
      courseId?: string;
      course?: {
        subject?: string;
        number?: string;
        title?: string | null;
        allTimeAverageGrade?: number | null;
      };
    };
    const courseId = cls?.courseId;
    const course = cls?.course;
    if (!courseId || !course?.subject || !course?.number) continue;
    if (byCourseId.has(courseId)) continue;

    byCourseId.set(courseId, {
      courseId,
      subject: course.subject,
      number: course.number,
      title: typeof course.title === "string" ? course.title : "",
      totalRatingCount: 0,
      gradeAverage:
        typeof course.allTimeAverageGrade === "number"
          ? course.allTimeAverageGrade
          : null,
    });
  }

  const candidates = [...byCourseId.values()];
  if (candidates.length === 0) return [];

  if (!catalogTerm) return [];

  const courseIds = candidates.map((c) => c.courseId);
  const offeredInLatestTerm = await ClassModel.distinct("courseId", {
    courseId: { $in: courseIds },
    semester: catalogTerm.semester,
    year: catalogTerm.year,
    anyPrintInScheduleOfClasses: true,
  });

  const offeredSet = new Set(offeredInLatestTerm);
  const offeredIds = candidates
    .map((c) => c.courseId)
    .filter((id): id is string => offeredSet.has(id));
  if (!offeredIds.length) return [];

  const canonicalRows = (await ClassModel.aggregate([
    {
      $match: {
        courseId: { $in: offeredIds },
        semester: catalogTerm.semester,
        year: catalogTerm.year,
        anyPrintInScheduleOfClasses: true,
      },
    },
    {
      $group: {
        _id: "$courseId",
        subject: { $first: "$subject" },
        number: { $first: "$courseNumber" },
      },
    },
  ])) as { _id: string; subject: string; number: string }[];

  const canonicalMap = new Map(
    canonicalRows.map((row) => [
      row._id,
      { subject: row.subject, number: row.number },
    ])
  );

  const snapshots = candidates
    .map((c) => {
      const canonical = canonicalMap.get(c.courseId);
      if (!canonical) return null;
      return {
        ...c,
        subject: canonical.subject,
        number: canonical.number,
      };
    })
    .filter((c): c is ExploreCourseSnapshot => c !== null);

  return attachCourseImageUrls(snapshots);
}

/**
 * Given numeric course IDs, fetch course info + rating counts and return ordered snapshots.
 * Order is preserved from the input courseIds array (semantic-search rank order).
 * When year/semester are provided, only courses offered in that term are included.
 */
async function getExploreSnapshotsForCourseIds(
  courseIds: string[],
  catalogTerm?: { year: number; semester: string }
): Promise<ExploreCourseSnapshot[]> {
  if (!courseIds.length) return [];

  const rankedIds = uniqueCourseIds(courseIds);
  let filteredIds = rankedIds;
  if (catalogTerm) {
    const offeredIds = (await ClassModel.distinct("courseId", {
      courseId: { $in: rankedIds },
      year: catalogTerm.year,
      semester: catalogTerm.semester,
      anyPrintInScheduleOfClasses: true,
    })) as string[];
    const offeredSet = new Set(offeredIds);
    filteredIds = rankedIds.filter((id) => offeredSet.has(id));
  }

  if (!filteredIds.length) return [];

  const rankMap = new Map(rankedIds.map((id, i) => [id, i]));

  const [metricRows, canonicalRows, courseTitleRows] = await Promise.all([
    AggregatedMetricsModel.aggregate([
      { $match: { courseId: { $in: filteredIds } } },
      {
        $group: {
          _id: "$courseId",
          totalRatingCount: { $sum: "$categoryCount" },
        },
      },
    ]),
    catalogTerm
      ? ClassModel.aggregate([
          {
            $match: {
              courseId: { $in: filteredIds },
              year: catalogTerm.year,
              semester: catalogTerm.semester,
              anyPrintInScheduleOfClasses: true,
            },
          },
          {
            $group: {
              _id: "$courseId",
              subject: { $first: "$subject" },
              number: { $first: "$courseNumber" },
            },
          },
        ])
      : CourseModel.aggregate([
          { $match: { courseId: { $in: filteredIds } } },
          {
            $group: {
              _id: "$courseId",
              subject: { $first: "$subject" },
              number: { $first: "$number" },
            },
          },
        ]),
    CourseModel.aggregate([
      { $match: { courseId: { $in: filteredIds } } },
      { $sort: { printInCatalog: -1, fromDate: -1 } },
      {
        $group: {
          _id: "$courseId",
          title: { $first: "$title" },
          allTimeAverageGrade: { $first: "$allTimeAverageGrade" },
        },
      },
    ]),
  ]);

  const ratingMap = new Map<string, number>(
    (metricRows as { _id: string; totalRatingCount: number }[]).map((r) => [
      r._id,
      r.totalRatingCount,
    ])
  );

  const canonicalMap = new Map<string, { subject: string; number: string }>(
    (canonicalRows as { _id: string; subject: string; number: string }[]).map(
      (r) => [r._id, { subject: r.subject, number: r.number }]
    )
  );
  const titleMap = new Map<
    string,
    { title: string; allTimeAverageGrade: number | null }
  >(
    (
      courseTitleRows as {
        _id: string;
        title?: string;
        allTimeAverageGrade?: number;
      }[]
    ).map((r) => [
      r._id,
      {
        title: typeof r.title === "string" ? r.title : "",
        allTimeAverageGrade:
          typeof r.allTimeAverageGrade === "number"
            ? r.allTimeAverageGrade
            : null,
      },
    ])
  );

  const snapshots = filteredIds
    .map((courseId) => {
      const canonical = canonicalMap.get(courseId);
      if (!canonical) return null;
      const courseMeta = titleMap.get(courseId);
      return {
        courseId,
        subject: canonical.subject,
        number: canonical.number,
        title: courseMeta?.title ?? "",
        totalRatingCount: ratingMap.get(courseId) ?? 0,
        gradeAverage: courseMeta?.allTimeAverageGrade ?? null,
      };
    })
    .filter((row): row is ExploreCourseSnapshot => row !== null)
    .sort(
      (a, b) =>
        (rankMap.get(a.courseId) ?? 999) - (rankMap.get(b.courseId) ?? 999)
    );

  return attachCourseImageUrls(snapshots);
}

async function resolveNumericCourseId(
  subject: string,
  courseNumber: string
): Promise<string | null> {
  const row = (await CourseModel.findOne(
    { subject, number: courseNumber },
    { courseId: 1, _id: 0 }
  ).lean()) as { courseId?: string } | null;
  return typeof row?.courseId === "string" ? row.courseId : null;
}

/**
 * Resolve semantic-search (subject, courseNumber) pairs to numeric course IDs.
 * courseEmbeddings.courseId = catalog course code (e.g. "C100") = courses.number.
 * Preserves the order of the input pairs for rank-stable results.
 */
async function resolveRecommendResults(
  results: RecommendResult[]
): Promise<string[]> {
  if (!results.length) return [];

  const courseRows = (await CourseModel.find(
    {
      $or: results.map((r) => ({ subject: r.subject, number: r.courseNumber })),
    },
    { courseId: 1, subject: 1, number: 1, _id: 0 }
  ).lean()) as unknown as {
    courseId: string;
    subject: string;
    number: string;
  }[];

  const keyToNumericId = new Map<string, string>(
    courseRows.map((r) => [`${r.subject}::${r.number}`, r.courseId])
  );

  return uniqueCourseIds(
    results
      .map((r) => keyToNumericId.get(`${r.subject}::${r.courseNumber}`))
      .filter((id): id is string => id !== undefined)
  );
}

export async function getExploreBecauseYouViewed(
  subject: string,
  courseNumber: string,
  year: number,
  semester: string,
  limit?: number | null
): Promise<ExploreCourseSnapshot[]> {
  const take = capLimit(limit);
  let results: RecommendResult[];
  try {
    results = await recommendBecauseViewed(
      subject,
      courseNumber,
      year,
      semester,
      take
    );
  } catch (err) {
    console.error("[explore] because-viewed recommendation failed:", err);
    return [];
  }
  results = perturbRecommendResults(results, RECOMMEND_SCORE_TEMPERATURE);
  if (!results.length) return [];
  const anchorNumericId = await resolveNumericCourseId(subject, courseNumber);
  let numericIds = await resolveRecommendResults(results);
  if (anchorNumericId) {
    numericIds = numericIds.filter((id) => id !== anchorNumericId);
  }
  return getExploreSnapshotsForCourseIds(numericIds, { year, semester });
}

export async function getExploreTopPicks(
  history: Array<{ subject: string; courseNumber: string }>,
  year: number,
  semester: string,
  limit?: number | null
): Promise<ExploreCourseSnapshot[]> {
  if (!history.length) return [];
  const take = capLimit(limit);
  let results: RecommendResult[];
  try {
    results = await recommendTopPicks(history, year, semester, take);
  } catch (err) {
    console.error("[explore] top-picks recommendation failed:", err);
    return [];
  }
  results = perturbRecommendResults(results, RECOMMEND_SCORE_TEMPERATURE);
  if (!results.length) return [];
  const numericIds = await resolveRecommendResults(results);
  return getExploreSnapshotsForCourseIds(numericIds, { year, semester });
}
