import { useMutation } from "@apollo/client";

import {
  ALL_ROUTE_REDIRECTS,
  DELETE_ROUTE_REDIRECT,
} from "../../../lib/api/route-redirect";

interface DeleteRouteRedirectResponse {
  deleteRouteRedirect: boolean;
}

export const useDeleteRouteRedirect = () => {
  const [mutate, result] = useMutation<DeleteRouteRedirectResponse>(
    DELETE_ROUTE_REDIRECT,
    {
      refetchQueries: [ALL_ROUTE_REDIRECTS],
    }
  );

  const deleteRouteRedirect = async (redirectId: string) => {
    const response = await mutate({
      variables: { redirectId },
    });
    return response.data?.deleteRouteRedirect;
  };

  return { deleteRouteRedirect, ...result };
};
