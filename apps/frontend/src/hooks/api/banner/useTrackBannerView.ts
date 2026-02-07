import { useCallback } from "react";

import { useMutation } from "@apollo/client/react";

import "@/lib/api/banner";
import { TrackBannerViewDocument } from "@/lib/generated/graphql";

export const useTrackBannerView = () => {
  const [mutate] = useMutation(TrackBannerViewDocument);

  const trackView = useCallback(
    (bannerId: string) => mutate({ variables: { bannerId } }),
    [mutate]
  );

  return { trackView };
};
