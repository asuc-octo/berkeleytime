import { QueryHookOptions, useQuery } from "@apollo/client";

import { GET_SCHEDULES, GetSchedulesResponse } from "@/lib/api";

const useSchedules = (
  options?: Omit<QueryHookOptions<GetSchedulesResponse>, "variables">
) => {
  const query = useQuery<GetSchedulesResponse>(GET_SCHEDULES, options);

  return {
    ...query,
    data: query.data?.schedules,
  };
};

export default useSchedules;
