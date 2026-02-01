import { gql } from "@apollo/client";

export interface IUser {
  _id: string;
  name: string;
  staff: boolean;
  email: string;
}

export interface ReadUserResponse {
  user: IUser;
}

const getDevFrontendPort = () => {
  const port = parseInt(window.location.port || "3000", 10);
  return Math.floor(port / 100) * 100;
};

export const BASE = import.meta.env.DEV
  ? `http://localhost:${getDevFrontendPort()}`
  : "https://berkeleytime.com";

export const READ_USER = gql`
  query GetUser {
    user {
      _id
      email
      name
      staff
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
