import { gql } from "graphql-tag";

/**
 * Consolidated analytics GraphQL schema
 *
 * This typeDef extends the Query type with all analytics queries.
 * The analytics types (UserCreationDataPoint, SchedulerAnalyticsDataPoint, etc.)
 * are defined in their respective domain files (user.ts, schedule.ts, etc.)
 * and are available here since all typeDefs are merged.
 *
 * All queries require staff authentication.
 */
export const analyticsTypeDef = gql`
  extend type Query {
    """
    Dashboard statistics aggregation
    """
    stats: Stats!

    """
    Staff-only: User creation timestamps for analytics
    """
    userCreationAnalyticsData: [UserCreationDataPoint!]! @auth

    """
    Staff-only: Scheduler analytics data for visualization
    """
    schedulerAnalyticsData: [SchedulerAnalyticsDataPoint!]! @auth

    """
    Staff-only: GradTrak analytics data for visualization
    """
    gradTrakAnalyticsData: [GradTrakAnalyticsDataPoint!]! @auth

    """
    Staff-only: Rating data points for analytics timeseries
    """
    ratingAnalyticsData: [RatingDataPoint!]! @auth

    """
    Staff-only: Rating metric values for analytics (average scores over time)
    """
    ratingMetricsAnalyticsData: [RatingMetricDataPoint!]! @auth

    """
    Staff-only: Optional response data for analytics (Recording/Attendance completion)
    """
    optionalResponseAnalyticsData: [OptionalResponseDataPoint!]! @auth

    """
    Staff-only: Collection analytics data
    """
    collectionAnalyticsData: CollectionAnalyticsData! @auth

    """
    Staff-only: Cloudflare analytics data for the specified number of days and granularity
    """
    cloudflareAnalyticsData(
      days: Int!
      granularity: String
    ): CloudflareAnalyticsData @auth
  }
`;
