import { Types } from "mongoose";

import { RouteRedirectType } from "@repo/common";

export interface FormattedRouteRedirect {
  _id: string;
  fromPath: string;
  toPath: string;
  createdAt: string;
  updatedAt: string;
}

export const formatRouteRedirect = (
  redirect: RouteRedirectType
): FormattedRouteRedirect => {
  return {
    _id: (redirect._id as Types.ObjectId).toString(),
    fromPath: redirect.fromPath,
    toPath: redirect.toPath,
    createdAt: redirect.createdAt.toISOString(),
    updatedAt: redirect.updatedAt.toISOString(),
  };
};
