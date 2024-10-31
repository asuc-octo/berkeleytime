import { 
  AggregatedRatings,
  Metric,
  Category,
  Semester,
  MetricName,
  UserClass,
  UserMetric,
  UserRatings
} from '../../generated-types/graphql';

  export const formatUserRatings = (ratings: UserRatings): UserRatings => {
  return {
    createdBy: ratings.createdBy,
    classes: ratings.classes.map((userClass: UserClass) => ({
      subject: userClass.subject,
      courseNumber: userClass.courseNumber,
      semester: userClass.semester as Semester,
      year: userClass.year,
      class: userClass.class,
      metrics: userClass.metrics.map((userMetric: UserMetric) => ({ 
        metricName: userMetric.metricName as MetricName,
        value: userMetric.value
      }))
    }))
  }
};

export const formatAggregatedRatings = (aggregated: AggregatedRatings): AggregatedRatings => {
  return {
    subject: aggregated.subject,
    courseNumber: aggregated.courseNumber,
    semester: aggregated.semester as Semester,
    year: aggregated.year,
    class: aggregated.class,
    metrics: aggregated.metrics.map((metric: Metric) => ({
      metricName: metric.metricName as MetricName,
      count: metric.count,
      mean: metric.mean,
      categories: metric.categories.map((category: Category) => ({
        value: category.value,
        count: category.count
      }))
    }))
  };
};
