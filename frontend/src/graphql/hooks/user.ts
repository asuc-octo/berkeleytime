import { useCallback } from 'react';
import {
  DeleteUserMutationHookResult,
  GetUserDocument,
  LoginMutationHookResult,
  LogoutMutationHookResult,
  UpdateUserMutationVariables,
  useDeleteUserMutation,
  useGetUserQuery,
  useLoginMutation,
  useLogoutMutation,
  UserProfileFragment,
  useUpdateUserMutation,
} from '../graphql';

export type UserInfo = {
  /**
   * This may change once the user query is loaded. This will
   * be false while the user's login state is undetermined.
   */
  isLoggedIn: boolean;
  loading: boolean;
  /** This is null while loading, or if the user isn't logged in. */
  user: UserProfileFragment | null;
};

/**
 * Gets the current user or the login status. Note that the
 * `isLoggedIn` parameter and `user` parameter will be
 * `false` and `null` respectively while the user's authorization
 * is unknown/loading. You can check this using the `loading` param.
 *
 * @example
 * const { user, isLoggedIn, loading } = useUser();
 */
export const useUser = (): UserInfo => {
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
 * Deletes the user, so logically, be careful with this and display some
 * confirmation prompt before executing.
 */
export const useDeleteUser = (): DeleteUserMutationHookResult => {
  return useDeleteUserMutation({
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
