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

export const formatUserRatings = (ratings: UserRatings): UserRatings => {
  return {
    createdBy: ratings.createdBy,
    count: ratings.count,

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

    metrics: aggregated.metrics.map((metric: Metric) => ({
      metricName: metric.metricName as MetricName,
      count: metric.count,
      weightedAverage: metric.weightedAverage,

      categories: metric.categories.map((category: Category) => ({
        value: category.value,
        count: category.count,
      })),
    })),
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

export const formatSemesterRatings = (semesters: any[]): SemesterRatings[] => {
  return semesters.map((semester) => ({
    year: semester.year,
    semester: semester.semester as Semester,
    maxMetricCount: semester.maxMetricCount,
  }));
};
