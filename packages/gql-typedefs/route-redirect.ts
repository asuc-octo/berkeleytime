import { gql } from "graphql-tag";

export const routeRedirectTypeDef = gql`
  """
  A route redirect that maps one path to another.
  """
  type RouteRedirect @cacheControl(maxAge: 0) {
    id: ID!
    fromPath: String!
    toPath: String!
    clickCount: Int!
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    """
    Get all route redirects.
    """
    allRouteRedirects: [RouteRedirect!]!
  }

  """
  Input for creating a route redirect.
  """
  input CreateRouteRedirectInput {
    fromPath: String!
    toPath: String!
  }

  """
  Input for updating a route redirect.
  """
  input UpdateRouteRedirectInput {
    fromPath: String
    toPath: String
  }

  type Mutation {
    """
    Create a new route redirect. Staff only.
    """
    createRouteRedirect(input: CreateRouteRedirectInput!): RouteRedirect! @auth

    """
    Update a route redirect by ID. Staff only.
    """
    updateRouteRedirect(
      redirectId: ID!
      input: UpdateRouteRedirectInput!
    ): RouteRedirect! @auth

    """
    Delete a route redirect by ID. Staff only.
    """
    deleteRouteRedirect(redirectId: ID!): Boolean! @auth

    """
    Increment the click count for a route redirect. Public.
    """
    incrementRouteRedirectClick(redirectId: ID!): RouteRedirect!
  }
`;
