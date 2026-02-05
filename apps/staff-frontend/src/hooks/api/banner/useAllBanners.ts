import { useQuery } from "@apollo/client";

import { ALL_BANNERS_FOR_STAFF, Banner } from "../../../lib/api/banner";

interface AllBannersForStaffResponse {
  allBannersForStaff: Banner[];
}

export const useAllBanners = () => {
  const query = useQuery<AllBannersForStaffResponse>(ALL_BANNERS_FOR_STAFF);

  return {
    ...query,
    data: query.data?.allBannersForStaff ?? [],
  };
};
