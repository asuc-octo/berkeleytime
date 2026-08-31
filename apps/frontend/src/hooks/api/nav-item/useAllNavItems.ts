import { useQuery } from "@apollo/client/react";

import "@/lib/api/nav-item";
import {
  GetAllNavItemsDocument,
  GetAllNavItemsQuery,
} from "@/lib/generated/graphql";

export const useAllNavItems = (
  options?: Omit<useQuery.Options<GetAllNavItemsQuery>, "variables" | "query">
) => {
  const query = useQuery<GetAllNavItemsQuery>(GetAllNavItemsDocument, {
    fetchPolicy: "cache-first",
    ...options,
  });

  return {
    ...query,
    data: query.data?.allNavItems,
  };
};
