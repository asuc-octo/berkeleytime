import { gql } from "@apollo/client";

// Types
export interface RatingDataPoint {
  createdAt: string;
  anonymousUserId: string;
  courseKey: string;
}

// Queries
export const RATING_ANALYTICS_DATA = gql`
  query RatingAnalyticsData {
    ratingAnalyticsData {
      createdAt
      anonymousUserId
      courseKey
    }
  }
`;
