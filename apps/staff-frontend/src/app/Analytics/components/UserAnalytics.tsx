import { useMemo, useState } from "react";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
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
import { useUserCreationAnalyticsData } from "@/hooks/api";

import { AnalyticsCard, Granularity, TimeRange } from "./AnalyticsCard";

interface DailyDataPoint {
  date: string;
  dateKey: string;
  value: number;
}

// Helper to get time range in days
function getTimeRangeDays(timeRange: TimeRange): number {
  if (timeRange === "7d") return 7;
  if (timeRange === "90d") return 90;
  return 30;
}

// Helper to get granularity bucket key
function getGranularityKey(date: Date, granularity: Granularity): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");

  if (granularity === "hour") {
    return `${year}-${month}-${day}-${hour}`;
  }
  return `${year}-${month}-${day}`;
}

// Helper to format display date based on granularity
function formatDisplayDate(key: string, granularity: Granularity): string {
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
  const parts = key.split("-");
  const month = monthNames[parseInt(parts[1]) - 1];
  const day = parseInt(parts[2]);

  if (granularity === "hour") {
    const hour = parseInt(parts[3]);
    return `${month} ${day} ${hour}:00`;
  }
  return `${month} ${day}`;
}

// User Growth Block - accounts created in the last month (per day)
export function UserGrowthBlock() {
  const { data: rawData, loading, error } = useUserCreationAnalyticsData();
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [granularity, setGranularity] = useState<Granularity>("day");

  const { chartData, totalUsers, newInRange, percentGrowth } = useMemo(() => {
    if (!rawData || rawData.length === 0) {
      return {
        chartData: [] as DailyDataPoint[],
        totalUsers: 0,
        newInRange: 0,
        percentGrowth: 0,
      };
    }

    const days = getTimeRangeDays(timeRange);
    const now = new Date();
    const rangeStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    // Sort all users by creation time
    const sortedUsers = [...rawData].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // Count users created before the window (baseline)
    let baselineCount = 0;
    for (const user of sortedUsers) {
      if (new Date(user.createdAt) < rangeStart) {
        baselineCount++;
      } else {
        break;
      }
    }

    // Initialize buckets based on granularity
    const bucketMap = new Map<string, number>();
    for (let d = new Date(rangeStart); d <= now; ) {
      const key = getGranularityKey(d, granularity);
      bucketMap.set(key, 0);
      if (granularity === "hour") {
        d.setHours(d.getHours() + 1);
      } else {
        d.setDate(d.getDate() + 1);
      }
    }

    // Count new users per bucket
    sortedUsers.forEach((point) => {
      const date = new Date(point.createdAt);
      if (date >= rangeStart && date <= now) {
        const key = getGranularityKey(date, granularity);
        bucketMap.set(key, (bucketMap.get(key) || 0) + 1);
      }
    });

    // Convert to sorted array with cumulative values
    const sortedKeys = Array.from(bucketMap.keys()).sort();

    let cumulative = baselineCount;
    const chartData: DailyDataPoint[] = sortedKeys.map((key) => {
      cumulative += bucketMap.get(key) || 0;
      return {
        date: formatDisplayDate(key, granularity),
        dateKey: key,
        value: cumulative,
      };
    });

    const totalUsers = cumulative;
    const newInRange = totalUsers - baselineCount;
    const percentGrowth =
      baselineCount > 0 ? (newInRange / baselineCount) * 100 : 0;

    return { chartData, totalUsers, newInRange, percentGrowth };
  }, [rawData, timeRange, granularity]);

  const chartConfig = createChartConfig(["value"], {
    labels: { value: "Total Users" },
    colors: { value: "var(--heading-color)" },
  });

  if (loading) {
    return (
      <AnalyticsCard
        title="User Growth"
        description="New accounts created per day (30d)"
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
        title="User Growth"
        description="New accounts created per day (30d)"
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

  return (
    <AnalyticsCard
      title="User Growth"
      description={`Cumulative user accounts (${timeRange})`}
      currentValue={totalUsers}
      currentValueLabel="users"
      absoluteChange={newInRange}
      percentChange={percentGrowth}
      changeTimescale={timeRange}
      showTimeRangeSelector
      timeRange={timeRange}
      onTimeRangeChange={(val) => {
        setTimeRange(val);
        setGranularity(val === "7d" ? "hour" : "day");
      }}
      granularity={granularity}
      onGranularityChange={setGranularity}
    >
      <ChartContainer config={chartConfig} style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient
                id="userGrowthGradient"
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
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--label-color)", fontSize: 10 }}
              interval="preserveStartEnd"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--label-color)", fontSize: 12 }}
              width={40}
              domain={["auto", "auto"]}
            />
            <ChartTooltip />
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--heading-color)"
              strokeWidth={2}
              fill="url(#userGrowthGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    </AnalyticsCard>
  );
}

