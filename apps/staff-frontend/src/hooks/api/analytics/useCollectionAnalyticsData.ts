import { useQuery } from "@apollo/client";

import {
  COLLECTION_ANALYTICS_DATA,
  CollectionAnalyticsData,
} from "../../../lib/api/analytics";

interface CollectionAnalyticsDataResponse {
  collectionAnalyticsData: CollectionAnalyticsData;
}

export const useCollectionAnalyticsData = () => {
  const query = useQuery<CollectionAnalyticsDataResponse>(COLLECTION_ANALYTICS_DATA);

  return {
    ...query,
    data: query.data?.collectionAnalyticsData ?? null,
  };
};
