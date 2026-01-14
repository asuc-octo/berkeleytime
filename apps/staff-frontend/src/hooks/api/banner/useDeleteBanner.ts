import { useMutation } from "@apollo/client";

import { ALL_BANNERS, DELETE_BANNER } from "../../../lib/api/banner";

interface DeleteBannerResponse {
  deleteBanner: boolean;
}

export const useDeleteBanner = () => {
  const [mutate, result] = useMutation<DeleteBannerResponse>(DELETE_BANNER, {
    refetchQueries: [ALL_BANNERS],
  });

  const deleteBanner = async (bannerId: string) => {
    const response = await mutate({
      variables: { bannerId },
    });
    return response.data?.deleteBanner;
  };

  return { deleteBanner, ...result };
};
