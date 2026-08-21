import { Types } from "mongoose";

import { RouteRedirectType } from "@repo/common/models";

export interface FormattedRouteRedirect {
  _id: string;
  fromPath: string;
  toPath: string;
  clickCount: number;
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
    clickCount: redirect.clickCount ?? 0,
    createdAt: redirect.createdAt.toISOString(),
    updatedAt: redirect.updatedAt.toISOString(),
  };
};
