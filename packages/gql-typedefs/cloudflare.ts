import { gql } from "graphql-tag";

/**
 * Cloudflare analytics type definitions.
 * Note: Query is defined in analytics.ts, not here.
 */
export const cloudflareTypeDef = gql`
  """
  A single data point for Cloudflare analytics over time
  """
  type CloudflareAnalyticsDataPoint @cacheControl(maxAge: 0) {
    "Date in YYYY-MM-DD format (daily) or ISO datetime (hourly)"
    date: String!
    "Number of unique visitors"
    uniqueVisitors: Int!
    "Total number of requests"
    totalRequests: Int!
  }

  """
  Cloudflare analytics data with summary statistics
  """
  type CloudflareAnalyticsData @cacheControl(maxAge: 0) {
    "Time series data points"
    dataPoints: [CloudflareAnalyticsDataPoint!]!
    "Total unique visitors in the period"
    totalUniqueVisitors: Int!
    "Total requests in the period"
    totalRequests: Int!
  }
`;
