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
  courseKey: string;
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

export interface CollectionHighlights {
  largestCollectionSize: number;
  largestCustomCollectionSize: number;
  largestCustomCollectionName: string | null;
  mostBookmarkedCourse: string | null;
  mostBookmarkedCourseCount: number;
  mostCollectionsByUser: number;
}

export interface CollectionAnalyticsData {
  collectionCreations: CollectionCreationDataPoint[];
  classAdditions: ClassAdditionDataPoint[];
  customCollectionCreations: CollectionCreationDataPoint[];
  usersWithCustomCollections: CollectionCreationDataPoint[];
  highlights: CollectionHighlights;
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
      courseKey
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
      highlights {
        largestCollectionSize
        largestCustomCollectionSize
        largestCustomCollectionName
        mostBookmarkedCourse
        mostBookmarkedCourseCount
        mostCollectionsByUser
      }
    }
  }
`;
