import { useMutation } from "@apollo/client";

import {
  ALL_BANNERS_FOR_STAFF,
  Banner,
  CREATE_BANNER,
  CreateBannerInput,
} from "../../../lib/api/banner";

interface CreateBannerResponse {
  createBanner: Banner;
}

export const useCreateBanner = () => {
  const [mutate, result] = useMutation<CreateBannerResponse>(CREATE_BANNER, {
    refetchQueries: [ALL_BANNERS_FOR_STAFF],
  });

  const createBanner = async (input: CreateBannerInput) => {
    const response = await mutate({
      variables: { input },
    });
    return response.data?.createBanner;
  };

  return { createBanner, ...result };
};
