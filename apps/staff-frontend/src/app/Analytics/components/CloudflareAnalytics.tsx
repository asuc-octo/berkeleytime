import { useMemo, useState } from "react";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import { LoadingIndicator } from "@repo/theme";

import {
  ChartContainer,
  ChartTooltip,
  createChartConfig,
} from "@/components/Chart";
import { useCloudflareAnalyticsData } from "@/hooks/api";

import { AnalyticsCard, TimeRange } from "./AnalyticsCard";

interface ChartDataPoint {
  date: string;
  displayDate: string;
  uniqueVisitors: number;
  totalRequests: number;
}

// Helper to get time range in days
function getTimeRangeDays(timeRange: TimeRange): number {
  if (timeRange === "7d") return 7;
  if (timeRange === "90d") return 90;
  return 30;
}

// Format large numbers (e.g., 199830 -> "199.83k")
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(2)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(2)}k`;
  }
  return num.toString();
}

// Format date for display (YYYY-MM-DD -> "Dec 19")
function formatDisplayDate(dateStr: string): string {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const [, month, day] = dateStr.split("-");
  return `${monthNames[parseInt(month) - 1]} ${parseInt(day)}`;
}

// Unique Visitors Block
export function UniqueVisitorsBlock() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const days = getTimeRangeDays(timeRange);
  // Fetch double the days to compare current period vs previous period
  const { data, loading, error } = useCloudflareAnalyticsData(days * 2);

  const { chartData, totalVisitors, percentChange } = useMemo(() => {
    if (!data || data.dataPoints.length === 0) {
      return {
        chartData: [] as ChartDataPoint[],
        totalVisitors: 0,
        percentChange: 0,
      };
    }

    // Split into previous period and current period
    const allData = data.dataPoints;
    const midpoint = Math.floor(allData.length / 2);
    const previousPeriod = allData.slice(0, midpoint);
    const currentPeriod = allData.slice(midpoint);

    // Only show current period in the chart
    const chartData: ChartDataPoint[] = currentPeriod.map((dp) => ({
      date: dp.date,
      displayDate: formatDisplayDate(dp.date),
      uniqueVisitors: dp.uniqueVisitors,
      totalRequests: dp.totalRequests,
    }));

    const totalVisitors = currentPeriod.reduce(
      (sum, dp) => sum + dp.uniqueVisitors,
      0
    );
    const avgPerDay =
      chartData.length > 0 ? totalVisitors / chartData.length : 0;

    // Calculate percent change comparing current period to previous period
    const previousTotal = previousPeriod.reduce(
      (sum, dp) => sum + dp.uniqueVisitors,
      0
    );

    const percentChange =
      previousTotal > 0
        ? ((totalVisitors - previousTotal) / previousTotal) * 100
        : 0;

    return { chartData, totalVisitors, avgPerDay, percentChange };
  }, [data]);

  const chartConfig = createChartConfig(["uniqueVisitors"], {
    labels: { uniqueVisitors: "Unique Visitors" },
    colors: { uniqueVisitors: "var(--heading-color)" },
  });

  if (loading) {
    return (
      <AnalyticsCard
        title="Unique Visitors"
        description="Daily unique visitors from Cloudflare"
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
          }}
        >
          <LoadingIndicator />
        </div>
      </AnalyticsCard>
    );
  }

  if (error) {
    return (
      <AnalyticsCard
        title="Unique Visitors"
        description="Daily unique visitors from Cloudflare"
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            color: "var(--red-500)",
          }}
        >
          Error loading data
        </div>
      </AnalyticsCard>
    );
  }

  if (!data || data.dataPoints.length === 0) {
    return (
      <AnalyticsCard
        title="Unique Visitors"
        description="Daily unique visitors from Cloudflare"
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            color: "var(--label-color)",
          }}
        >
          Cloudflare not configured
        </div>
      </AnalyticsCard>
    );
  }

  return (
    <AnalyticsCard
      title="Unique Visitors"
      description={`From Cloudflare (${timeRange})`}
      currentValue={totalVisitors}
      currentValueLabel="visitors"
      percentChange={percentChange}
      changeTimescale={timeRange}
      showTimeRangeSelector
      timeRange={timeRange}
      onTimeRangeChange={setTimeRange}
    >
      <ChartContainer config={chartConfig} style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient
                id="uniqueVisitorsGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--heading-color)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="var(--heading-color)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border-color)"
              vertical={false}
            />
            <XAxis
              dataKey="displayDate"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--label-color)", fontSize: 10 }}
              interval="preserveStartEnd"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--label-color)", fontSize: 12 }}
              width={50}
              tickFormatter={(value) => formatNumber(value)}
            />
            <ChartTooltip
              tooltipConfig={{
                labelFormatter: (_, payload) =>
                  payload?.[0]?.payload?.displayDate || "",
                valueFormatter: (value: number) => value.toLocaleString(),
              }}
            />
            <Area
              type="monotone"
              dataKey="uniqueVisitors"
              stroke="var(--heading-color)"
              strokeWidth={2}
              fill="url(#uniqueVisitorsGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    </AnalyticsCard>
  );
}

// Total Requests Block
export function TotalRequestsBlock() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const days = getTimeRangeDays(timeRange);
  // Fetch double the days to compare current period vs previous period
  const { data, loading, error } = useCloudflareAnalyticsData(days * 2);

  const { chartData, totalRequests, percentChange } = useMemo(() => {
    if (!data || data.dataPoints.length === 0) {
      return {
        chartData: [] as ChartDataPoint[],
        totalRequests: 0,
        percentChange: 0,
      };
    }

    // Split into previous period and current period
    const allData = data.dataPoints;
    const midpoint = Math.floor(allData.length / 2);
    const previousPeriod = allData.slice(0, midpoint);
    const currentPeriod = allData.slice(midpoint);

    // Only show current period in the chart
    const chartData: ChartDataPoint[] = currentPeriod.map((dp) => ({
      date: dp.date,
      displayDate: formatDisplayDate(dp.date),
      uniqueVisitors: dp.uniqueVisitors,
      totalRequests: dp.totalRequests,
    }));

    const totalRequests = currentPeriod.reduce(
      (sum, dp) => sum + dp.totalRequests,
      0
    );
    const avgPerDay =
      chartData.length > 0 ? totalRequests / chartData.length : 0;

    // Calculate percent change comparing current period to previous period
    const previousTotal = previousPeriod.reduce(
      (sum, dp) => sum + dp.totalRequests,
      0
    );

    const percentChange =
      previousTotal > 0
        ? ((totalRequests - previousTotal) / previousTotal) * 100
        : 0;

    return { chartData, totalRequests, avgPerDay, percentChange };
  }, [data]);

  const chartConfig = createChartConfig(["totalRequests"], {
    labels: { totalRequests: "Total Requests" },
    colors: { totalRequests: "var(--heading-color)" },
  });

  if (loading) {
    return (
      <AnalyticsCard
        title="Total Requests"
        description="Daily total requests from Cloudflare"
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
          }}
        >
          <LoadingIndicator />
        </div>
      </AnalyticsCard>
    );
  }

  if (error) {
    return (
      <AnalyticsCard
        title="Total Requests"
        description="Daily total requests from Cloudflare"
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            color: "var(--red-500)",
          }}
        >
          Error loading data
        </div>
      </AnalyticsCard>
    );
  }

  if (!data || data.dataPoints.length === 0) {
    return (
      <AnalyticsCard
        title="Total Requests"
        description="Daily total requests from Cloudflare"
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            color: "var(--label-color)",
          }}
        >
          Cloudflare not configured
        </div>
      </AnalyticsCard>
    );
  }

  return (
    <AnalyticsCard
      title="Total Requests"
      description={`From Cloudflare (${timeRange})`}
      currentValue={totalRequests}
      currentValueLabel="requests"
      percentChange={percentChange}
      changeTimescale={timeRange}
      showTimeRangeSelector
      timeRange={timeRange}
      onTimeRangeChange={setTimeRange}
    >
      <ChartContainer config={chartConfig} style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient
                id="totalRequestsGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--heading-color)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="var(--heading-color)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border-color)"
              vertical={false}
            />
            <XAxis
              dataKey="displayDate"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--label-color)", fontSize: 10 }}
              interval="preserveStartEnd"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--label-color)", fontSize: 12 }}
              width={50}
              tickFormatter={(value) => formatNumber(value)}
            />
            <ChartTooltip
              tooltipConfig={{
                labelFormatter: (_, payload) =>
                  payload?.[0]?.payload?.displayDate || "",
                valueFormatter: (value: number) => value.toLocaleString(),
              }}
            />
            <Area
              type="monotone"
              dataKey="totalRequests"
              stroke="var(--heading-color)"
              strokeWidth={2}
              fill="url(#totalRequestsGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    </AnalyticsCard>
  );
}
