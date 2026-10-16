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
  type GeneralActivityDataPoint @cacheControl(maxAge: 0) {
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
  type ActivityScoreDistributionPoint @cacheControl(maxAge: 0) {
    "Score range label, e.g. '0.0–0.1'"
    bucket: String!
    "Lower bound of this bucket (e.g. 0.5 for the 0.5–0.6 bucket)"
    lowerBound: Float!
    "Number of users in this bucket"
    count: Int!
    "Percentage of total users in this bucket"
    percent: Float!
  }

  """
  Unique users who started a Grades session on one day
  """
  type GradesSessionUsersDataPoint @cacheControl(maxAge: 0) {
    date: String!
    "Signed-in users, counted by user id"
    loggedInUsers: Int!
    "Signed-out visitors, estimated by hashed IP"
    anonymousUsers: Int!
    totalUsers: Int!
  }

  """
  Daily Grades session users plus totals that are unique across the range
  """
  type GradesSessionUsersData @cacheControl(maxAge: 0) {
    dataPoints: [GradesSessionUsersDataPoint!]!
    uniqueLoggedInUsers: Int!
    uniqueAnonymousUsers: Int!
    uniqueUsers: Int!
  }

  """
  Vendor (or OS, when the user agent carries no manufacturer) slice within one
  device category
  """
  type DeviceVendorCount @cacheControl(maxAge: 0) {
    name: String!
    users: Int!
  }

  """
  Unique visitors on one macro device category (Mobile/Computer/TV/Other)
  """
  type DeviceCategoryCount @cacheControl(maxAge: 0) {
    category: String!
    users: Int!
    vendors: [DeviceVendorCount!]!
  }

  """
  Device breakdown of tracking-event visitors, parsed from stored user
  agents. A visitor on both a phone and a laptop counts in both categories;
  totalUsers is unique across all of them.
  """
  type DeviceAnalyticsData @cacheControl(maxAge: 0) {
    devices: [DeviceCategoryCount!]!
    totalUsers: Int!
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
    activityScoreDistribution(
      formula: String
    ): [ActivityScoreDistributionPoint!]! @auth

    """
    Staff-only: Daily unique users who started a Grades session (added their first course)
    """
    gradesSessionUsers(days: Int!): GradesSessionUsersData! @auth

    """
    Staff-only: Unique visitors by device category, parsed from
    tracking-event user agents. Pass a targetType (e.g. "grades") to scope to
    one feature's events; omit it for site-wide numbers.
    """
    deviceAnalyticsData(days: Int!, targetType: String): DeviceAnalyticsData!
      @auth
  }
`;
