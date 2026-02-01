import { GraphQLError } from "graphql";

import { BannerModel, StaffMemberModel } from "@repo/common/models";

import { formatBanner } from "./formatter";

// Context interface for authenticated requests
export interface BannerRequestContext {
  user: {
    _id: string;
    isAuthenticated: boolean;
  };
}

// Helper to verify the current user is a staff member
export const requireStaffMember = async (context: BannerRequestContext) => {
  if (!context.user?._id) {
    throw new GraphQLError("Not authenticated", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  const staffMember = await StaffMemberModel.findOne({
    userId: context.user._id,
  }).lean();

  if (!staffMember) {
    throw new GraphQLError("Only staff members can perform this action", {
      extensions: { code: "FORBIDDEN" },
    });
  }

  return staffMember;
};

export interface CreateBannerInput {
  text: string;
  link?: string | null;
  linkText?: string | null;
  persistent: boolean;
  reappearing: boolean;
}

export interface UpdateBannerInput {
  text?: string | null;
  link?: string | null;
  linkText?: string | null;
  persistent?: boolean | null;
  reappearing?: boolean | null;
}

export const getAllBanners = async () => {
  const banners = await BannerModel.find().sort({ createdAt: -1 });

  return banners.map(formatBanner);
};

export const createBanner = async (
  context: BannerRequestContext,
  input: CreateBannerInput
) => {
  // Verify caller is a staff member
  await requireStaffMember(context);

  const banner = await BannerModel.create({
    text: input.text,
    link: input.link || undefined,
    linkText: input.linkText || undefined,
    persistent: input.persistent,
    reappearing: input.reappearing,
  });

  return formatBanner(banner);
};

export const updateBanner = async (
  context: BannerRequestContext,
  bannerId: string,
  input: UpdateBannerInput
) => {
  // Verify caller is a staff member
  await requireStaffMember(context);

  const updateData: Record<string, unknown> = {};
  if (input.text !== null && input.text !== undefined) {
    updateData.text = input.text;
  }
  if (input.link !== null && input.link !== undefined) {
    updateData.link = input.link || undefined;
  }
  if (input.linkText !== null && input.linkText !== undefined) {
    updateData.linkText = input.linkText || undefined;
  }
  if (input.persistent !== null && input.persistent !== undefined) {
    updateData.persistent = input.persistent;
  }
  if (input.reappearing !== null && input.reappearing !== undefined) {
    updateData.reappearing = input.reappearing;
  }

  const banner = await BannerModel.findByIdAndUpdate(bannerId, updateData, {
    new: true,
  });

  if (!banner) {
    throw new GraphQLError("Banner not found", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  return formatBanner(banner);
};

export const deleteBanner = async (
  context: BannerRequestContext,
  bannerId: string
) => {
  // Verify caller is a staff member
  await requireStaffMember(context);

  const result = await BannerModel.findByIdAndDelete(bannerId);
  return result !== null;
};

export const incrementBannerClick = async (bannerId: string) => {
  const banner = await BannerModel.findByIdAndUpdate(
    bannerId,
    { $inc: { clickCount: 1 } },
    { new: true }
  );

  if (!banner) {
    throw new GraphQLError("Banner not found", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  return formatBanner(banner);
};
