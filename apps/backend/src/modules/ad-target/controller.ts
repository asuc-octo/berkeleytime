import { GraphQLError } from "graphql";

import { AdTargetModel, StaffMemberModel } from "@repo/common/models";

import { formatAdTarget } from "./formatter";

// Context interface for authenticated requests
export interface AdTargetRequestContext {
  user: {
    _id: string;
    isAuthenticated: boolean;
  };
}

// Helper to verify the current user is a staff member
export const requireStaffMember = async (context: AdTargetRequestContext) => {
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

export interface CreateAdTargetInput {
  subjects?: string[];
  minCourseNumber?: string | null;
  maxCourseNumber?: string | null;
  specificClassIds?: string[];
}

export interface UpdateAdTargetInput {
  subjects?: string[] | null;
  minCourseNumber?: string | null;
  maxCourseNumber?: string | null;
  specificClassIds?: string[] | null;
}

export const getAllAdTargets = async () => {
  const adTargets = await AdTargetModel.find().sort({ createdAt: -1 });

  return adTargets.map(formatAdTarget);
};

export const createAdTarget = async (
  context: AdTargetRequestContext,
  input: CreateAdTargetInput
) => {
  // Verify caller is a staff member
  await requireStaffMember(context);

  const adTarget = await AdTargetModel.create({
    subjects: input.subjects || [],
    minCourseNumber: input.minCourseNumber || undefined,
    maxCourseNumber: input.maxCourseNumber || undefined,
    specificClassIds: input.specificClassIds || [],
  });

  return formatAdTarget(adTarget);
};

export const updateAdTarget = async (
  context: AdTargetRequestContext,
  adTargetId: string,
  input: UpdateAdTargetInput
) => {
  // Verify caller is a staff member
  await requireStaffMember(context);

  const updateData: Record<string, unknown> = {};
  if (input.subjects !== null && input.subjects !== undefined) {
    updateData.subjects = input.subjects || [];
  }
  if (input.minCourseNumber !== null && input.minCourseNumber !== undefined) {
    updateData.minCourseNumber = input.minCourseNumber || undefined;
  }
  if (input.maxCourseNumber !== null && input.maxCourseNumber !== undefined) {
    updateData.maxCourseNumber = input.maxCourseNumber || undefined;
  }
  if (input.specificClassIds !== null && input.specificClassIds !== undefined) {
    updateData.specificClassIds = input.specificClassIds || [];
  }

  const adTarget = await AdTargetModel.findByIdAndUpdate(
    adTargetId,
    updateData,
    {
      new: true,
    }
  );

  if (!adTarget) {
    throw new GraphQLError("AdTarget not found", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  return formatAdTarget(adTarget);
};

export const deleteAdTarget = async (
  context: AdTargetRequestContext,
  adTargetId: string
) => {
  // Verify caller is a staff member
  await requireStaffMember(context);

  const result = await AdTargetModel.findByIdAndDelete(adTargetId);
  return result !== null;
};
