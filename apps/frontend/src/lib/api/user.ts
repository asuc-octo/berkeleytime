import { gql } from "@apollo/client";

export interface IUser {
  email: string;
  student: boolean;
}

export interface UserResponse {
  user: IUser;
}

export const GET_USER = gql`
  query GetUser {
    user {
      email
      student
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
