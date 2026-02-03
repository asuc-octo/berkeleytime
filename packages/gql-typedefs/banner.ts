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
    clickCount: Int!
    dismissCount: Int!
    viewCount: Int!
    clickEventLogging: Boolean!
    currentVersion: Int!
    createdAt: String!
    updatedAt: String!
  }

  """
  A snapshot of banner content at a specific version.
  """
  type BannerSnapshot {
    text: String
    link: String
    linkText: String
    persistent: Boolean
    reappearing: Boolean
    clickEventLogging: Boolean
  }

  """
  A version history entry for a banner.
  """
  type BannerVersionEntry {
    version: Int!
    changedFields: [String!]!
    timestamp: String!
    snapshot: BannerSnapshot!
  }

  """
  Click statistics for a specific banner version.
  """
  type BannerVersionClickStats {
    version: Int!
    clickCount: Int!
    uniqueVisitors: Int!
  }

  type Query {
    """
    Get all banners.
    """
    allBanners: [Banner!]!

    """
    Get the version history for a banner. Staff only.
    """
    bannerVersionHistory(bannerId: ID!): [BannerVersionEntry!]! @auth

    """
    Get click statistics grouped by banner version. Staff only.
    """
    bannerClickStatsByVersion(
      bannerId: ID!
      startDate: String
      endDate: String
    ): [BannerVersionClickStats!]! @auth
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
    clickEventLogging: Boolean
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
    clickEventLogging: Boolean
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

    """
    Increment the click count for a banner link. Public.
    """
    incrementBannerClick(bannerId: ID!): Banner!

    """
    Increment the dismiss count for a banner. Public.
    """
    incrementBannerDismiss(bannerId: ID!): Banner!

    """
    Track a banner view. Public.
    """
    trackBannerView(bannerId: ID!): Boolean!
  }
`;
