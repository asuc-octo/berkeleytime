import { gql } from "@apollo/client";

import { IClass } from "./classes";
import { ICourse } from "./courses";

export interface IUser {
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
  year: string;
  semester: string;
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