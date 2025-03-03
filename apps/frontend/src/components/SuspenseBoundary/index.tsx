import { ComponentPropsWithRef, Suspense } from "react";

import { Boundary, LoadingIndicator } from "@repo/theme";

export default function SuspenseBoundary({
  fallback,
  ...props
}: ComponentPropsWithRef<typeof Suspense>) {
  return (
    <Suspense
      fallback={
        fallback ?? (
          <Boundary>
            <LoadingIndicator size="lg" />
          </Boundary>
        )
      }
      {...props}
    />
  );
}
