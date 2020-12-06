import { useCallback } from 'react';
import {
  GetUserDocument,
  LoginMutationHookResult,
  LogoutMutationHookResult,
  UpdateUserMutationVariables,
  useGetUserQuery,
  useLoginMutation,
  useLogoutMutation,
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

/**
 * Returns a function which logs in the user
 */
export const useLogin = (): LoginMutationHookResult => {
  return useLoginMutation({
    update(cache, { data }) {
      const user = data?.login?.user;
      cache.writeQuery({
        query: GetUserDocument,
        data: { user },
      });
    },
  });
};

/**
 * Returns a function which logs out
 */
export const useLogout = (): LogoutMutationHookResult => {
  return useLogoutMutation({
    update(cache) {
      // Ensure there is no user in the cache after a log out
      cache.writeQuery({
        query: GetUserDocument,
        data: {
          user: null,
        },
      });
    },
  });
};

/**
 * Returns a function for which you can pass a user, and the properties of the
 * user which you wish to update, and it'll run an optimistically updated
 * mutation.
 */
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
