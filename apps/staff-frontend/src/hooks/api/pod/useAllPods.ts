import { useQuery } from "@apollo/client";

import { ALL_PODS, Pod } from "../../../lib/api/pod";

interface AllPodsResponse {
  allPods: Pod[];
}

export const useAllPods = () => {
  const query = useQuery<AllPodsResponse>(ALL_PODS);

  return {
    ...query,
    data: query.data?.allPods ?? [],
  };
};
