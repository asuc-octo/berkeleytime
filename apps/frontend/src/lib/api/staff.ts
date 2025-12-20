import { gql } from "@apollo/client";

export const GET_ALL_STAFF_MEMBERS = gql`
  query GetAllStaffMembers {
    allStaffMembers {
      id
      userId
      name
      email
      personalLink
      isAlumni
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