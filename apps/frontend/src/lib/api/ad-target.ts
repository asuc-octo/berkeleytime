import { gql } from "@apollo/client";

export const GET_ALL_AD_TARGETS = gql`
  query GetAllAdTargets {
    allAdTargets {
      id
      subjects
      minCourseNumber
      maxCourseNumber
      specificClassIds
      createdAt
    }
  }
`;
