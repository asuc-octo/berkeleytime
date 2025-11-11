import { useQuery } from "@apollo/client/react";

import { ReadSchedulesQueryVariables, ReadSchedulesDocument, ReadSchedulesQuery } from "@/lib/generated/graphql";

export const useReadSchedules = (
  options?: Omit<useQuery.Options<ReadSchedulesQuery, ReadSchedulesQueryVariables>, "variables">
) => {
  const query = useQuery(ReadSchedulesDocument, options);

  return {
    ...query,
    data: query.data?.schedules,
  };
};
