import { useQuery } from "@apollo/client";

import {
  RATING_METRICS_ANALYTICS_DATA,
  RatingMetricDataPoint,
} from "../../../lib/api/analytics";

interface RatingMetricsAnalyticsDataResponse {
  ratingMetricsAnalyticsData: RatingMetricDataPoint[];
}

export const useRatingMetricsAnalyticsData = () => {
  const query = useQuery<RatingMetricsAnalyticsDataResponse>(
    RATING_METRICS_ANALYTICS_DATA
  );

  return {
    ...query,
    data: query.data?.ratingMetricsAnalyticsData ?? [],
  };
};
