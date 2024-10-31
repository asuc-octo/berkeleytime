import { RatingType } from '@repo/common';
import { 
  Rating, 
  AggregatedRatings,
  Metric,
  Category,
  Semester,
  MetricName
} from '../../generated-types/graphql';

export const formatUserRating = (rating: RatingType): Rating => ({
  subject: rating.subject,
  courseNumber: rating.courseNumber,
  semester: rating.semester as Semester,
  year: rating.year,
  class: rating.class,

  createdBy: rating.google_id,

  metricName: rating.metricName as MetricName,
  value: rating.value
});

export const formatUserRatings = (ratings: any[]): Rating[] => {
  return ratings.map(formatUserRating);
};

export const formatAggregatedRatings = (aggregated: AggregatedRatings): AggregatedRatings => {
  return {
    subject: aggregated.subject,
    courseNumber: aggregated.courseNumber,
    semester: aggregated.semester,
    year: aggregated.year,
    class: aggregated.class,
    metrics: aggregated.metrics.map((metric: Metric) => ({
      metricName: metric.metricName,
      count: metric.count,
      mean: metric.mean,
      categories: metric.categories.map((category: Category) => ({
        value: category.value,
        count: category.count
      }))
    }))
  };
};

// const formatCategories = (metric: any): Category[] => {
//   const categories = new Map<number, number>();
//   for (const rating of metric.ratings) {
//     const category = rating.category;
//     categories.set(category, (categories.get(category) || 0) + 1);
//   }
//   return Array.from(categories).map(([value, count]) => ({
//     value,
//     count
//   }));
// }

// const formatMetrics = (ratings: any): Metric[] => {
//   const descriptor = 'test';
//   const metrics: Record<MetricName, any[]> = {
//     Attendance: [],
//     Difficulty: [],
//     Recording: [],
//     Usefulness: [],
//     Workload: []
//   };
  
//   for (const rating of ratings) {
//     const metricName = rating.metricName as MetricName;
//     if (metrics[metricName]) {
//       metrics[metricName].push(rating);
//     } else {
//       metrics[metricName] = [rating];
//     }
//   }
  
//   return Object.entries(metrics).map(([key, ratings]) => ({
//     metricName: key as MetricName,
//     count: ratings.length,
//     mean: ratings.reduce((acc, curr) => acc + curr.value, 0) / ratings.length,
//     categories: formatCategories(ratings)
//   }));
// }

// export const formatClassRatings = (ratings: any): AggregatedRatings => ({
//   subject: ratings[0].subject,
//   courseNumber: ratings[0].courseNumber,
//   semester: ratings[0].semester,
//   year: ratings[0].year,
//   class: ratings[0].class,
//   metrics: formatMetrics(ratings)
// });

