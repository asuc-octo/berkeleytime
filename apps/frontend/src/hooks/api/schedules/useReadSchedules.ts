import { useQuery } from "@apollo/client/react";

import { READ_SCHEDULES, ReadSchedulesResponse } from "@/lib/api";

export const useReadSchedules = (
  options?: Omit<useQuery.Options<ReadSchedulesResponse>, "variables">
) => {
  const query = useQuery<ReadSchedulesResponse>(READ_SCHEDULES, options);

  return {
    ...query,
    data: query.data?.schedules,
  };
};
