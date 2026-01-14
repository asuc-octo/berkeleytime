import { useQuery } from "@apollo/client/react";

import { READ_USER, ReadUserResponse } from "../../../lib/api/users";

export const useReadUser = () => {
  const query = useQuery<ReadUserResponse>(READ_USER);

  return {
    ...query,
    data: query.data?.user,
  };
};
