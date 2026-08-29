import { gql } from "@apollo/client";

export const TRACK_EVENTS = gql`
  mutation TrackEvents($events: [TrackingEventInput!]!) {
    trackEvents(events: $events)
  }
`;
