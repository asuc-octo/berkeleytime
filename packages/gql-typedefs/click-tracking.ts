import { gql } from "graphql-tag";

// create a click event to record timestamp and other relavent information
// to access click counts, staff is required

export const clickEventTypeDef = gql`
  """
  A single click event recorded for intensive tracking.
  """
  type ClickEvent @cacheControl(maxAge: 0) {
    id: ID!
    targetId: ID!
    targetType: String!
    targetVersion: Int
    additionalInfo: String
    timestamp: String!
    ipHash: String!
    userAgent: String
    referrer: String
    sessionFingerprint: String!
  }

  """
  Paginated response for click events.
  """
  type ClickEventConnection {
    events: [ClickEvent!]!
    totalCount: Int!
    hasMore: Boolean!
  }

  """
  Aggregated click statistics.
  """
  type ClickStats {
    totalClicks: Int!
    uniqueVisitors: Int!
  }

  """
  A single point in a click events time series (e.g. one day).
  """
  type ClickEventsTimeSeriesPoint {
    date: String!
    count: Int!
  }

  type Query {
    """
    Get click events for a specific target. Staff only.
    """
    clickEvents(
      targetId: ID!
      targetType: String!
      startDate: String
      endDate: String
      limit: Int
      offset: Int
    ): ClickEventConnection! @auth

    """
    Get aggregated click statistics for a specific target. Staff only.
    """
    clickStats(
      targetId: ID!
      targetType: String!
      startDate: String
      endDate: String
    ): ClickStats! @auth

    """
    Get click counts per day for a target. Staff only.
    """
    clickEventsTimeSeries(
      targetId: ID!
      targetType: String!
      startDate: String
      endDate: String
    ): [ClickEventsTimeSeriesPoint!]! @auth
  }
`;
