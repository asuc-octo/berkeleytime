import { ReactNode } from "react";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useTracking } from "@/hooks/api/tracking/useTracking";

/**
 * Catches uncaught render errors anywhere in the Catalog page tree (including
 * the embedded class detail view) and tracks them as page_error so a broken
 * page shows up in course-discovery reliability metrics instead of just a
 * blank screen no one hears about.
 */
export default function CatalogErrorBoundary({
  children,
}: {
  children: ReactNode;
}) {
  const { trackEvent } = useTracking();

  return (
    <ErrorBoundary
      onError={(error) =>
        trackEvent("page_error", "course-discovery", undefined, {
          message: error.message?.slice(0, 200),
          name: error.name,
        })
      }
    >
      {children}
    </ErrorBoundary>
  );
}
