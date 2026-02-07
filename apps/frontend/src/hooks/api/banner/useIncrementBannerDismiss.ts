import { useCallback } from "react";

import { useMutation } from "@apollo/client/react";

import "@/lib/api/banner";
import { IncrementBannerDismissDocument } from "@/lib/generated/graphql";

export const useIncrementBannerDismiss = () => {
  const [mutate] = useMutation(IncrementBannerDismissDocument);

  const incrementDismiss = useCallback(
    (bannerId: string) => mutate({ variables: { bannerId } }),
    [mutate]
  );

  return { incrementDismiss };
};
