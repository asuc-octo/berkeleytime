import { useCallback } from "react";

import { useMutation } from "@apollo/client/react";

import "@/lib/api/route-redirect";
import { IncrementRouteRedirectClickDocument } from "@/lib/generated/graphql";

export const useIncrementRouteRedirectClick = () => {
  const [mutate] = useMutation(IncrementRouteRedirectClickDocument);

  const incrementClick = useCallback(
    (redirectId: string) => mutate({ variables: { redirectId } }),
    [mutate]
  );

  return { incrementClick };
};
