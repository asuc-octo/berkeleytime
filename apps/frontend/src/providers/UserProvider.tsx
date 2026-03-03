import { ReactNode, useEffect, useRef } from "react";

import UserContext from "@/contexts/UserContext";
import { useReadUser } from "@/hooks/api";

interface UserProviderProps {
  children: ReactNode;
}

const DEV_AUTH_STORAGE_KEY = "bt.devAuth.userId";

export default function UserProvider({ children }: UserProviderProps) {
  const {
    data: user,
    loading,
    error,
  } = useReadUser({
    fetchPolicy: "cache-and-network",
  });

  const autoLoginAttempted = useRef(false);

  // Auto-login in dev mode if we have a saved user ID but no session
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    if (loading) return;
    if (user) return;
    if (autoLoginAttempted.current) return;

    const savedUserId = localStorage.getItem(DEV_AUTH_STORAGE_KEY);
    if (savedUserId) {
      autoLoginAttempted.current = true;
      const redirectUri = window.location.pathname + window.location.search;
      window.location.href = `/api/dev/login?userId=${savedUserId}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    }
  }, [loading, user]);

  return (
    <UserContext.Provider value={{ user, loading, error }}>
      {children}
    </UserContext.Provider>
  );
}
