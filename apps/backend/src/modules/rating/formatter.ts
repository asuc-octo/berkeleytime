import { RatingType } from '@repo/common';
import { 
  Rating, 
  AggregatedRatings,
  Metric,
  Category,
  Semester
} from '../../generated-types/graphql';

export const formatUserRating = (rating: RatingType): Rating => ({
  subject: rating.subject,
  courseNumber: rating.courseNumber,
  semester: rating.semester as Semester,
  year: rating.year,
  class: rating.class,

  createdBy: rating.google_id,

  metricName: rating.metricName,
  value: rating.value
});

export const formatUserRatings = (ratings: any[]): Rating[] => {
  return ratings.map(formatUserRating);
};

const formatCategories = (metric: any): Category[] => {
  const categories = new Map<number, number>();
  for (const rating of metric.ratings) {
    const category = rating.category;
    categories.set(category, (categories.get(category) || 0) + 1);
  }
  return Array.from(categories).map(([value, count]) => ({
    value,
    count
  }));
}

const formatMetrics = (ratings: any): Metric[] => {

  // TODO: add descriptor logic

  const descriptor = 'test';
  const metrics: { [key: string]: any[] } = {};
  for (const rating of ratings) {
    if (metrics[rating.metricName]) {
      metrics[rating.metricName] += rating;
    } else {
      metrics[rating.metricName] = [rating];
    }
  }
  return Object.keys(metrics).map(key => ({
    metricName: key,
    descriptor: descriptor,
    count: metrics[key].length,
    mean: metrics[key].reduce((acc, curr) => acc + curr.value, 0) / metrics[key].length,
    categories: formatCategories(metrics[key])
  }));
}

export const formatClassRatings = (ratings: any): AggregatedRatings => ({
  subject: ratings[0].subject,
  courseNumber: ratings[0].courseNumber,
  semester: ratings[0].semester,
  year: ratings[0].year,
  class: ratings[0].class,
  metrics: formatMetrics(ratings)
});
