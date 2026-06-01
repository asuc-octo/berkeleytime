import { gql } from "@apollo/client";

import { GetUserQuery, UpdateUserMutation } from "../generated/graphql";

export type IUser = GetUserQuery["user"];

export type UpdateUserResponse = UpdateUserMutation;

export interface IMonitoredClassInput {
  class: {
    year: number;
    semester: string;
    sessionId?: string | null;
    subject: string;
    courseNumber: string;
    number: string;
  };
}

export interface IUserInput {
  monitoredClasses?: IMonitoredClassInput[];
  notificationsOn?: boolean;
}

export const READ_USER = gql`
  query GetUser {
    user {
      _id
      email
      name
      student
      notificationsOn
      monitoredClasses {
        notified
        class {
          title
          subject
          courseNumber
          number
          year
          semester
          sessionId
          unitsMin
          unitsMax
          gradeDistribution {
            average
          }
          course {
            title
            subject
            number
            gradeDistribution {
              average
            }
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
        }
      }
    }
  }
`;

export const UPDATE_USER = gql`
  mutation UpdateUser($user: UpdateUserInput!) {
    updateUser(user: $user) {
      _id
      name
      email
      student
      notificationsOn
      monitoredClasses {
        notified
        class {
          title
          subject
          courseNumber
          number
          year
          semester
          sessionId
          unitsMin
          unitsMax
          gradeDistribution {
            average
          }
          course {
            title
            subject
            number
            gradeDistribution {
              average
            }
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
        }
      }
    }
  }
`;

export const DELETE_ACCOUNT = gql`
  mutation DeleteAccount {
    deleteAccount
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
