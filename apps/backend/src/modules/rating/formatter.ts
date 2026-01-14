import {
  AggregatedRatings,
  Category,
  Metric,
  MetricName,
  Semester,
  SemesterRatings,
  UserClass,
  UserMetric,
  UserRatings,
} from "../../generated-types/graphql";

const clampCount = (count: number | null | undefined): number => {
  if (typeof count !== "number" || !Number.isFinite(count)) {
    return 0;
  }
  return Math.max(count, 0);
};

export const formatUserRatings = (ratings: UserRatings): UserRatings => {
  return {
    createdBy: ratings.createdBy,
    count: clampCount(ratings.count),

    classes: ratings.classes.map((userClass: UserClass) => ({
      year: userClass.year,
      semester: userClass.semester as Semester,
      subject: userClass.subject,
      courseNumber: userClass.courseNumber,
      classNumber: userClass.classNumber,

      metrics: userClass.metrics.map((userMetric: UserMetric) => ({
        metricName: userMetric.metricName as MetricName,
        value: userMetric.value,
      })),

      lastUpdated: userClass.lastUpdated?.toString(),
    })),
  };
};

export const formatAggregatedRatings = (
  aggregated: AggregatedRatings
): AggregatedRatings => {
  return {
    year: aggregated.year,
    semester: aggregated.semester as Semester,
    subject: aggregated.subject,
    courseNumber: aggregated.courseNumber,
    classNumber: aggregated.classNumber,

    metrics: (aggregated.metrics ?? []).map((metric: Metric) => {
      const categories = (metric.categories ?? []).map(
        (category: Category) => ({
          value: category.value,
          count: clampCount(category.count),
        })
      );

      const totalCount = categories.reduce(
        (sum, category) => sum + category.count,
        0
      );
      const weightedSum = categories.reduce(
        (sum, category) =>
          sum +
          category.count *
            (typeof category.value === "number" ? category.value : 0),
        0
      );
      const sanitizedCount = Math.max(totalCount, clampCount(metric.count));

      return {
        metricName: metric.metricName as MetricName,
        count: sanitizedCount,
        weightedAverage: totalCount > 0 ? weightedSum / totalCount : 0,
        categories,
      };
    }),
  };
};

export const formatUserClassRatings = (ratings: UserClass): UserClass => {
  return {
    year: ratings.year,
    semester: ratings.semester,
    subject: ratings.subject,
    courseNumber: ratings.courseNumber,
    classNumber: ratings.classNumber,
    metrics: ratings.metrics.map((metric: UserMetric) => ({
      metricName: metric.metricName as MetricName,
      value: metric.value,
    })),
    lastUpdated: ratings.lastUpdated,
  };
};

interface SemesterRatingInput {
  year: number;
  semester: string;
  maxMetricCount?: number | null;
}

export const formatSemesterRatings = (
  semesters: SemesterRatingInput[]
): SemesterRatings[] => {
  return semesters.map((semester) => ({
    year: semester.year,
    semester: semester.semester as Semester,
    maxMetricCount: clampCount(semester.maxMetricCount),
  }));
};
