import { useCallback } from 'react';
import {
  UpdateUserMutationVariables,
  useGetUserQuery,
  UserProfileFragment,
  useUpdateUserMutation,
} from '../graphql';

export const useUser = (): {
  /** This may change once the user query is loaded. */
  isLoggedIn: boolean;
  loading: boolean;
  /** This is null while loading, or if the user isn't logged in. */
  user: UserProfileFragment | null;
} => {
  const { data, loading } = useGetUserQuery({
    errorPolicy: 'all',
  });

  return {
    isLoggedIn: !!data?.user,
    loading,
    user: data?.user ?? null,
  };
};

export const useUpdateUser = () => {
  const [updateUser] = useUpdateUserMutation();
  const optimisticUpdateUser = useCallback(
    (user: UserProfileFragment, variables: UpdateUserMutationVariables) =>
      updateUser({
        variables: variables,
        optimisticResponse: {
          __typename: 'Mutation',
          updateUser: {
            __typename: 'UpdateUser',
            user: {
              ...user,
              ...Object.fromEntries(
                Object.entries(variables).filter(([k, v]) => v !== null)
              ),
            },
          },
        },
      }),
    [updateUser]
  );

  return optimisticUpdateUser;
};
