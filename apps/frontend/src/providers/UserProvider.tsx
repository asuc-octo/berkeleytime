import { ReactNode } from "react";

import UserContext from "@/contexts/UserContext";
import { useReadUser } from "@/hooks/api";

interface UserProviderProps {
  children: ReactNode;
}

export default function UserProvider({ children }: UserProviderProps) {
  const { data: user, loading, error } = useReadUser({
    fetchPolicy: "cache-and-network",
  });

  return (
    <UserContext.Provider value={{ user, loading, error }}>
      {children}
    </UserContext.Provider>
  );
}
