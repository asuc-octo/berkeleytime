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

export interface CollectionCreationDataPoint {
  createdAt: string;
  userId: string;
}

export interface ClassAdditionDataPoint {
  addedAt: string;
  userId: string;
}

export interface CollectionAnalyticsData {
  collectionCreations: CollectionCreationDataPoint[];
  classAdditions: ClassAdditionDataPoint[];
  customCollectionCreations: CollectionCreationDataPoint[];
  usersWithCustomCollections: CollectionCreationDataPoint[];
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

export const COLLECTION_ANALYTICS_DATA = gql`
  query CollectionAnalyticsData {
    collectionAnalyticsData {
      collectionCreations {
        createdAt
        userId
      }
      classAdditions {
        addedAt
        userId
      }
      customCollectionCreations {
        createdAt
        userId
      }
      usersWithCustomCollections {
        createdAt
        userId
      }
    }
  }
`;
