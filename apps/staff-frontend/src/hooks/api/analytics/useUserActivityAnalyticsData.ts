import { useQuery } from "@apollo/client";

import {
  USER_ACTIVITY_ANALYTICS_DATA,
  UserActivityDataPoint,
} from "../../../lib/api/analytics";

interface UserActivityAnalyticsDataResponse {
  userActivityAnalyticsData: UserActivityDataPoint[];
}

export const useUserActivityAnalyticsData = () => {
  const query = useQuery<UserActivityAnalyticsDataResponse>(
    USER_ACTIVITY_ANALYTICS_DATA
  );

  return {
    ...query,
    data: query.data?.userActivityAnalyticsData ?? [],
  };
};
