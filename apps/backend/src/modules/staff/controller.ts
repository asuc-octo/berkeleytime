import { GraphQLError } from "graphql";

import {
  SemesterRoleModel,
  StaffMemberModel,
  UserModel,
} from "@repo/common/models";

import {
  Semester,
  UpdateStaffInfoInput,
  UpsertSemesterRoleInput,
} from "../../generated-types/graphql";
import {
  addEmailToStaffGroup,
  addMissingStaffEmails,
  removeEmailFromStaffGroup,
} from "./controllers/cloudflareAccess";

// Context interface for authenticated requests
export interface StaffRequestContext {
  user: {
    _id: string;
    isAuthenticated: boolean;
  };
}

// Helper to verify the current user is a staff member
// Returns the staff member record for the authenticated user
export const requireStaffMember = async (context: StaffRequestContext) => {
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

export const getStaffBySemester = async (year: number, semester: Semester) => {
  const roles = await SemesterRoleModel.find({ year, semester })
    .populate("memberId")
    .lean();

  return roles;
};

export const getStaffMember = async (id: string) => {
  const member = await StaffMemberModel.findById(id).lean();
  return member;
};

export const getMemberRoles = async (memberId: string) => {
  const roles = await SemesterRoleModel.find({ memberId })
    .sort({ year: -1, semester: -1 })
    .lean();

  return roles;
};

export const getRoleMember = async (memberId: string) => {
  const member = await StaffMemberModel.findById(memberId).lean();
  return member;
};

export const getAllUsers = async () => {
  const users = await UserModel.find()
    .select("_id name email")
    .sort({ name: 1 })
    .lean();

  return users;
};

export const getStaffMemberByUserId = async (userId: string) => {
  const member = await StaffMemberModel.findOne({ userId }).lean();
  return member;
};

export const getAllStaffMembers = async () => {
  const members = await StaffMemberModel.find().sort({ createdAt: -1 }).lean();
  return members;
};

export const getMemberEmail = async (userId?: string) => {
  if (!userId) return null;
  const user = await UserModel.findById(userId).select("email").lean();
  return user?.email ?? null;
};

export const getAddedByName = async (addedBy?: string) => {
  if (!addedBy) return null;
  const member = await StaffMemberModel.findById(addedBy).select("name").lean();
  return member?.name ?? null;
};

export const ensureStaffMember = async (
  context: StaffRequestContext,
  userId: string
) => {
  // Verify caller is a staff member and get their record
  const callerStaffMember = await requireStaffMember(context);

  // Check if StaffMember already exists for this userId
  const existingMember = await StaffMemberModel.findOne({ userId }).lean();

  if (existingMember) {
    return existingMember;
  }

  // Get user info to create staff member
  const user = await UserModel.findById(userId).lean();
  if (!user) {
    throw new GraphQLError(`User with ID ${userId} not found`, {
      extensions: { code: "NOT_FOUND" },
    });
  }

  // Create new StaffMember with addedBy set to the caller's staff member ID
  const newMember = await StaffMemberModel.create({
    userId,
    name: user.name,
    isLeadership: false,
    addedBy: callerStaffMember._id,
  });

  // Set user.staff = true
  await UserModel.findByIdAndUpdate(userId, { staff: true });

  // Grant Cloudflare Access to private backups
  if (user.email) {
    try {
      await addEmailToStaffGroup(user.email);
    } catch (err) {
      console.error(
        "[Staff] Failed to add email to Cloudflare Access group:",
        { userId, email: user.email },
        err
      );
    }
  }

  return newMember.toObject();
};

export const upsertSemesterRole = async (
  context: StaffRequestContext,
  memberId: string,
  input: UpsertSemesterRoleInput
) => {
  // Verify caller is a staff member
  await requireStaffMember(context);

  // Use findOneAndUpdate with upsert to create or update
  const role = await SemesterRoleModel.findOneAndUpdate(
    {
      memberId,
      year: input.year,
      semester: input.semester,
    },
    {
      $set: {
        role: input.role,
        team: input.team || null,
        photo: input.photo || null,
        altPhoto: input.altPhoto || null,
        isLeadership: input.isLeadership ?? false,
      },
      $setOnInsert: {
        memberId,
        year: input.year,
        semester: input.semester,
      },
    },
    {
      upsert: true,
      new: true,
      lean: true,
    }
  );

  return role;
};

export const deleteSemesterRole = async (
  context: StaffRequestContext,
  roleId: string
) => {
  // Verify caller is a staff member
  await requireStaffMember(context);

  const result = await SemesterRoleModel.findByIdAndDelete(roleId);
  return result !== null;
};

export const updateStaffInfo = async (
  context: StaffRequestContext,
  memberId: string,
  input: UpdateStaffInfoInput
) => {
  // Verify caller is a staff member
  await requireStaffMember(context);

  const updateData: Record<string, unknown> = {};

  if (input.name) {
    updateData.name = input.name.trim();
  }

  if (input.personalLink !== undefined) {
    updateData.personalLink = input.personalLink;
  }

  const member = await StaffMemberModel.findByIdAndUpdate(
    memberId,
    { $set: updateData },
    { new: true, lean: true }
  );

  if (!member) {
    throw new GraphQLError(`Staff member with ID ${memberId} not found`, {
      extensions: { code: "NOT_FOUND" },
    });
  }

  return member;
};

export const deleteStaffMember = async (
  context: StaffRequestContext,
  memberId: string
) => {
  // Verify caller is a staff member
  const callerStaffMember = await requireStaffMember(context);

  // Prevent self-deletion to avoid locking out access
  if (callerStaffMember._id.toString() === memberId) {
    throw new GraphQLError("You cannot remove yourself from staff", {
      extensions: { code: "FORBIDDEN" },
    });
  }

  // Get staff member to find userId
  const member = await StaffMemberModel.findById(memberId).lean();
  if (!member) {
    return false;
  }

  // Revoke Cloudflare Access to private backups
  if (member.userId) {
    const user = await UserModel.findById(member.userId).select("email").lean();
    if (user?.email) {
      try {
        await removeEmailFromStaffGroup(user.email);
      } catch (err) {
        console.error(
          "[Staff] Failed to remove email from Cloudflare Access group:",
          { memberId, email: user.email },
          err
        );
      }
    }
  }

  // Delete all SemesterRoles for this member
  await SemesterRoleModel.deleteMany({ memberId });

  // Delete the StaffMember
  await StaffMemberModel.findByIdAndDelete(memberId);

  // If userId exists, set user.staff = false
  if (member.userId) {
    await UserModel.findByIdAndUpdate(member.userId, { staff: false });
  }

  return true;
};

/**
 * Returns the list of emails for all current staff (users with staff: true).
 */
export const getStaffEmailsFromDb = async (): Promise<string[]> => {
  const users = await UserModel.find({ staff: true }).select("email").lean();
  return users
    .map((u) => u.email)
    .filter((e): e is string => typeof e === "string" && e.length > 0);
};

export interface SyncCloudflareStaffAccessResult {
  added: string[];
  errorMessage?: string;
}

/**
 * Add all current Berkeleytime staff emails to the Cloudflare Access group.
 * Gated by requireStaffMember; call from staff-only mutation.
 */
export const syncCloudflareStaffAccess = async (
  context: StaffRequestContext
): Promise<SyncCloudflareStaffAccessResult> => {
  await requireStaffMember(context);
  const emails = await getStaffEmailsFromDb();
  try {
    const { added } = await addMissingStaffEmails(emails);
    return { added };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Cloudflare sync failed";
    console.error("[Staff] syncCloudflareStaffAccess failed:", message, err);
    return { added: [], errorMessage: message };
  }
};
