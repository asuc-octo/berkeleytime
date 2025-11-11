import { useQuery } from "@apollo/client/react";

import { ReadScheduleDocument, ReadScheduleQuery, ReadScheduleQueryVariables } from "@/lib/generated/graphql";

export const useReadSchedule = (
  id: string,
  options?: useQuery.Options<ReadScheduleQuery, ReadScheduleQueryVariables>
) => {
  const query = useQuery(ReadScheduleDocument, {
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
