import { Types } from "mongoose";

import { NavItemType } from "@repo/common/models";

export interface FormattedNavItem {
  _id: string;
  label: string;
  url: string;
  badgeText: string | null;
  order: number;
  visible: boolean;
  clickCount: number;
  createdAt: string;
  updatedAt: string;
}

export const formatNavItem = (navItem: NavItemType): FormattedNavItem => {
  return {
    _id: (navItem._id as Types.ObjectId).toString(),
    label: navItem.label,
    url: navItem.url,
    badgeText: navItem.badgeText ?? null,
    order: navItem.order ?? 0,
    visible: navItem.visible ?? true,
    clickCount: navItem.clickCount ?? 0,
    createdAt: navItem.createdAt.toISOString(),
    updatedAt: navItem.updatedAt.toISOString(),
  };
};
