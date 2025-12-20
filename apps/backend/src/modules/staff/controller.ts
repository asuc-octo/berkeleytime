import { SemesterRoleModel, StaffMemberModel, UserModel } from "@repo/common";

import {
  Semester,
  UpdateStaffInfoInput,
  UpsertSemesterRoleInput,
} from "../../generated-types/graphql";

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
  const members = await StaffMemberModel.find().sort({ name: 1 }).lean();
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

export const ensureStaffMember = async (userId: string, addedBy: string) => {
  // Check if StaffMember already exists for this userId
  const existingMember = await StaffMemberModel.findOne({ userId }).lean();

  if (existingMember) {
    return existingMember;
  }

  // Get user info to create staff member
  const user = await UserModel.findById(userId).lean();
  if (!user) {
    throw new Error(`User with ID ${userId} not found`);
  }

  // Create new StaffMember
  const newMember = await StaffMemberModel.create({
    userId,
    name: user.name,
    isLeadership: false,
    addedBy,
  });

  // Set user.staff = true
  await UserModel.findByIdAndUpdate(userId, { staff: true });

  return newMember.toObject();
};

export const upsertSemesterRole = async (
  memberId: string,
  input: UpsertSemesterRoleInput
) => {
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

export const deleteSemesterRole = async (roleId: string) => {
  const result = await SemesterRoleModel.findByIdAndDelete(roleId);
  return result !== null;
};

export const updateStaffInfo = async (
  memberId: string,
  input: UpdateStaffInfoInput
) => {
  const updateData: Record<string, unknown> = {};

  if (input.personalLink !== undefined) {
    updateData.personalLink = input.personalLink;
  }

  const member = await StaffMemberModel.findByIdAndUpdate(
    memberId,
    { $set: updateData },
    { new: true, lean: true }
  );

  if (!member) {
    throw new Error(`Staff member with ID ${memberId} not found`);
  }

  return member;
};

export const deleteStaffMember = async (memberId: string) => {
  // Get staff member to find userId
  const member = await StaffMemberModel.findById(memberId).lean();
  if (!member) {
    return false;
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
