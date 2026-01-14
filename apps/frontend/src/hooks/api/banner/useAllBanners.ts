import { useQuery } from "@apollo/client/react";

import "@/lib/api/banner";
import {
  GetAllBannersDocument,
  GetAllBannersQuery,
} from "@/lib/generated/graphql";

export const useAllBanners = (
  options?: Omit<useQuery.Options<GetAllBannersQuery>, "variables" | "query">
) => {
  const query = useQuery<GetAllBannersQuery>(GetAllBannersDocument, {
    fetchPolicy: "cache-first",
    ...options,
  });

  return {
    ...query,
    data: query.data?.allBanners,
  };
};
