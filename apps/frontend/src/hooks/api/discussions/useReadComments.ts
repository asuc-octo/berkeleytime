import { QueryHookOptions, useQuery } from "@apollo/client";

import { READ_SCHEDULES, ReadSchedulesResponse } from "@/lib/api";

export const useReadSchedules = (
  options?: Omit<QueryHookOptions<ReadSchedulesResponse>, "variables">
) => {
  const query = useQuery<ReadSchedulesResponse>(READ_SCHEDULES, options);

  return {
    ...query,
    data: query.data?.schedules,
  };
};
