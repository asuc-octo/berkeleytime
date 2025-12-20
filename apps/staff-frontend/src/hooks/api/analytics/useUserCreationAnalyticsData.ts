import { useQuery } from "@apollo/client";

import {
  USER_CREATION_ANALYTICS_DATA,
  UserCreationDataPoint,
} from "../../../lib/api/analytics";

interface UserCreationAnalyticsDataResponse {
  userCreationAnalyticsData: UserCreationDataPoint[];
}

export const useUserCreationAnalyticsData = () => {
  const query = useQuery<UserCreationAnalyticsDataResponse>(USER_CREATION_ANALYTICS_DATA);

  return {
    ...query,
    data: query.data?.userCreationAnalyticsData ?? [],
  };
};
