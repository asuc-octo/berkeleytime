import { gql } from "@apollo/client";

export const CLICK_EVENTS_TIME_SERIES = gql`
  query ClickEventsTimeSeries(
    $targetId: ID!
    $targetType: String!
    $startDate: String
    $endDate: String
  ) {
    clickEventsTimeSeries(
      targetId: $targetId
      targetType: $targetType
      startDate: $startDate
      endDate: $endDate
    ) {
      date
      count
    }
  }
`;
