import { GraphQLError } from "graphql";

import { PodModel, StaffMemberModel } from "@repo/common/models";

import { Semester } from "../../generated-types/graphql";

// Context interface for authenticated requests
export interface PodRequestContext {
  user: {
    _id: string;
    isAuthenticated: boolean;
  };
}

// Helper to verify the current user is a staff member
export const requireStaffMember = async (context: PodRequestContext) => {
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

export interface CreatePodInput {
  name: string;
  semester: Semester;
  year: number;
}

export const getAllPods = async () => {
  const pods = await PodModel.find()
    .sort({ year: -1, semester: 1, name: 1 })
    .lean();

  return pods;
};

export const createPod = async (
  context: PodRequestContext,
  input: CreatePodInput
) => {
  // Verify caller is a staff member
  await requireStaffMember(context);

  const pod = await PodModel.create({
    name: input.name,
    semester: input.semester,
    year: input.year,
  });

  return pod.toObject();
};

export const deletePod = async (context: PodRequestContext, podId: string) => {
  // Verify caller is a staff member
  await requireStaffMember(context);

  const result = await PodModel.findByIdAndDelete(podId);
  return result !== null;
};
