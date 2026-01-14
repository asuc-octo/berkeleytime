import { useQuery } from "@apollo/client";

import {
  ALL_ROUTE_REDIRECTS,
  RouteRedirect,
} from "../../../lib/api/route-redirect";

interface AllRouteRedirectsResponse {
  allRouteRedirects: RouteRedirect[];
}

export const useAllRouteRedirects = () => {
  const query = useQuery<AllRouteRedirectsResponse>(ALL_ROUTE_REDIRECTS);

  return {
    ...query,
    data: query.data?.allRouteRedirects ?? [],
  };
};
