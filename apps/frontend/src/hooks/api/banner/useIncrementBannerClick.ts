import { useCallback } from "react";

import { useMutation } from "@apollo/client/react";

import "@/lib/api/banner";
import { IncrementBannerClickDocument } from "@/lib/generated/graphql";

export const useIncrementBannerClick = () => {
  const [mutate] = useMutation(IncrementBannerClickDocument);

  const incrementClick = useCallback(
    (bannerId: string) => mutate({ variables: { bannerId } }),
    [mutate]
  );

  return { incrementClick };
};
