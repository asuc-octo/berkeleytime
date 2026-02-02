import { useEffect } from "react";

import { Outlet, ScrollRestoration, useLocation } from "react-router-dom";

import {
  useAllRouteRedirects,
  useIncrementRouteRedirectClick,
} from "@/hooks/api/route-redirect";

// Module-level tracking to prevent duplicate increments
let lastIncrementedPath: string | null = null;
let lastIncrementTime = 0;

/**
 * Root wrapper component that includes redirect handling.
 * Checks for route redirects on every navigation and redirects to external URLs if found.
 */
export default function RootWrapper() {
  const location = useLocation();
  const { data: redirects, loading } = useAllRouteRedirects();
  const { incrementClick } = useIncrementRouteRedirectClick();

  // Check for redirects immediately on route change
  useEffect(() => {
    // Don't check redirects while loading
    if (loading || !redirects) return;

    const currentPath = location.pathname;
    const now = Date.now();

    // Skip if we've already incremented for this path within the last 5 seconds
    if (lastIncrementedPath === currentPath && now - lastIncrementTime < 5000) {
      return;
    }

    // Find the first redirect that matches the current path
    const matchingRedirect = redirects.find(
      (redirect) => redirect.fromPath === currentPath
    );

    // If a match is found, increment click count and redirect to the external URL
    if (matchingRedirect) {
      lastIncrementedPath = currentPath;
      lastIncrementTime = now;
      incrementClick(matchingRedirect.id);
      window.location.href = matchingRedirect.toPath;
    }
  }, [location.pathname, redirects, loading, incrementClick]);

  return (
    <>
      <ScrollRestoration />
      <Outlet />
    </>
  );
}
