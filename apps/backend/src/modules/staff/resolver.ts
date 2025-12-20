import {
  getAllUsers,
  getMemberRoles,
  getRoleMember,
  getStaffBySemester,
  getStaffMember,
} from "./controller";

const resolvers = {
  Query: {
    staffBySemester: (
      _: unknown,
      { year, semester }: { year: number; semester: string }
    ) => getStaffBySemester(year, semester as any),

    staffMember: (_: unknown, { id }: { id: string }) => getStaffMember(id),

    allUsers: () => getAllUsers(),
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
