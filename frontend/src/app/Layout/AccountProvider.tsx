import { gql, useQuery } from "@apollo/client";

import AccountContext from "@/contexts/AccountContext";

interface AccountProviderProps {
  children: React.ReactNode;
}

const GET_ACCOUNT = gql`
  query GetAccount {
    user {
      id
    }
  }
`;

export default function AccountProvider({ children }: AccountProviderProps) {
  const { loading, error, data } = useQuery(GET_ACCOUNT);

  const signIn = () => {
    // TODO
  };

  const signOut = () => {
    // TODO
  };

  return (
    <AccountContext.Provider value={{}}>{children}</AccountContext.Provider>
  );
}
