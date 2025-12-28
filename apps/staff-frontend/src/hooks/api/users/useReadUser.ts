import { useQuery } from "@apollo/client/react";

import { READ_USER, ReadUserResponse } from "../../../lib/api/users";

export const useReadUser = (options?: useQuery.Options<ReadUserResponse>) => {
  const query = useQuery<ReadUserResponse>(READ_USER, options);

  return {
    ...query,
    data: query.data?.user,
  };
};
