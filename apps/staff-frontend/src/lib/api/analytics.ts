import { gql } from "@apollo/client";

// Types
export interface RatingDataPoint {
  createdAt: string;
  anonymousUserId: string;
  courseKey: string;
}

export interface RatingMetricDataPoint {
  createdAt: string;
  metricName: string;
  value: number;
}

export interface UserCreationDataPoint {
  createdAt: string;
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

export const RATING_METRICS_ANALYTICS_DATA = gql`
  query RatingMetricsAnalyticsData {
    ratingMetricsAnalyticsData {
      createdAt
      metricName
      value
    }
  }
`;

export const USER_CREATION_ANALYTICS_DATA = gql`
  query UserCreationAnalyticsData {
    userCreationAnalyticsData {
      createdAt
    }
  }
`;
