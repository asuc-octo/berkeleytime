import { QueryHookOptions, useQuery } from "@apollo/client";

import { READ_PLAN, ReadPlanResponse } from "@/lib/api";

export const useReadPlans = (
  options?: Omit<QueryHookOptions<ReadPlanResponse>, "variables">
) => {
  const query = useQuery<ReadPlanResponse>(READ_PLAN, options);

  return {
    ...query,
    data: query.data?.planByUser,
  };
};
