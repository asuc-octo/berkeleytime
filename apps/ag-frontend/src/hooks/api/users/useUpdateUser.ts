import { useCallback } from "react";

import { MutationHookOptions, useMutation } from "@apollo/client";

import { IUserInput, UPDATE_USER, UpdateUserResponse } from "@/lib/api";

export const useUpdateUser = () => {
  const mutation = useMutation<UpdateUserResponse>(UPDATE_USER, {
    update(cache, { data }) {
      if (!data?.updateUser) return;

      cache.modify({
        fields: {
          user: () => data.updateUser,
        },
      });
    },
  });

  const updateUser = useCallback(
    async (
      user: Partial<IUserInput>,
      options?: Omit<MutationHookOptions<UpdateUserResponse>, "variables">
    ) => {
      const mutate = mutation[0];

      return await mutate({
        ...options,
        variables: { user },
      });
    },
    [mutation]
  );

  return [updateUser, mutation[1]] as [
    mutate: typeof updateUser,
    result: (typeof mutation)[1],
  ];
};
