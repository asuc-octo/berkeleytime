import { useQuery } from "@apollo/client";

import {
  SCHEDULER_ANALYTICS_DATA,
  SchedulerAnalyticsDataPoint,
} from "../../../lib/api/analytics";

interface SchedulerAnalyticsDataResponse {
  schedulerAnalyticsData: SchedulerAnalyticsDataPoint[];
}

export const useSchedulerAnalyticsData = () => {
  const query = useQuery<SchedulerAnalyticsDataResponse>(
    SCHEDULER_ANALYTICS_DATA
  );

  return {
    ...query,
    data: query.data?.schedulerAnalyticsData ?? [],
  };
};
