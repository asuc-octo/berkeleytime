import { gql } from "@apollo/client";

import { GetUserQuery } from "../generated/graphql";

export type IUser = GetUserQuery["user"];

export const READ_USER = gql`
  query GetUser {
    user {
      _id
      email
      name
      student
      bookmarkedCourses {
        title
        subject
        number
      }
      bookmarkedClasses {
        title
        subject
        number
        courseNumber
        year
        semester
        sessionId
        unitsMin
        unitsMax
        course {
          title
        }
        primarySection {
          enrollment {
            latest {
              enrolledCount
              maxEnroll
              waitlistedCount
              maxWaitlist
            }
          }
        }
        gradeDistribution {
          average
        }
      }
    }
  }
`;

export const UPDATE_USER = gql`
  mutation UpdateUser($user: UpdateUserInput!) {
    updateUser(user: $user) {
      name
      email
      student
      bookmarkedCourses {
        title
        subject
        number
      }
      bookmarkedClasses {
        title
        subject
        number
        courseNumber
        year
        semester
        sessionId
      }
    }
  }
`;

export const signIn = (redirectURI?: string) => {
  redirectURI =
    redirectURI ??
    window.location.origin + window.location.pathname + window.location.search;

  window.location.href = `${window.location.origin}/api/login?redirect_uri=${redirectURI}`;
};

export const signOut = async (redirectURI?: string) => {
  redirectURI =
    redirectURI ?? window.location.pathname + window.location.search;

  window.location.href = `${window.location.origin}/api/logout?redirect_uri=${redirectURI}`;
};
