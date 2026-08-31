import { gql } from "graphql-tag";

export const navItemTypeDef = gql`
  """
  An extra item displayed in the site navigation bar.
  """
  type NavItem @cacheControl(maxAge: 0) {
    id: ID!
    label: String!
    url: String!
    badgeText: String
    order: Int!
    visible: Boolean!
    clickCount: Int!
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    """
    Get all visible navigation items. Public.
    """
    allNavItems: [NavItem!]!

    """
    Get all navigation items including hidden ones. Staff only.
    """
    allNavItemsForStaff: [NavItem!]! @auth
  }

  """
  Input for creating a navigation item.
  """
  input CreateNavItemInput {
    label: String!
    url: String!
    badgeText: String
    order: Int
    visible: Boolean
  }

  """
  Input for updating a navigation item.
  """
  input UpdateNavItemInput {
    label: String
    url: String
    badgeText: String
    order: Int
    visible: Boolean
  }

  type Mutation {
    """
    Create a new navigation item. Staff only.
    """
    createNavItem(input: CreateNavItemInput!): NavItem! @auth

    """
    Update a navigation item by ID. Staff only.
    """
    updateNavItem(navItemId: ID!, input: UpdateNavItemInput!): NavItem! @auth

    """
    Delete a navigation item by ID. Staff only.
    """
    deleteNavItem(navItemId: ID!): Boolean! @auth
  }
`;
