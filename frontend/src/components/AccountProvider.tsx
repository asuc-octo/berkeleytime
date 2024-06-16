import { ReactNode, useMemo } from "react";

import { useQuery } from "@apollo/client";

import AccountContext from "@/contexts/AccountContext";
import { GET_ACCOUNT } from "@/lib/api";

interface AccountProviderProps {
  children: ReactNode;
}

export default function AccountProvider({ children }: AccountProviderProps) {
  const { loading, error, data } = useQuery(GET_ACCOUNT);

  const signIn = (redirectURI?: string) => {
    if (loading) return;

    redirectURI =
      redirectURI ?? window.location.pathname + window.location.search;

    window.location.href = `${window.location.origin}/api/login?redirect_uri=${redirectURI}`;
  };

  const signOut = async (redirectURI?: string) => {
    redirectURI =
      redirectURI ?? window.location.pathname + window.location.search;

    window.location.href = `${window.location.origin}/api/logout?redirect_uri=${redirectURI}`;
  };

  const account = useMemo(() => data?.user, [data]);

  return (
    <AccountContext.Provider
      value={{ account, loading, error, signIn, signOut }}
    >
      {children}
    </AccountContext.Provider>
  );
}
