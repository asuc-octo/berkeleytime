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
  """
  Daily aggregated activity across features (schedules, ratings, GradTrak, bookmarks)
  """
  type GeneralActivityDataPoint {
    date: String!
    schedulesCreated: Int!
    ratingsSubmitted: Int!
    gradTraksCreated: Int!
    bookmarksAdded: Int!
    totalActivity: Int!
  }

  """
  Activity score distribution bucket for analytics
  """
  type ActivityScoreDistributionPoint {
    "Score range label, e.g. '0.0–0.1'"
    bucket: String!
    "Number of users in this bucket"
    count: Int!
    "Percentage of total users in this bucket"
    percent: Float!
  }

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
    Staff-only: User activity data (lastSeenAt timestamps) for analytics
    """
    userActivityAnalyticsData: [UserActivityDataPoint!]! @auth

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

    """
    Staff-only: Daily activity aggregated across all features (schedules, ratings, GradTrak, bookmarks)
    """
    generalActivityAnalytics(days: Int!): [GeneralActivityDataPoint!]! @auth
    """
    Staff-only: Activity score distribution across all users (10 buckets of 0.1 width).
    Pass a formula name to compare different scoring approaches without persisting to the DB.
    Valid values: exponentialDecay | linearDecay | tiered | sigmoid
    """
    activityScoreDistribution(formula: String): [ActivityScoreDistributionPoint!]! @auth

    """
    Staff-only: Active users count grouped by time period.
    granularity must be "week" or "month".
    """
    activeUsersAnalyticsData(granularity: String!): [ActiveUsersDataPoint!]!
      @auth
  }
`;
