import { useQuery } from "@apollo/client";

import { ALL_AD_TARGETS, AdTarget } from "../../../lib/api/ad-target";

interface AllAdTargetsResponse {
  allAdTargets: AdTarget[];
}

export const useAllAdTargets = () => {
  const query = useQuery<AllAdTargetsResponse>(ALL_AD_TARGETS);

  return {
    ...query,
    data: query.data?.allAdTargets ?? [],
  };
};
