import { RatingType } from '@repo/common';
import { 
  Rating, 
  AggregatedRatings,
  Metric,
  Category
} from './typedefs/rating';
// mongo -> graphql (models -> typedefs)

export const formatUserRating = (rating: RatingType): Rating => ({
  subject: rating.subject,
  courseNumber: rating.courseNumber,
  semester: rating.semester,
  year: rating.year,
  class: rating.class,

  createdBy: rating.google_id,

  metricName: rating.metricName,
  value: rating.value
});

// does mongo always return an array? single return val vs multiple val
export const formatUserRatings = (ratings: any[]): Rating[] => {
  return ratings.map(formatUserRatings);
};

// grandparent group by class -> done
// parent group by metricName
// group by category name -> aggregate metrics into count
const formatCategories = (metric: any): Category[] => {
  const categories: { [key: string]: number } = {};
  for (const rating of metric.ratings) {
    const category = rating.category;
    if (categories[category]) {
      categories[category] += 1;
    } else {
      categories[category] = 1;
    }
  }
  return Object.keys(categories).map(key => ({
    value: key,
    count: categories[key]
  }));
}

const formatMetrics = (ratings: any): Metric[] => {
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
  // use the first rating to get the class identifier (assume not empty)
  subject: ratings[0].subject,
  courseNumber: ratings[0].courseNumber,
  semester: ratings[0].semester,
  year: ratings[0].year,
  class: ratings[0].class,
  metrics: formatMetrics(ratings)
});

