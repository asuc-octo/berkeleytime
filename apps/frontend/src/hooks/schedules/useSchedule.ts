import { QueryHookOptions, useQuery } from "@apollo/client";

import {
  GET_SCHEDULE,
  GetScheduleResponse,
  ScheduleIdentifier,
} from "@/lib/api";

export const useSchedule = (
  id: ScheduleIdentifier,
  options?: Omit<QueryHookOptions<GetScheduleResponse>, "variables">
) => {
  const query = useQuery<GetScheduleResponse>(GET_SCHEDULE, {
    ...options,
    variables: {
      id,
    },
  });

  return {
    ...query,
    data: query.data?.schedule,
  };
};
