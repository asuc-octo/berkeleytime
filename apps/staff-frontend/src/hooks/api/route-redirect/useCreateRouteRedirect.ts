import { useMutation } from "@apollo/client";

import {
  ALL_ROUTE_REDIRECTS,
  CREATE_ROUTE_REDIRECT,
  CreateRouteRedirectInput,
  RouteRedirect,
} from "../../../lib/api/route-redirect";

interface CreateRouteRedirectResponse {
  createRouteRedirect: RouteRedirect;
}

export const useCreateRouteRedirect = () => {
  const [mutate, result] = useMutation<CreateRouteRedirectResponse>(
    CREATE_ROUTE_REDIRECT,
    {
      refetchQueries: [ALL_ROUTE_REDIRECTS],
    }
  );

  const createRouteRedirect = async (input: CreateRouteRedirectInput) => {
    const response = await mutate({
      variables: { input },
    });
    return response.data?.createRouteRedirect;
  };

  return { createRouteRedirect, ...result };
};
