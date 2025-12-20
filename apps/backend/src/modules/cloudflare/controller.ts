import { GraphQLError } from "graphql";

import { StaffMemberModel } from "@repo/common";

import { RequestContext } from "../../types/request-context";

interface CloudflareDataPoint {
  date: string;
  uniqueVisitors: number;
  totalRequests: number;
}

interface CloudflareAnalyticsData {
  dataPoints: CloudflareDataPoint[];
  totalUniqueVisitors: number;
  totalRequests: number;
}

interface CloudflareGroupData {
  dimensions: {
    date?: string;
    datetime?: string;
  };
  sum: {
    requests: number;
  };
  uniq: {
    uniques: number;
  };
}

interface CloudflareAPIResponse {
  data: {
    viewer: {
      zones: Array<{
        httpRequests1dGroups?: CloudflareGroupData[];
        httpRequests1hGroups?: CloudflareGroupData[];
      }>;
    };
  };
  errors?: Array<{ message: string }>;
}

export const getCloudflareAnalyticsData = async (
  context: RequestContext,
  days: number,
  granularity: "day" | "hour" = "day"
): Promise<CloudflareAnalyticsData> => {
  if (!context.user?._id) {
    throw new GraphQLError("Authentication required", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  // Verify staff member
  const staffMember = await StaffMemberModel.findOne({
    userId: context.user._id,
  }).lean();

  if (!staffMember) {
    throw new GraphQLError(
      "Only staff members can access Cloudflare analytics",
      {
        extensions: { code: "FORBIDDEN" },
      }
    );
  }

  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;

  // Return empty data if credentials are not configured
  if (!apiToken || !zoneId) {
    return {
      dataPoints: [],
      totalUniqueVisitors: 0,
      totalRequests: 0,
    };
  }

  // Calculate date range
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const formatDate = (d: Date) => d.toISOString().split("T")[0];
  const formatDatetime = (d: Date) => d.toISOString();

  // Cloudflare GraphQL Analytics API query - different for daily vs hourly
  let query: string;

  if (granularity === "hour") {
    query = `
      query {
        viewer {
          zones(filter: { zoneTag: "${zoneId}" }) {
            httpRequests1hGroups(
              limit: 10000
              filter: { datetime_geq: "${formatDatetime(startDate)}", datetime_lt: "${formatDatetime(endDate)}" }
              orderBy: [datetime_ASC]
            ) {
              dimensions {
                datetime
              }
              sum {
                requests
              }
              uniq {
                uniques
              }
            }
          }
        }
      }
    `;
  } else {
    query = `
      query {
        viewer {
          zones(filter: { zoneTag: "${zoneId}" }) {
            httpRequests1dGroups(
              limit: 365
              filter: { date_geq: "${formatDate(startDate)}", date_lt: "${formatDate(endDate)}" }
              orderBy: [date_ASC]
            ) {
              dimensions {
                date
              }
              sum {
                requests
              }
              uniq {
                uniques
              }
            }
          }
        }
      }
    `;
  }

  try {
    const response = await fetch(
      "https://api.cloudflare.com/client/v4/graphql",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiToken}`,
        },
        body: JSON.stringify({ query }),
      }
    );

    if (!response.ok) {
      throw new GraphQLError(`Cloudflare API error: ${response.statusText}`, {
        extensions: { code: "INTERNAL_SERVER_ERROR" },
      });
    }

    const result = (await response.json()) as CloudflareAPIResponse;

    if (result.errors && result.errors.length > 0) {
      throw new GraphQLError(
        `Cloudflare API error: ${result.errors[0].message}`,
        {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        }
      );
    }

    const zones = result.data?.viewer?.zones;
    if (!zones || zones.length === 0) {
      return {
        dataPoints: [],
        totalUniqueVisitors: 0,
        totalRequests: 0,
      };
    }

    const httpRequestsData =
      granularity === "hour"
        ? zones[0].httpRequests1hGroups || []
        : zones[0].httpRequests1dGroups || [];

    const dataPoints: CloudflareDataPoint[] = httpRequestsData.map((group) => ({
      date:
        granularity === "hour"
          ? group.dimensions.datetime || ""
          : group.dimensions.date || "",
      uniqueVisitors: group.uniq.uniques,
      totalRequests: group.sum.requests,
    }));

    const totalUniqueVisitors = dataPoints.reduce(
      (sum, dp) => sum + dp.uniqueVisitors,
      0
    );
    const totalRequests = dataPoints.reduce(
      (sum, dp) => sum + dp.totalRequests,
      0
    );

    return {
      dataPoints,
      totalUniqueVisitors,
      totalRequests,
    };
  } catch (error) {
    if (error instanceof GraphQLError) {
      throw error;
    }
    throw new GraphQLError(
      `Failed to fetch Cloudflare analytics: ${(error as Error).message}`,
      {
        extensions: { code: "INTERNAL_SERVER_ERROR" },
      }
    );
  }
};
