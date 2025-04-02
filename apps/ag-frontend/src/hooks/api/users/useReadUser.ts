import { QueryHookOptions, useQuery } from "@apollo/client";

import { READ_USER, ReadUserResponse } from "@/lib/api";

export const useReadUser = (options?: QueryHookOptions<ReadUserResponse>) => {
  const query = useQuery<ReadUserResponse>(READ_USER, options);

  return {
    ...query,
    data: query.data?.user,
  };
};
