import { useQuery } from "@apollo/client";

import {
  GRADTRAK_ANALYTICS_DATA,
  GradTrakAnalyticsDataPoint,
} from "../../../lib/api/analytics";

interface GradTrakAnalyticsDataResponse {
  gradTrakAnalyticsData: GradTrakAnalyticsDataPoint[];
}

export const useGradTrakAnalyticsData = () => {
  const query = useQuery<GradTrakAnalyticsDataResponse>(GRADTRAK_ANALYTICS_DATA);

  return {
    ...query,
    data: query.data?.gradTrakAnalyticsData ?? [],
  };
};
