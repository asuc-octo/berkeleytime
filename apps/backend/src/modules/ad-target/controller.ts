import { GraphQLError } from "graphql";

import { AdTargetModel, StaffMemberModel } from "@repo/common/models";

import { invalidateAdTargetsCache } from "../class/controller";
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

const hasAtLeastOneCriterion = (data: {
  subjects?: string[] | null;
  specificClassIds?: string[] | null;
  minCourseNumber?: string | null;
  maxCourseNumber?: string | null;
}) =>
  (data.subjects?.length ?? 0) > 0 ||
  (data.specificClassIds?.length ?? 0) > 0 ||
  data.minCourseNumber != null ||
  data.maxCourseNumber != null;

// ensure a user is properly authorized even to get ad requests
export const getAllAdTargets = async (context: AdTargetRequestContext) => {
  await requireStaffMember(context);
  const adTargets = await AdTargetModel.find().sort({ createdAt: -1 });
  return adTargets.map(formatAdTarget);
};

export const createAdTarget = async (
  context: AdTargetRequestContext,
  input: CreateAdTargetInput
) => {
  // Verify caller is a staff member
  await requireStaffMember(context);

  const doc = {
    subjects: input.subjects || [],
    minCourseNumber: input.minCourseNumber || undefined,
    maxCourseNumber: input.maxCourseNumber || undefined,
    specificClassIds: input.specificClassIds || [],
  };
  if (!hasAtLeastOneCriterion(doc)) {
    throw new GraphQLError("At least one targeting criterion is required", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }

  const adTarget = await AdTargetModel.create(doc);

  invalidateAdTargetsCache();
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
  // undefined = not sent (no change); null = clear/set empty
  if (input.subjects !== undefined) {
    updateData.subjects = input.subjects ?? [];
  }
  if (input.minCourseNumber !== undefined) {
    updateData.minCourseNumber = input.minCourseNumber ?? null;
  }
  if (input.maxCourseNumber !== undefined) {
    updateData.maxCourseNumber = input.maxCourseNumber ?? null;
  }
  if (input.specificClassIds !== undefined) {
    updateData.specificClassIds = input.specificClassIds ?? [];
  }

  const existing = await AdTargetModel.findById(adTargetId).lean();
  if (!existing) {
    throw new GraphQLError("AdTarget not found", {
      extensions: { code: "NOT_FOUND" },
    });
  }
  const merged = { ...existing, ...updateData };
  if (!hasAtLeastOneCriterion(merged)) {
    throw new GraphQLError("At least one targeting criterion is required", {
      extensions: { code: "BAD_USER_INPUT" },
    });
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

  invalidateAdTargetsCache();
  return formatAdTarget(adTarget);
};

export const deleteAdTarget = async (
  context: AdTargetRequestContext,
  adTargetId: string
) => {
  // Verify caller is a staff member
  await requireStaffMember(context);

  const result = await AdTargetModel.findByIdAndDelete(adTargetId);
  if (result !== null) invalidateAdTargetsCache();
  return result !== null;
};
