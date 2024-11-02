import { 
  AggregatedRatings,
  Metric,
  Category,
  Semester,
  MetricName,
  UserClass,
  UserMetric,
  UserRatings,
  SemesterAvailable
} from '../../generated-types/graphql';

export const formatUserRatings = (
  ratings: UserRatings
): UserRatings => {
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
        value: userMetric.value
      }))
    }))
  }
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
        count: category.count
      }))
    }))
  };
};

export const formatSemesters = (
  semesters: SemesterAvailable[]
): SemesterAvailable[] => {
  return semesters.map((semester: SemesterAvailable) => ({
    semester: semester.semester as Semester,
    year: semester.year
  }));
};
