import { useQuery } from "@apollo/client";

import {
  OPTIONAL_RESPONSE_ANALYTICS_DATA,
  OptionalResponseDataPoint,
} from "../../../lib/api/analytics";

interface OptionalResponseAnalyticsDataResponse {
  optionalResponseAnalyticsData: OptionalResponseDataPoint[];
}

export const useOptionalResponseAnalyticsData = () => {
  const query = useQuery<OptionalResponseAnalyticsDataResponse>(
    OPTIONAL_RESPONSE_ANALYTICS_DATA
  );

  return {
    ...query,
    data: query.data?.optionalResponseAnalyticsData ?? [],
  };
};
