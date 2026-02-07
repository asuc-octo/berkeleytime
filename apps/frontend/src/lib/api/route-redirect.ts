import { gql } from "@apollo/client";

export const GET_ALL_ROUTE_REDIRECTS = gql`
  query GetAllRouteRedirects {
    allRouteRedirects {
      id
      fromPath
      toPath
      clickCount
      createdAt
      updatedAt
    }
  }
`;

export const INCREMENT_ROUTE_REDIRECT_CLICK = gql`
  mutation IncrementRouteRedirectClick($redirectId: ID!) {
    incrementRouteRedirectClick(redirectId: $redirectId) {
      id
      clickCount
    }
  }
`;
