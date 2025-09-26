import { QueryHookOptions, useQuery } from "@apollo/client";

import { READ_PLANS, ReadPlanResponse } from "@/lib/api";

export const useReadPlans = (
  options?: Omit<QueryHookOptions<ReadPlanResponse>, "variables">
) => {
  const query = useQuery<ReadPlanResponse>(READ_PLANS, options);

  return {
    ...query,
    data: query.data?.planByUser,
  };
};
