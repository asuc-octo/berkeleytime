import { gql } from "graphql-tag";

export const trackingTypeDef = gql`
  """
  Input for a single tracking event. Clients should batch multiple events
  into a single trackEvents mutation call.
  """
  input TrackingEventInput {
    "The type of interaction: click, view, dismiss, search, search_click, etc."
    eventType: String!

    "What was acted on: banner, redirect, targeted-message, class, course, schedule, etc."
    targetType: String!

    "Identifier of the target, if applicable."
    targetId: String

    "Arbitrary JSON payload for event-specific context."
    metadata: JSON
    
    "Client-set ISO 8601 timestamp for accurate timing."
    timestamp: String!
  }

  """
  A single persisted tracking event.
  """
  type TrackingEvent @cacheControl(maxAge: 0) {
    id: ID!
    eventType: String!
    targetType: String!
    targetId: String
    metadata: JSON
    sessionId: String!
    userId: String
    timestamp: String!
    ipHash: String!
    userAgent: String
    referrer: String
  }

  """
  Paginated response for tracking events.
  """
  type TrackingEventConnection {
    events: [TrackingEvent!]!
    totalCount: Int!
    hasMore: Boolean!
  }

  """
  A single point in a tracking events time series (e.g. one day).
  """
  type TrackingEventTimeSeriesPoint {
    date: String!
    count: Int!
  }

  type Mutation {
    """
    Record tracking events. Accepts up to 50 events per call.
    Server enriches each event with session, user, and request metadata.
    """
    trackEvents(events: [TrackingEventInput!]!): Boolean
  }

  type Query {
    """
    Query tracking events with optional filters. Staff only.
    """
    trackingEvents(
      eventType: String
      targetType: String
      targetId: String
      startDate: String
      endDate: String
      limit: Int
      offset: Int
    ): TrackingEventConnection! @auth

    """
    Get event counts per day for a given filter. Staff only.
    """
    trackingEventsTimeSeries(
      eventType: String
      targetType: String
      targetId: String
      startDate: String
      endDate: String
    ): [TrackingEventTimeSeriesPoint!]! @auth
  }
`;
