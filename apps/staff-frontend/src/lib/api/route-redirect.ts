import { gql } from "@apollo/client";

// Types
export interface RouteRedirect {
  id: string;
  fromPath: string;
  toPath: string;
  clickCount: number;
  clickEventLogging: boolean;
  createdAt: string;
  updatedAt: string;
}

// Queries
export const ALL_ROUTE_REDIRECTS = gql`
  query AllRouteRedirects {
    allRouteRedirects {
      id
      fromPath
      toPath
      clickCount
      clickEventLogging
      createdAt
      updatedAt
    }
  }
`;

// Mutations
export interface CreateRouteRedirectInput {
  fromPath: string;
  toPath: string;
  clickEventLogging?: boolean | null;
}

export interface UpdateRouteRedirectInput {
  fromPath?: string | null;
  toPath?: string | null;
  clickEventLogging?: boolean | null;
}

export const CREATE_ROUTE_REDIRECT = gql`
  mutation CreateRouteRedirect($input: CreateRouteRedirectInput!) {
    createRouteRedirect(input: $input) {
      id
      fromPath
      toPath
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_ROUTE_REDIRECT = gql`
  mutation UpdateRouteRedirect(
    $redirectId: ID!
    $input: UpdateRouteRedirectInput!
  ) {
    updateRouteRedirect(redirectId: $redirectId, input: $input) {
      id
      fromPath
      toPath
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_ROUTE_REDIRECT = gql`
  mutation DeleteRouteRedirect($redirectId: ID!) {
    deleteRouteRedirect(redirectId: $redirectId)
  }
`;
