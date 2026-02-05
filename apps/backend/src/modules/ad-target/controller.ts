import { GraphQLError } from "graphql";
import type { RedisClientType } from "redis";

import { AdTargetModel, StaffMemberModel } from "@repo/common/models";

import { invalidateAdTargetsCache } from "../class/controller";
import { formatAdTarget } from "./formatter";

// Context interface for authenticated requests
export interface AdTargetRequestContext {
  user: {
    _id: string;
    isAuthenticated: boolean;
  };
  redis: RedisClientType;
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
}

export interface UpdateAdTargetInput {
  subjects?: string[] | null;
  minCourseNumber?: string | null;
  maxCourseNumber?: string | null;
}

const normalizeSubjects = (subjects?: string[] | null) => {
  if (!subjects) return [];

  const normalized = subjects
    .flatMap((subject) => subject.split(","))
    .map((subject) => subject.trim().replace(/\s+/g, " ").toUpperCase())
    .filter((subject) => subject.length > 0);

  return [...new Set(normalized)];
};

const normalizeCourseNumberInput = (value?: string | null) => {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const hasAtLeastOneCriterion = (data: {
  subjects?: string[] | null;
  minCourseNumber?: string | null;
  maxCourseNumber?: string | null;
}) =>
  (data.subjects?.length ?? 0) > 0 ||
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

  const normalizedSubjects = normalizeSubjects(input.subjects);
  const normalizedMinCourseNumber = normalizeCourseNumberInput(
    input.minCourseNumber
  );
  const normalizedMaxCourseNumber = normalizeCourseNumberInput(
    input.maxCourseNumber
  );
  const doc = {
    subjects: normalizedSubjects,
    minCourseNumber: normalizedMinCourseNumber ?? undefined,
    maxCourseNumber: normalizedMaxCourseNumber ?? undefined,
  };
  if (!hasAtLeastOneCriterion(doc)) {
    throw new GraphQLError("At least one targeting criterion is required", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }

  const adTarget = await AdTargetModel.create(doc);

  await invalidateAdTargetsCache(context.redis);
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
    updateData.subjects = normalizeSubjects(input.subjects);
  }
  if (input.minCourseNumber !== undefined) {
    updateData.minCourseNumber = normalizeCourseNumberInput(
      input.minCourseNumber
    );
  }
  if (input.maxCourseNumber !== undefined) {
    updateData.maxCourseNumber = normalizeCourseNumberInput(
      input.maxCourseNumber
    );
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

  await invalidateAdTargetsCache(context.redis);
  return formatAdTarget(adTarget);
};

export const deleteAdTarget = async (
  context: AdTargetRequestContext,
  adTargetId: string
) => {
  // Verify caller is a staff member
  await requireStaffMember(context);

  const result = await AdTargetModel.findByIdAndDelete(adTargetId);
  if (result !== null) {
    await invalidateAdTargetsCache(context.redis);
  }
  return result !== null;
};
