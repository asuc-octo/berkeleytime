import { createContext, useContext, ReactNode } from "react";

import { useQuery, gql } from "@apollo/client";

export interface IUser {
  _id: string;
  email: string;
  name: string | null;
  student: boolean;
}

export interface UserContextType {
  user: IUser | undefined;
  loading: boolean;
  error?: Error;
}

const UserContext = createContext<UserContextType | null>(null);

const READ_USER = gql`
  query GetUser {
    user {
      _id
      email
      name
      student
    }
  }
`;

export function useUser() {
  const userContext = useContext(UserContext);

  if (!userContext)
    throw new Error("useUser must be used within a UserProvider");

  return userContext;
}

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const { data, loading, error } = useQuery(READ_USER, {
    fetchPolicy: "cache-and-network",
  });

  return (
    <UserContext.Provider
      value={{
        user: data?.user,
        loading,
        error: error as Error | undefined,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export default UserContext;

