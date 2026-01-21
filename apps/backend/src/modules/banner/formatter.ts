import { Types } from "mongoose";

import { BannerType } from "@repo/common";

export interface FormattedBanner {
  _id: string;
  text: string;
  link?: string;
  linkText?: string;
  persistent: boolean;
  reappearing: boolean;
  createdAt: string;
  updatedAt: string;
}

export const formatBanner = (banner: BannerType): FormattedBanner => {
  return {
    _id: (banner._id as Types.ObjectId).toString(),
    text: banner.text,
    link: banner.link ?? undefined,
    linkText: banner.linkText ?? undefined,
    persistent: banner.persistent,
    reappearing: banner.reappearing ?? false,
    createdAt: banner.createdAt.toISOString(),
    updatedAt: banner.updatedAt.toISOString(),
  };
};
