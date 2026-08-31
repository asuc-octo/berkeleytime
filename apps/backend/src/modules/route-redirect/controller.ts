import { GraphQLError } from "graphql";

import { RouteRedirectModel, StaffMemberModel } from "@repo/common/models";

import { formatRouteRedirect } from "./formatter";

// Context interface for authenticated requests
export interface RouteRedirectRequestContext {
  user: {
    _id: string;
    isAuthenticated: boolean;
  };
}

// Helper to verify the current user is a staff member
export const requireStaffMember = async (
  context: RouteRedirectRequestContext
) => {
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

export interface CreateRouteRedirectInput {
  fromPath: string;
  toPath: string;
}

export interface UpdateRouteRedirectInput {
  fromPath?: string | null;
  toPath?: string | null;
}

export const getAllRouteRedirects = async () => {
  const redirects = await RouteRedirectModel.find().sort({ createdAt: -1 });

  return redirects.map(formatRouteRedirect);
};

export const createRouteRedirect = async (
  context: RouteRedirectRequestContext,
  input: CreateRouteRedirectInput
) => {
  // Verify caller is a staff member
  await requireStaffMember(context);

  // Normalize fromPath (ensure it starts with / for internal paths)
  const fromPath = input.fromPath.startsWith("/")
    ? input.fromPath
    : `/${input.fromPath}`;

  const redirect = await RouteRedirectModel.create({
    fromPath,
    toPath: input.toPath, // toPath can be external URL, no normalization
  });

  return formatRouteRedirect(redirect);
};

export const updateRouteRedirect = async (
  context: RouteRedirectRequestContext,
  redirectId: string,
  input: UpdateRouteRedirectInput
) => {
  // Verify caller is a staff member
  await requireStaffMember(context);

  const updateData: Record<string, unknown> = {};
  if (input.fromPath !== null && input.fromPath !== undefined) {
    updateData.fromPath = input.fromPath.startsWith("/")
      ? input.fromPath
      : `/${input.fromPath}`;
  }
  if (input.toPath !== null && input.toPath !== undefined) {
    updateData.toPath = input.toPath; // toPath can be external URL, no normalization
  }

  const redirect = await RouteRedirectModel.findByIdAndUpdate(
    redirectId,
    updateData,
    {
      new: true,
    }
  );

  if (!redirect) {
    throw new GraphQLError("Route redirect not found", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  return formatRouteRedirect(redirect);
};

export const deleteRouteRedirect = async (
  context: RouteRedirectRequestContext,
  redirectId: string
) => {
  // Verify caller is a staff member
  await requireStaffMember(context);

  const result = await RouteRedirectModel.findByIdAndDelete(redirectId);
  return result !== null;
};

export const incrementRouteRedirectClick = async (redirectId: string) => {
  const redirect = await RouteRedirectModel.findByIdAndUpdate(
    redirectId,
    { $inc: { clickCount: 1 } },
    { new: true }
  );

  if (!redirect) {
    throw new GraphQLError("Route redirect not found", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  return formatRouteRedirect(redirect);
};
