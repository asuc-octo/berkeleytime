import { QueryHookOptions, useQuery } from "@apollo/client";

import { GET_SCHEDULES, ISchedule } from "@/lib/api";

interface Data {
  schedules: ISchedule[];
}

const useSchedules = (options?: QueryHookOptions<Data>) => {
  const query = useQuery<Data>(GET_SCHEDULES, options);

  return {
    ...query,
    data: query.data?.schedules,
  };
};

export default useSchedules;
