import { gql } from "@apollo/client";

import { IClass } from "./classes";
import { ICourse } from "./courses";
import { Semester } from "./terms";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  student: boolean;
  bookmarkedCourses: ICourse[];
  bookmarkedClasses: IClass[];
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

export interface IUserInput {
  bookmarkedCourses?: IBookmarkedCourseInput[];
  bookmarkedClasses?: IBookmarkedClassInput[];
}

export interface UpdateUserResponse {
  updateUser: IUser;
}

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
    redirectURI ?? window.location.pathname + window.location.search;

  window.location.href = `${window.location.origin}/api/login?redirect_uri=${redirectURI}`;
};

export const signOut = async (redirectURI?: string) => {
  redirectURI =
    redirectURI ?? window.location.pathname + window.location.search;

  window.location.href = `${window.location.origin}/api/logout?redirect_uri=${redirectURI}`;
};
