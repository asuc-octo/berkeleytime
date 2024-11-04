import {
  AggregatedRatings,
  Category,
  Metric,
  MetricName,
  Semester,
  UserClass,
  UserMetric,
  UserRatings,
} from "../../generated-types/graphql";

export const formatUserRatings = (ratings: UserRatings): UserRatings => {
  return {
    createdBy: ratings.createdBy,
    count: ratings.count,

    classes: ratings.classes.map((userClass: UserClass) => ({
      subject: userClass.subject,
      courseNumber: userClass.courseNumber,
      semester: userClass.semester as Semester,
      year: userClass.year,
      classNumber: userClass.classNumber,

      metrics: userClass.metrics.map((userMetric: UserMetric) => ({
        metricName: userMetric.metricName as MetricName,
        value: userMetric.value,
      })),
    })),
  };
};

export const formatAggregatedRatings = (
  aggregated: AggregatedRatings
): AggregatedRatings => {
  return {
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
    subject: ratings.subject,
    courseNumber: ratings.courseNumber,
    semester: ratings.semester,
    year: ratings.year,
    classNumber: ratings.classNumber,
    metrics: ratings.metrics.map((metric: UserMetric) => ({
      metricName: metric.metricName as MetricName,
      value: metric.value,
    })),
  };
};
