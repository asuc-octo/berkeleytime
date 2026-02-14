import { useMutation } from "@apollo/client";

import {
  ALL_BANNERS_FOR_STAFF,
  Banner,
  UPDATE_BANNER,
  UpdateBannerInput,
} from "../../../lib/api/banner";

interface UpdateBannerResponse {
  updateBanner: Banner;
}

export const useUpdateBanner = () => {
  const [mutate, result] = useMutation<UpdateBannerResponse>(UPDATE_BANNER, {
    refetchQueries: [ALL_BANNERS_FOR_STAFF],
  });

  const updateBanner = async (bannerId: string, input: UpdateBannerInput) => {
    const response = await mutate({
      variables: { bannerId, input },
    });
    return response.data?.updateBanner;
  };

  return { updateBanner, ...result };
};
