import { Types } from "mongoose";

import { BannerType } from "@repo/common/models";

export interface FormattedBanner {
  _id: string;
  text: string;
  link?: string;
  linkText?: string;
  persistent: boolean;
  reappearing: boolean;
  clickCount: number;
  dismissCount: number;
  viewCount: number;
  clickEventLogging: boolean;
  createdAt: string;
  updatedAt: string;
}

export const formatBanner = (
  banner: BannerType,
  viewCount: number = 0
): FormattedBanner => {
  return {
    _id: (banner._id as Types.ObjectId).toString(),
    text: banner.text,
    link: banner.link ?? undefined,
    linkText: banner.linkText ?? undefined,
    persistent: banner.persistent,
    reappearing: banner.reappearing ?? false,
    clickCount: banner.clickCount ?? 0,
    dismissCount: banner.dismissCount ?? 0,
    viewCount,
    clickEventLogging: banner.clickEventLogging ?? false,
    createdAt: banner.createdAt.toISOString(),
    updatedAt: banner.updatedAt.toISOString(),
  };
};
