import { useQuery } from "@apollo/client/react";

import {
  READ_SCHEDULE,
  ReadScheduleResponse,
  ScheduleIdentifier,
} from "@/lib/api";

export const useReadSchedule = (
  id: ScheduleIdentifier,
  options?: Omit<useQuery.Options<ReadScheduleResponse>, "variables">
) => {
  const query = useQuery<ReadScheduleResponse>(READ_SCHEDULE, {
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
