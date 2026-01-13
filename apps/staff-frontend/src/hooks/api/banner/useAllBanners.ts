import { useQuery } from "@apollo/client";

import { ALL_BANNERS, Banner } from "../../../lib/api/banner";

interface AllBannersResponse {
  allBanners: Banner[];
}

export const useAllBanners = () => {
  const query = useQuery<AllBannersResponse>(ALL_BANNERS);

  return {
    ...query,
    data: query.data?.allBanners ?? [],
  };
};
