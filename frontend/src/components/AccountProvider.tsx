import { useMemo } from "react";

import { useQuery } from "@apollo/client";

import AccountContext from "@/contexts/AccountContext";
import { GET_ACCOUNT } from "@/lib/api";

interface AccountProviderProps {
  children: React.ReactNode;
}

export default function AccountProvider({ children }: AccountProviderProps) {
  const { loading, error, data, client } = useQuery(GET_ACCOUNT);

  const signIn = () => {
    if (loading) return;

    window.location.href =
      "https://stanfurdtime.com/api/login?redirect_uri=http://localhost:3000/";
  };

  const signOut = async () => {
    try {
      await fetch("https://stanfurdtime.com/api/logout", {
        method: "POST",
        credentials: "include",
      });

      // Clear the Apollo GraphQL cache for the user query
      client.resetStore();
    } catch (error) {
      // TOOD: Handle error
      console.error(error);
    }
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
