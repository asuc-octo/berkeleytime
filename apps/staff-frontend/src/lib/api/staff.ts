import { gql } from "@apollo/client";

// Types
export type Semester = "Spring" | "Summer" | "Fall" | "Winter";

export interface SemesterRole {
  id: string;
  year: number;
  semester: Semester;
  role: string;
  team?: string;
  photo?: string;
  altPhoto?: string;
  isLeadership: boolean;
}

export interface StaffMember {
  id: string;
  userId?: string;
  name: string;
  email?: string;
  personalLink?: string;
  addedByName?: string;
  createdAt?: string;
  roles: SemesterRole[];
}

export interface UpsertSemesterRoleInput {
  year: number;
  semester: Semester;
  role: string;
  team?: string;
  photo?: string;
  altPhoto?: string;
  isLeadership?: boolean;
}

export interface UpdateStaffInfoInput {
  personalLink?: string;
}

// Queries
export const ALL_STAFF_MEMBERS = gql`
  query AllStaffMembers {
    allStaffMembers {
      id
      userId
      name
      email
      personalLink
      addedByName
      createdAt
      roles {
        id
        year
        semester
        role
        team
        photo
        altPhoto
        isLeadership
      }
    }
  }
`;

export const STAFF_MEMBER_BY_USER_ID = gql`
  query StaffMemberByUserId($userId: ID!) {
    staffMemberByUserId(userId: $userId) {
      id
      userId
      name
      email
      personalLink
      addedByName
      createdAt
      roles {
        id
        year
        semester
        role
        team
        photo
        altPhoto
        isLeadership
      }
    }
  }
`;

// Mutations
export const ENSURE_STAFF_MEMBER = gql`
  mutation EnsureStaffMember($userId: ID!) {
    ensureStaffMember(userId: $userId) {
      id
      userId
      name
      email
      personalLink
      addedByName
      createdAt
      roles {
        id
        year
        semester
        role
        team
        photo
        altPhoto
        isLeadership
      }
    }
  }
`;

export const UPSERT_SEMESTER_ROLE = gql`
  mutation UpsertSemesterRole(
    $memberId: ID!
    $input: UpsertSemesterRoleInput!
  ) {
    upsertSemesterRole(memberId: $memberId, input: $input) {
      id
      year
      semester
      role
      team
      photo
      altPhoto
      isLeadership
    }
  }
`;

export const UPDATE_STAFF_INFO = gql`
  mutation UpdateStaffInfo($memberId: ID!, $input: UpdateStaffInfoInput!) {
    updateStaffInfo(memberId: $memberId, input: $input) {
      id
      userId
      name
      email
      personalLink
      addedByName
      createdAt
      roles {
        id
        year
        semester
        role
        team
        photo
        altPhoto
        isLeadership
      }
    }
  }
`;

export const DELETE_SEMESTER_ROLE = gql`
  mutation DeleteSemesterRole($roleId: ID!) {
    deleteSemesterRole(roleId: $roleId)
  }
`;

export const DELETE_STAFF_MEMBER = gql`
  mutation DeleteStaffMember($memberId: ID!) {
    deleteStaffMember(memberId: $memberId)
  }
`;
