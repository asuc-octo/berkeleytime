import { gql } from "@apollo/client";

import { IClass } from "./classes";
import { ICourse } from "./courses";
import { Semester } from "./terms";

export interface IMonitoredClass {
  class: IClass;
  thresholds: number[];
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  student: boolean;
  bookmarkedCourses: ICourse[];
  bookmarkedClasses: IClass[];
  monitoredClasses?: IMonitoredClass[];
  notificationsOn?: boolean;
}

export interface ReadUserResponse {
  user: IUser;
}

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

export interface IBookmarkedCourseInput {
  subject: string;
  number: string;
}

export interface IBookmarkedClassInput {
  subject: string;
  number: string;
  courseNumber: string;
  year: number;
  semester: Semester;
  sessionId: string | null;
}

export interface IMonitoredClassInput {
  class: IBookmarkedClassInput;
  thresholds: number[];
}

export interface IUserInput {
  bookmarkedCourses?: IBookmarkedCourseInput[];
  bookmarkedClasses?: IBookmarkedClassInput[];
  monitoredClasses?: IMonitoredClassInput[];
  notificationsOn?: boolean;
}

export interface UpdateUserResponse {
  updateUser: IUser;
}

export const UPDATE_USER = gql`
  mutation UpdateUser($user: UpdateUserInput!) {
    updateUser(user: $user) {
      _id
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
      # monitoredClasses { # TODO: Uncomment when backend implements this field
      #   thresholds
      #   class {
      #     title
      #     subject
      #     number
      #     courseNumber
      #     year
      #     semester
      #     sessionId
      #   }
      # }
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
