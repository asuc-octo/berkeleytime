import { gql } from "graphql-tag";

export const staffTypeDef = gql`
  """
  A staff member (may or may not have a user account).
  """
  type StaffMember @cacheControl(maxAge: 0) {
    id: ID!
    userId: ID
    name: String!
    email: String
    personalLink: String
    addedBy: ID
    addedByName: String
    roles: [SemesterRole!]!
  }

  """
  A staff member's role in a specific semester.
  """
  type SemesterRole @cacheControl(maxAge: 0) {
    id: ID!
    member: StaffMember!
    year: Int!
    semester: Semester!
    role: String!
    team: String
    photo: String
    altPhoto: String
    isLeadership: Boolean!
  }

  """
  A user account for search results.
  """
  type UserSearchResult {
    _id: ID!
    name: String!
    email: String!
  }

  type Query {
    """
    Get all staff members for a specific semester.
    """
    staffBySemester(year: Int!, semester: Semester!): [SemesterRole!]!

    """
    Get a staff member by ID.
    """
    staffMember(id: ID!): StaffMember

    """
    Get all staff members.
    """
    allStaffMembers: [StaffMember!]!

    """
    Get all users (staff only).
    """
    allUsers: [UserSearchResult!]!

    """
    Get a staff member by user ID.
    """
    staffMemberByUserId(userId: ID!): StaffMember
  }

  """
  Input for creating/updating a semester role.
  """
  input UpsertSemesterRoleInput {
    year: Int!
    semester: Semester!
    role: String!
    team: String
    photo: String
    altPhoto: String
    isLeadership: Boolean
  }

  """
  Input for updating staff member info.
  """
  input UpdateStaffInfoInput {
    personalLink: String
  }

  type Mutation {
    """
    Create or get staff member for a user. Returns the staff member.
    If user doesn't have a staff record, creates one.
    Also sets user.staff = true.
    """
    ensureStaffMember(userId: ID!, addedBy: ID!): StaffMember!

    """
    Upsert a semester role for a staff member.
    Creates if no role exists for that (memberId, year, semester).
    Updates if one exists.
    """
    upsertSemesterRole(
      memberId: ID!
      input: UpsertSemesterRoleInput!
    ): SemesterRole!

    """
    Delete a semester role by ID.
    """
    deleteSemesterRole(roleId: ID!): Boolean!

    """
    Update staff member info (personalLink).
    """
    updateStaffInfo(memberId: ID!, input: UpdateStaffInfoInput!): StaffMember!

    """
    Delete a staff member and all their roles.
    """
    deleteStaffMember(memberId: ID!): Boolean!
  }
`;
