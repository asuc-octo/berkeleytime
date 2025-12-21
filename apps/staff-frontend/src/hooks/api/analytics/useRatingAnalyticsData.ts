import { useQuery } from "@apollo/client";

import {
  RATING_ANALYTICS_DATA,
  RatingDataPoint,
} from "../../../lib/api/analytics";

interface RatingAnalyticsDataResponse {
  ratingAnalyticsData: RatingDataPoint[];
}

export const useRatingAnalyticsData = () => {
  const query = useQuery<RatingAnalyticsDataResponse>(RATING_ANALYTICS_DATA);

  return {
    ...query,
    data: query.data?.ratingAnalyticsData ?? [],
  };
};
