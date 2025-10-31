import { useQuery } from "@apollo/client/react";

import { READ_USER, ReadUserResponse } from "@/lib/api";

export const useReadUser = (options?: useQuery.Options<ReadUserResponse>) => {
  const query = useQuery<ReadUserResponse>(READ_USER, {
    fetchPolicy: "cache-first",
    ...options,
  });

  return {
    ...query,
    data: query.data?.user,
  };
};
