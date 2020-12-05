import { useGetUserQuery, UserProfileFragment } from '../../graphql/graphql';

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

export const useAuth = (): {
  login: (token: string) => void;
  logout: () => void;
} => {
  const login = () => {};
  const logout = () => {};

  return { login, logout };
};
