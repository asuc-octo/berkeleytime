import { useMutation } from "@apollo/client";

import {
  ALL_ROUTE_REDIRECTS,
  RouteRedirect,
  UPDATE_ROUTE_REDIRECT,
  UpdateRouteRedirectInput,
} from "../../../lib/api/route-redirect";

interface UpdateRouteRedirectResponse {
  updateRouteRedirect: RouteRedirect;
}

export const useUpdateRouteRedirect = () => {
  const [mutate, result] = useMutation<UpdateRouteRedirectResponse>(
    UPDATE_ROUTE_REDIRECT,
    {
      refetchQueries: [ALL_ROUTE_REDIRECTS],
    }
  );

  const updateRouteRedirect = async (
    redirectId: string,
    input: UpdateRouteRedirectInput
  ) => {
    const response = await mutate({
      variables: { redirectId, input },
    });
    return response.data?.updateRouteRedirect;
  };

  return { updateRouteRedirect, ...result };
};
