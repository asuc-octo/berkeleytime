import { ReactNode, useEffect, useRef } from "react";

import { CombinedGraphQLErrors } from "@apollo/client";

import UserContext from "@/contexts/UserContext";
import { useReadUser } from "@/hooks/api";
import {
  DEV_AUTH_LOGIN_ROUTE,
  clearStoredDevUserId,
  getStoredDevUserId,
} from "@/utils/devAuth";

interface UserProviderProps {
  children: ReactNode;
}

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

    // A GraphQL error (e.g. "Unauthorized" when logged out) means the backend
    // answered normally — only a transport-level failure means it is down, in
    // which case the SPA fallback would serve the app on the login route
    // itself, nesting redirect_uri forever.
    if (error && !CombinedGraphQLErrors.is(error)) return;
    if (window.location.pathname.startsWith(DEV_AUTH_LOGIN_ROUTE)) return;

    // If a previous dev auth attempt failed (e.g. stored user was deleted),
    // clear the stored dev user and do not try to auto-login again.
    const searchParams = new URLSearchParams(window.location.search);
    const devAuthError = searchParams.get("devAuthError");
    if (devAuthError && !autoLoginAttempted.current) {
      autoLoginAttempted.current = true;
      clearStoredDevUserId();

      // Optionally clean up the URL to remove the error flag.
      searchParams.delete("devAuthError");
      const newSearch = searchParams.toString();
      const newUrl =
        window.location.pathname + (newSearch ? `?${newSearch}` : "");
      window.history.replaceState({}, "", newUrl);

      return;
    }

    if (autoLoginAttempted.current) return;

    const savedUserId = getStoredDevUserId();
    if (savedUserId) {
      autoLoginAttempted.current = true;
      const redirectUri = window.location.pathname + window.location.search;
      window.location.href = `${DEV_AUTH_LOGIN_ROUTE}?userId=${savedUserId}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    }
  }, [loading, user, error]);

  return (
    <UserContext.Provider value={{ user, loading, error }}>
      {children}
    </UserContext.Provider>
  );
}
