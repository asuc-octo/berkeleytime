import { gql } from "@apollo/client";

export interface TrackingEventTimeSeriesPoint {
  date: string;
  count: number;
}

export const TRACKING_EVENTS_TIME_SERIES = gql`
  query TrackingEventsTimeSeries(
    $eventType: String
    $targetType: String
    $targetId: String
    $startDate: String
    $endDate: String
  ) {
    trackingEventsTimeSeries(
      eventType: $eventType
      targetType: $targetType
      targetId: $targetId
      startDate: $startDate
      endDate: $endDate
    ) {
      date
      count
    }
  }
`;