// Signup Hour Histogram Block - count of signups by hour of day (90d)
export function SignupHourHistogramBlock() {
  const { data: rawData, loading, error } = useUserCreationAnalyticsData();

  const { hourlyData, peakHour, totalUsers } = useMemo(() => {
    if (!rawData || rawData.length === 0) {
      return { hourlyData: [], peakHour: null, totalUsers: 0 };
    }

    const now = new Date();
    const rangeStart = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    // Filter data to 90 days
    const filteredData = rawData.filter((point) => {
      const date = new Date(point.createdAt);
      return date >= rangeStart && date <= now;
    });

    // Count signups per hour of day (0-23)
    const hourCounts = new Array(24).fill(0);

    filteredData.forEach((point) => {
      const date = new Date(point.createdAt);
      const hour = date.getHours();
      hourCounts[hour]++;
    });

    // Convert to chart data with AM/PM labels and percentages
    const formatHour = (h: number) => {
      if (h === 0) return "12 AM";
      if (h === 12) return "12 PM";
      return h < 12 ? `${h} AM` : `${h - 12} PM`;
    };

    const total = filteredData.length;
    const hourlyData = hourCounts.map((count, hour) => ({
      hour: `${hour}`,
      hourLabel: `${formatHour(hour)} - ${formatHour((hour + 1) % 24)}`,
      value: total > 0 ? (count / total) * 100 : 0,
      count,
    }));

    // Find peak hour
    let maxCount = 0;
    let peakHour = 0;
    hourCounts.forEach((count, hour) => {
      if (count > maxCount) {
        maxCount = count;
        peakHour = hour;
      }
    });

    const peakPercent = total > 0 ? (maxCount / total) * 100 : 0;

    return {
      hourlyData,
      peakHour: {
        hour: peakHour,
        count: maxCount,
        label: formatHour(peakHour),
        percent: peakPercent,
      },
      totalUsers: total,
    };
  }, [rawData]);

  const chartConfig = createChartConfig(["value"], {
    labels: { value: "Signups" },
    colors: { value: "var(--heading-color)" },
  });

  if (loading) {
    return (
      <AnalyticsCard
        title="Signup Time Distribution"
        description="When users create accounts (hour of day)"
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
        title="Signup Time Distribution"
        description="When users create accounts (hour of day)"
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

  return (
    <AnalyticsCard
      title="Signup Time Distribution"
      description="When users create accounts (90d)"
      currentValueLabel={`${peakHour?.label ?? "12 AM"} peak`}
      subtitle={`${peakHour?.percent?.toFixed(1) ?? 0}% of signups`}
    >
      <ChartContainer config={chartConfig} style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={hourlyData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border-color)"
              vertical={false}
            />
            <XAxis
              dataKey="hour"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--label-color)", fontSize: 9 }}
              interval={0}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--label-color)", fontSize: 12 }}
              width={30}
            />
            <ChartTooltip
              tooltipConfig={{
                labelFormatter: (_, payload) =>
                  payload?.[0]?.payload?.hourLabel || "",
                valueFormatter: (value: number) => `${value.toFixed(2)}%`,
              }}
            />
            <Bar
              dataKey="value"
              fill="var(--heading-color)"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </AnalyticsCard>
  );
}

// Daily Signups Block - signups per calendar day
export function SignupDayHistogramBlock() {
  const { data: rawData, loading, error } = useUserCreationAnalyticsData();
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");

  const { dailyData, totalInWindow, avgPerDay } = useMemo(() => {
    if (!rawData || rawData.length === 0) {
      return {
        dailyData: [] as DailyDataPoint[],
        totalInWindow: 0,
        avgPerDay: 0,
      };
    }

    const days = getTimeRangeDays(timeRange);
    const now = new Date();
    const rangeStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    // Initialize daily buckets
    const dateMap = new Map<string, number>();
    for (let d = new Date(rangeStart); d <= now; d.setDate(d.getDate() + 1)) {
      const dateKey = getGranularityKey(d, "day");
      dateMap.set(dateKey, 0);
    }

    // Count signups per day
    rawData.forEach((point) => {
      const date = new Date(point.createdAt);
      if (date >= rangeStart && date <= now) {
        const dateKey = getGranularityKey(date, "day");
        dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + 1);
      }
    });

    // Sort by date and convert to chart data
    const sortedDates = Array.from(dateMap.keys()).sort();
    const dailyData: DailyDataPoint[] = sortedDates.map((dateKey) => ({
      date: formatDisplayDate(dateKey, "day"),
      dateKey,
      value: dateMap.get(dateKey) || 0,
    }));

    // Calculate total signups in window and average
    const totalInWindow = dailyData.reduce((sum, d) => sum + d.value, 0);
    const avgPerDay =
      dailyData.length > 0 ? totalInWindow / dailyData.length : 0;

    return {
      dailyData,
      totalInWindow,
      avgPerDay,
    };
  }, [rawData, timeRange]);

  const chartConfig = createChartConfig(["value"], {
    labels: { value: "Signups" },
    colors: { value: "var(--heading-color)" },
  });

  if (loading) {
    return (
      <AnalyticsCard
        title="Daily Signups"
        description="Number of signups per day"
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
        title="Daily Signups"
        description="Number of signups per day"
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

  return (
    <AnalyticsCard
      title="Daily Signups"
      description={`Number of signups per day (${timeRange})`}
      currentValue={totalInWindow}
      currentValueLabel="signups"
      subtitle={`${avgPerDay.toFixed(1)} avg/day`}
      showTimeRangeSelector
      timeRange={timeRange}
      onTimeRangeChange={setTimeRange}
    >
      <ChartContainer config={chartConfig} style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dailyData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border-color)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--label-color)", fontSize: 9 }}
              interval="preserveStartEnd"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--label-color)", fontSize: 12 }}
              width={30}
              domain={[0, "auto"]}
            />
            <ChartTooltip />
            <Bar
              dataKey="value"
              fill="var(--heading-color)"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </AnalyticsCard>
  );
}
