import { GraphQLError } from "graphql";

import { NavItemModel, StaffMemberModel } from "@repo/common/models";

import { formatNavItem } from "./formatter";

// Context interface for authenticated requests
export interface NavItemRequestContext {
  user: {
    _id: string;
    isAuthenticated: boolean;
  };
}

// Helper to verify the current user is a staff member
export const requireStaffMember = async (context: NavItemRequestContext) => {
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

export interface CreateNavItemInput {
  label: string;
  url: string;
  badgeText?: string | null;
  order?: number | null;
  visible?: boolean | null;
  clickEventLogging?: boolean | null;
}

export interface UpdateNavItemInput {
  label?: string | null;
  url?: string | null;
  badgeText?: string | null;
  order?: number | null;
  visible?: boolean | null;
  clickEventLogging?: boolean | null;
}

/**
 * Get all visible nav items for public display.
 */
export const getVisibleNavItems = async () => {
  const navItems = await NavItemModel.find({
    visible: { $ne: false },
    deletedAt: null,
  }).sort({ order: 1, createdAt: 1 });

  return navItems.map(formatNavItem);
};

/**
 * Get all nav items for the staff dashboard (includes hidden ones).
 */
export const getAllNavItemsForStaff = async () => {
  const navItems = await NavItemModel.find({ deletedAt: null }).sort({
    order: 1,
    createdAt: 1,
  });

  return navItems.map(formatNavItem);
};

export const createNavItem = async (
  context: NavItemRequestContext,
  input: CreateNavItemInput
) => {
  // Verify caller is a staff member
  await requireStaffMember(context);

  const navItem = await NavItemModel.create({
    label: input.label,
    url: input.url,
    badgeText: input.badgeText || undefined,
    order: input.order ?? 0,
    visible: input.visible ?? true,
    clickEventLogging: input.clickEventLogging ?? false,
  });

  return formatNavItem(navItem);
};

export const updateNavItem = async (
  context: NavItemRequestContext,
  navItemId: string,
  input: UpdateNavItemInput
) => {
  // Verify caller is a staff member
  await requireStaffMember(context);

  const updateData: Record<string, unknown> = {};
  if (input.label !== null && input.label !== undefined) {
    updateData.label = input.label;
  }
  if (input.url !== null && input.url !== undefined) {
    updateData.url = input.url;
  }
  // Empty strings clear the optional text fields
  if (input.badgeText !== null && input.badgeText !== undefined) {
    updateData.badgeText = input.badgeText || null;
  }
  if (input.order !== null && input.order !== undefined) {
    updateData.order = input.order;
  }
  if (input.visible !== null && input.visible !== undefined) {
    updateData.visible = input.visible;
  }
  if (
    input.clickEventLogging !== null &&
    input.clickEventLogging !== undefined
  ) {
    updateData.clickEventLogging = input.clickEventLogging;
  }

  const navItem = await NavItemModel.findByIdAndUpdate(navItemId, updateData, {
    new: true,
  });

  if (!navItem) {
    throw new GraphQLError("Nav item not found", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  return formatNavItem(navItem);
};

export const deleteNavItem = async (
  context: NavItemRequestContext,
  navItemId: string
) => {
  // Verify caller is a staff member
  await requireStaffMember(context);

  const navItem = await NavItemModel.findByIdAndUpdate(navItemId, {
    deletedAt: new Date(),
  });

  return navItem !== null;
};
