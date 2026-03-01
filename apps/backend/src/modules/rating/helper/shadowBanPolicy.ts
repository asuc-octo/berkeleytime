import { CourseModel } from "@repo/common/models";

import { Semester } from "../../../generated-types/graphql";
import { buildSubjectQuery, normalizeSubject } from "../../../utils/subject";

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const DEFAULT_RATINGS_SHADOW_BANNED_SUBJECTS = ["AEROENG"];
const SHADOW_BANNED_COURSE_IDS_TTL_MS = 10 * 60 * 1000;

const ratingsShadowBannedSubjects = (() => {
  const configuredSubjects = process.env.RATINGS_SHADOW_BANNED_SUBJECTS?.split(
    ","
  )
    .map((subject) => normalizeSubject(subject.trim()))
    .filter((subject) => subject.length > 0);

  const subjects =
    configuredSubjects && configuredSubjects.length > 0
      ? configuredSubjects
      : DEFAULT_RATINGS_SHADOW_BANNED_SUBJECTS;

  return new Set(subjects);
})();

const ratingsShadowBanCrossListed = ["1", "true", "yes"].includes(
  (process.env.RATINGS_SHADOW_BAN_CROSSLISTED ?? "").toLowerCase()
);

let shadowBannedCourseIdsCache: CacheEntry<Set<string>> | null = null;

export const isSubjectShadowBanned = (subject: string) =>
  ratingsShadowBannedSubjects.has(normalizeSubject(subject));

export const isShadowBanCrossListedEnabled = () => ratingsShadowBanCrossListed;

export const buildEmptyAggregatedRatings = (
  subject: string,
  courseNumber: string,
  options: {
    semester?: Semester | null;
    year?: number | null;
    classNumber?: string | null;
  } = {}
) => {
  const { semester = null, year = null, classNumber = null } = options;
  return {
    subject,
    courseNumber,
    semester,
    year,
    classNumber,
    metrics: [],
  };
};

export const getShadowBannedCourseIds = async (): Promise<Set<string>> => {
  if (!ratingsShadowBanCrossListed || ratingsShadowBannedSubjects.size === 0) {
    return new Set();
  }

  const now = Date.now();
  if (
    shadowBannedCourseIdsCache &&
    now <= shadowBannedCourseIdsCache.expiresAt
  ) {
    return shadowBannedCourseIdsCache.value;
  }

  const subjectFilters = Array.from(ratingsShadowBannedSubjects).map(
    (subject) => ({
      subject: buildSubjectQuery(subject),
    })
  );

  const shadowBannedCourses = await CourseModel.find({
    $or: subjectFilters,
  })
    .select("courseId")
    .lean();

  const courseIds = new Set(
    shadowBannedCourses
      .map((course) => course.courseId)
      .filter((courseId): courseId is string => typeof courseId === "string")
  );

  shadowBannedCourseIdsCache = {
    value: courseIds,
    expiresAt: now + SHADOW_BANNED_COURSE_IDS_TTL_MS,
  };

  return courseIds;
};

interface ShouldShadowBanRatingsParams {
  subject: string;
  courseNumber: string;
  courseId?: string | null;
  resolveCourseId: (
    subject: string,
    courseNumber: string
  ) => Promise<string | null>;
}

export const shouldShadowBanRatings = async ({
  subject,
  courseNumber,
  courseId,
  resolveCourseId,
}: ShouldShadowBanRatingsParams): Promise<boolean> => {
  if (isSubjectShadowBanned(subject)) {
    return true;
  }

  if (!ratingsShadowBanCrossListed) {
    return false;
  }

  const resolvedCourseId =
    courseId ?? (await resolveCourseId(subject, courseNumber));
  if (!resolvedCourseId) {
    return false;
  }

  const shadowBannedCourseIds = await getShadowBannedCourseIds();
  return shadowBannedCourseIds.has(resolvedCourseId);
};
