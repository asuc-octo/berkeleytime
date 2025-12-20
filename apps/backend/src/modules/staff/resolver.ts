import {
  UpdateStaffInfoInput,
  UpsertSemesterRoleInput,
} from "../../generated-types/graphql";
import {
  deleteSemesterRole,
  deleteStaffMember,
  ensureStaffMember,
  getAllUsers,
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
    ) => getStaffBySemester(year, semester as any),

    staffMember: (_: unknown, { id }: { id: string }) => getStaffMember(id),

    staffMemberByUserId: (_: unknown, { userId }: { userId: string }) =>
      getStaffMemberByUserId(userId),

    allUsers: () => getAllUsers(),
  },

  Mutation: {
    ensureStaffMember: (
      _: unknown,
      { userId, addedBy }: { userId: string; addedBy?: string | null }
    ) => ensureStaffMember(userId, addedBy),

    upsertSemesterRole: (
      _: unknown,
      { memberId, input }: { memberId: string; input: UpsertSemesterRoleInput }
    ) => upsertSemesterRole(memberId, input),

    deleteSemesterRole: (_: unknown, { roleId }: { roleId: string }) =>
      deleteSemesterRole(roleId),

    updateStaffInfo: (
      _: unknown,
      { memberId, input }: { memberId: string; input: UpdateStaffInfoInput }
    ) => updateStaffInfo(memberId, input),

    deleteStaffMember: (_: unknown, { memberId }: { memberId: string }) =>
      deleteStaffMember(memberId),
  },

  StaffMember: {
    id: (parent: any) => parent._id?.toString() ?? parent.id,
    roles: (parent: any) => getMemberRoles(parent._id?.toString() ?? parent.id),
  },

  SemesterRole: {
    id: (parent: any) => parent._id?.toString() ?? parent.id,
    member: (parent: any) =>
      getRoleMember(
        parent.memberId?._id?.toString() ?? parent.memberId?.toString()
      ),
  },
};

export default resolvers;
