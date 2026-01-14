import { gql } from "@apollo/client";

// Types
export interface RatingDataPoint {
  createdAt: string;
  userEmail: string;
  courseKey: string;
}

export interface RatingMetricDataPoint {
  createdAt: string;
  metricName: string;
  value: number;
  courseKey: string;
}

export interface OptionalResponseDataPoint {
  createdAt: string;
  hasOptional: boolean;
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

export interface CustomCollectionDetail {
  userEmail: string;
  classCount: number;
  name: string;
  createdAt: string;
}

export interface CollectionAnalyticsData {
  collectionCreations: CollectionCreationDataPoint[];
  classAdditions: ClassAdditionDataPoint[];
  customCollectionCreations: CollectionCreationDataPoint[];
  usersWithCustomCollections: CollectionCreationDataPoint[];
  customCollections: CustomCollectionDetail[];
  highlights: CollectionHighlights;
}

export interface CloudflareAnalyticsDataPoint {
  date: string;
  uniqueVisitors: number;
  totalRequests: number;
}

export interface CloudflareAnalyticsData {
  dataPoints: CloudflareAnalyticsDataPoint[];
  totalUniqueVisitors: number;
  totalRequests: number;
}

export interface GradTrakAnalyticsDataPoint {
  planId: string;
  userEmail: string;
  majors: string[];
  minors: string[];
  colleges: string[];
  totalCourses: number;
  startYear: number | null;
  createdAt: string;
}

// Queries
export const RATING_ANALYTICS_DATA = gql`
  query RatingAnalyticsData {
    ratingAnalyticsData {
      createdAt
      userEmail
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

export const OPTIONAL_RESPONSE_ANALYTICS_DATA = gql`
  query OptionalResponseAnalyticsData {
    optionalResponseAnalyticsData {
      createdAt
      hasOptional
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
      customCollections {
        userEmail
        classCount
        name
        createdAt
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

export const CLOUDFLARE_ANALYTICS_DATA = gql`
  query CloudflareAnalyticsData($days: Int!, $granularity: String) {
    cloudflareAnalyticsData(days: $days, granularity: $granularity) {
      dataPoints {
        date
        uniqueVisitors
        totalRequests
      }
      totalUniqueVisitors
      totalRequests
    }
  }
`;

export const GRADTRAK_ANALYTICS_DATA = gql`
  query GradTrakAnalyticsData {
    gradTrakAnalyticsData {
      planId
      userEmail
      majors
      minors
      colleges
      totalCourses
      startYear
      createdAt
    }
  }
`;

export interface SchedulerAnalyticsDataPoint {
  scheduleId: string;
  userEmail: string;
  totalClasses: number;
  semester: string;
  year: number;
  createdAt: string;
}

export const SCHEDULER_ANALYTICS_DATA = gql`
  query SchedulerAnalyticsData {
    schedulerAnalyticsData {
      scheduleId
      userEmail
      totalClasses
      semester
      year
      createdAt
    }
  }
`;
