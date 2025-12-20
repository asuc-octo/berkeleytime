import { useQuery } from "@apollo/client";

import {
  CLOUDFLARE_ANALYTICS_DATA,
  CloudflareAnalyticsData,
} from "../../../lib/api/analytics";

interface CloudflareAnalyticsDataResponse {
  cloudflareAnalyticsData: CloudflareAnalyticsData;
}

export const useCloudflareAnalyticsData = (days: number, granularity: "day" | "hour" = "day") => {
  const query = useQuery<CloudflareAnalyticsDataResponse>(CLOUDFLARE_ANALYTICS_DATA, {
    variables: { days, granularity },
  });

  return {
    ...query,
    data: query.data?.cloudflareAnalyticsData ?? null,
  };
};
