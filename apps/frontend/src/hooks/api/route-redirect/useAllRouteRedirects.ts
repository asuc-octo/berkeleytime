import { useQuery } from "@apollo/client/react";

import "@/lib/api/route-redirect";
import {
  GetAllRouteRedirectsDocument,
  GetAllRouteRedirectsQuery,
} from "@/lib/generated/graphql";

export const useAllRouteRedirects = (
  options?: Omit<
    useQuery.Options<GetAllRouteRedirectsQuery>,
    "variables" | "query"
  >
) => {
  const query = useQuery<GetAllRouteRedirectsQuery>(
    GetAllRouteRedirectsDocument,
    {
      fetchPolicy: "cache-first",
      ...options,
    }
  );

  return {
    ...query,
    data: query.data?.allRouteRedirects,
  };
};
