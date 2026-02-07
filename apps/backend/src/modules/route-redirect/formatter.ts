import { Types } from "mongoose";

import { RouteRedirectType } from "@repo/common/models";

export interface FormattedRouteRedirect {
  _id: string;
  fromPath: string;
  toPath: string;
  clickCount: number;
  clickEventLogging: boolean;
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
    clickEventLogging: redirect.clickEventLogging ?? false,
    createdAt: redirect.createdAt.toISOString(),
    updatedAt: redirect.updatedAt.toISOString(),
  };
};
