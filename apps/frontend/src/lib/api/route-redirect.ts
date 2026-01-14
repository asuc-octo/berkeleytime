import { gql } from "@apollo/client";

export const GET_ALL_ROUTE_REDIRECTS = gql`
  query GetAllRouteRedirects {
    allRouteRedirects {
      id
      fromPath
      toPath
      createdAt
      updatedAt
    }
  }
`;
