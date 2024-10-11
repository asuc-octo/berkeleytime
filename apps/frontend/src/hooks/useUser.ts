import { QueryHookOptions, useQuery } from "@apollo/client";

import { GET_USER, IUser } from "@/lib/api";

interface Data {
  user: IUser;
}

const useUser = (options?: QueryHookOptions<Data>) => {
  const query = useQuery<Data>(GET_USER, options);

  return {
    ...query,
    data: query.data?.user,
  };
};

export default useUser;
