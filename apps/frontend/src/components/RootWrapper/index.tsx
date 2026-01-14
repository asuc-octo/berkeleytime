import { useEffect } from "react";

import { Outlet, useLocation } from "react-router-dom";

import { useAllRouteRedirects } from "@/hooks/api/route-redirect";

/**
 * Root wrapper component that includes redirect handling.
 * Checks for route redirects on every navigation and redirects to external URLs if found.
 */
export default function RootWrapper() {
  const location = useLocation();
  const { data: redirects, loading } = useAllRouteRedirects();

  // Check for redirects immediately on route change
  useEffect(() => {
    // Don't check redirects while loading
    if (loading || !redirects) return;

    // Get the current pathname
    const currentPath = location.pathname;

    // Find the first redirect that matches the current path
    const matchingRedirect = redirects.find(
      (redirect) => redirect.fromPath === currentPath
    );

    // If a match is found, redirect to the external URL
    if (matchingRedirect) {
      window.location.href = matchingRedirect.toPath;
    }
  }, [location.pathname, redirects, loading]);

  return <Outlet />;
}
