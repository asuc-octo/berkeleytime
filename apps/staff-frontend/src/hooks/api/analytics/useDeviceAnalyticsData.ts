import { useQuery } from "@apollo/client";

import {
  DEVICE_ANALYTICS,
  DeviceAnalyticsData,
} from "../../../lib/api/analytics";

interface DeviceAnalyticsDataResponse {
  deviceAnalyticsData: DeviceAnalyticsData;
}

export const useDeviceAnalyticsData = (days: number, targetType?: string) => {
  const query = useQuery<DeviceAnalyticsDataResponse>(DEVICE_ANALYTICS, {
    variables: { days, targetType },
  });

  return {
    ...query,
    data: query.data?.deviceAnalyticsData ?? null,
  };
};
