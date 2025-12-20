import { gql } from "graphql-tag";

export const staffTypeDef = gql`
  """
  A staff member (may or may not have a user account).
  """
  type StaffMember {
    id: ID!
    userId: ID
    name: String!
    personalLink: String
    roles: [SemesterRole!]!
  }

  """
  A staff member's role in a specific semester.
  """
  type SemesterRole {
    id: ID!
    member: StaffMember!
    year: Int!
    semester: Semester!
    role: String!
    team: String
    photo: String
    isAlumni: Boolean!
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
    Get all users (staff only).
    """
    allUsers: [UserSearchResult!]!
  }
`;
