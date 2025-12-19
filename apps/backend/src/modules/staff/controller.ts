import { SemesterRoleModel, StaffMemberModel } from "@repo/common";

import { Semester } from "../../generated-types/graphql";

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
