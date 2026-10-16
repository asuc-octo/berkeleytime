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

    "Client clock for diagnostics only. Reporting uses server receipt time."
    timestamp: String!
  }

  """
  A single point in a tracking events time series (e.g. one day).
  """
  type TrackingEventTimeSeriesPoint @cacheControl(maxAge: 0) {
    date: String!
    count: Int!
  }

  type Mutation {
    """
    Record tracking events. Accepts up to 50 events per call.
    Server enriches each event with session, user, and request metadata.
    Collection is best-effort and subject to paced event budgets.
    """
    trackEvents(events: [TrackingEventInput!]!): Boolean
  }

  type Query {
    """
    Get event counts per day for a given filter. Staff only.
    Outreach clicks include only server-observed redirects, excluding historical
    records with unknown provenance. Other client events remain unverified.
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
