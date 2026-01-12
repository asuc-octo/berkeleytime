import {
  Semester,
  UpdateStaffInfoInput,
  UpsertSemesterRoleInput,
} from "../../generated-types/graphql";
import {
  StaffRequestContext,
  deleteSemesterRole,
  deleteStaffMember,
  ensureStaffMember,
  getAddedByName,
  getAllStaffMembers,
  getAllUsers,
  getMemberEmail,
  getMemberRoles,
  getRoleMember,
  getStaffBySemester,
  getStaffMember,
  getStaffMemberByUserId,
  updateStaffInfo,
  upsertSemesterRole,
} from "./controller";

const resolvers = {
  Query: {
    staffBySemester: (
      _: unknown,
      { year, semester }: { year: number; semester: string }
    ) => getStaffBySemester(year, semester as Semester),

    staffMember: (_: unknown, { id }: { id: string }) => getStaffMember(id),

    allStaffMembers: () => getAllStaffMembers(),

    staffMemberByUserId: (_: unknown, { userId }: { userId: string }) =>
      getStaffMemberByUserId(userId),

    allUsers: () => getAllUsers(),
  },

  Mutation: {
    ensureStaffMember: (
      _: unknown,
      { userId }: { userId: string },
      context: StaffRequestContext
    ) => ensureStaffMember(context, userId),

    upsertSemesterRole: (
      _: unknown,
      { memberId, input }: { memberId: string; input: UpsertSemesterRoleInput },
      context: StaffRequestContext
    ) => upsertSemesterRole(context, memberId, input),

    deleteSemesterRole: (
      _: unknown,
      { roleId }: { roleId: string },
      context: StaffRequestContext
    ) => deleteSemesterRole(context, roleId),

    updateStaffInfo: (
      _: unknown,
      { memberId, input }: { memberId: string; input: UpdateStaffInfoInput },
      context: StaffRequestContext
    ) => updateStaffInfo(context, memberId, input),

    deleteStaffMember: (
      _: unknown,
      { memberId }: { memberId: string },
      context: StaffRequestContext
    ) => deleteStaffMember(context, memberId),
  },

  StaffMember: {
    id: (parent: { _id?: { toString: () => string }; id?: string }) =>
      parent._id?.toString() ?? parent.id,
    email: (parent: { userId?: { toString: () => string } }) =>
      getMemberEmail(parent.userId?.toString()),
    roles: (parent: { _id?: { toString: () => string }; id?: string }) => {
      const id = parent._id?.toString() ?? parent.id;
      if (!id) throw new Error("Missing id");
      return getMemberRoles(id);
    },
    addedByName: (parent: { addedBy?: { toString: () => string } }) =>
      getAddedByName(parent.addedBy?.toString()),
  },

  SemesterRole: {
    id: (parent: { _id?: { toString: () => string }; id?: string }) =>
      parent._id?.toString() ?? parent.id,
    member: (parent: {
      memberId?: { _id?: { toString: () => string }; toString: () => string };
    }) => {
      const memberId =
        parent.memberId?._id?.toString() ?? parent.memberId?.toString();
      if (!memberId) throw new Error("Missing memberId");
      return getRoleMember(memberId);
    },
  },
};

export default resolvers;
