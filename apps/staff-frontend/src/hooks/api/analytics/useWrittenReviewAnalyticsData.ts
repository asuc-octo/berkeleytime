import { useQuery } from "@apollo/client";

import {
  WRITTEN_REVIEW_ANALYTICS,
  WrittenReviewAnalyticsData,
} from "../../../lib/api/analytics";

interface WrittenReviewAnalyticsDataResponse {
  writtenReviewAnalytics: WrittenReviewAnalyticsData;
}

export const useWrittenReviewAnalyticsData = () => {
  const query = useQuery<WrittenReviewAnalyticsDataResponse>(
    WRITTEN_REVIEW_ANALYTICS
  );

  return {
    ...query,
    data: query.data?.writtenReviewAnalytics ?? null,
  };
};
