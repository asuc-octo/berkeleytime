/**
 * Tracks page views as OTel spans with feature attribution.
 *
 * Renders nothing — mount inside the router tree (e.g. RootWrapper).
 * Each route change produces a "page.view" span with:
 *   - page.path:    the pathname ("/catalog/2024/fall/CS/61A")
 *   - page.route:   the route pattern ("/catalog/:year/:semester/...")
 *   - page.feature:  the high-level feature name ("catalog", "gradtrak", etc.)
 *
 * When OTel is not initialized the tracer is a no-op — zero overhead.
 */

import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { trace } from "@opentelemetry/api";

const tracer = trace.getTracer("berkeleytime-frontend");

/** Map a pathname to a feature name. */
function getFeature(pathname: string): string {
  const seg = pathname.split("/")[1] || "";
  switch (seg) {
    case "":
      return "landing";
    case "catalog":
      return "catalog";
    case "grades":
      return "grades";
    case "enrollment":
      return "enrollment";
    case "schedules":
      return "schedules";
    case "gradtrak":
      return "gradtrak";
    case "profile":
      return "profile";
    case "collection":
      return "collections";
    case "curated":
      return "curated";
    case "about":
      return "about";
    case "legal":
      return "legal";
    default:
      return "other";
  }
}

/** Collapse dynamic segments into a stable route pattern. */
function getRoutePattern(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return "/";

  const feature = parts[0];
  switch (feature) {
    case "catalog":
      // /catalog/:year/:semester/:subject/:courseNumber/:number/:sessionId
      return "/catalog" + (parts.length > 1 ? "/*" : "");
    case "schedules":
      return "/schedules" + (parts.length > 1 ? "/:scheduleId" : "");
    case "collection":
      return "/collection/:id" + (parts.length > 2 ? "/*" : "");
    case "gradtrak":
      return "/gradtrak" + (parts[1] ? `/${parts[1]}` : "");
    case "profile":
      return "/profile" + (parts[1] ? `/${parts[1]}` : "");
    default:
      return pathname;
  }
}

export default function RouteTracker() {
  const location = useLocation();
  const prevPathRef = useRef<string | null>(null);

  useEffect(() => {
    // Skip duplicate fires for the same pathname
    if (location.pathname === prevPathRef.current) return;
    prevPathRef.current = location.pathname;

    const feature = getFeature(location.pathname);
    const route = getRoutePattern(location.pathname);

    const span = tracer.startSpan("page.view", {
      attributes: {
        "page.path": location.pathname,
        "page.route": route,
        "page.feature": feature,
      },
    });
    span.end();
  }, [location.pathname]);

  return null;
}
