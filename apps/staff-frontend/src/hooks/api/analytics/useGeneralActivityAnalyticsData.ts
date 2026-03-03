import { useQuery } from "@apollo/client";

import {
  GENERAL_ACTIVITY_ANALYTICS,
  GeneralActivityDataPoint,
} from "../../../lib/api/analytics";

interface GeneralActivityAnalyticsDataResponse {
  generalActivityAnalytics: GeneralActivityDataPoint[];
}

export const useGeneralActivityAnalyticsData = (days: number) => {
  const query = useQuery<GeneralActivityAnalyticsDataResponse>(
    GENERAL_ACTIVITY_ANALYTICS,
    { variables: { days } }
  );

  return {
    ...query,
    data: query.data?.generalActivityAnalytics ?? [],
  };
};
