import { gql } from "graphql-tag";

export const bannerTypeDef = gql`
  """
  A banner displayed at the top of the website.
  """
  type Banner @cacheControl(maxAge: 0) {
    id: ID!
    text: String!
    link: String
    linkText: String
    persistent: Boolean!
    reappearing: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    """
    Get all banners.
    """
    allBanners: [Banner!]!
  }

  """
  Input for creating a banner.
  """
  input CreateBannerInput {
    text: String!
    link: String
    linkText: String
    persistent: Boolean!
    reappearing: Boolean!
  }

  """
  Input for updating a banner.
  """
  input UpdateBannerInput {
    text: String
    link: String
    linkText: String
    persistent: Boolean
    reappearing: Boolean
  }

  type Mutation {
    """
    Create a new banner. Staff only.
    """
    createBanner(input: CreateBannerInput!): Banner! @auth

    """
    Update a banner by ID. Staff only.
    """
    updateBanner(bannerId: ID!, input: UpdateBannerInput!): Banner! @auth

    """
    Delete a banner by ID. Staff only.
    """
    deleteBanner(bannerId: ID!): Boolean! @auth
  }
`;
