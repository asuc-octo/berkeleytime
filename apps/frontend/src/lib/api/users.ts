import { gql } from "@apollo/client";

import { DEV_AUTH_LOGIN_ROUTE } from "@/utils/devAuth";

import { GetUserQuery } from "../generated/graphql";

export type IUser = GetUserQuery["user"];

export const READ_USER = gql`
  query GetUser {
    user {
      _id
      email
      name
      student
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

  if (import.meta.env.DEV) {
    const localRedirectURI = window.location.pathname + window.location.search;
    window.location.href = `${DEV_AUTH_LOGIN_ROUTE}?redirect_uri=${encodeURIComponent(localRedirectURI)}`;
    return;
  }

  window.location.href = `${window.location.origin}/api/login?redirect_uri=${redirectURI}`;
};

export const signOut = async (redirectURI?: string) => {
  redirectURI =
    redirectURI ?? window.location.pathname + window.location.search;

  window.location.href = `${window.location.origin}/api/logout?redirect_uri=${redirectURI}`;
};
