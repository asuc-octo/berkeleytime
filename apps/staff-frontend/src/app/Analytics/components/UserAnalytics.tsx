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

import { Select } from "@repo/theme";

import {
  ChartContainer,
  ChartTooltip,
  createChartConfig,
} from "@/components/Chart";
import {
  useUserActivityAnalyticsData,
  useUserCreationAnalyticsData,
} from "@/hooks/api";

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
      isCumulative
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
      subtitle={`avg. ${avgPerDay.toFixed(1)}/day`}
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

type ActiveWindow = "DAU" | "WAU" | "MAU";

// Helper to check if a user was active in a given window
function isActiveInWindow(
  lastSeenDate: Date,
  referenceDate: Date,
  windowDays: number
): boolean {
  const windowStart = new Date(referenceDate);
  windowStart.setDate(windowStart.getDate() - windowDays);
  return lastSeenDate >= windowStart && lastSeenDate <= referenceDate;
}

// Get window days based on active window type
function getWindowDays(activeWindow: ActiveWindow): number {
  if (activeWindow === "DAU") return 1;
  if (activeWindow === "WAU") return 7;
  return 30;
}

// Active Users Over Time Block - shows DAU/WAU/MAU trend
export function ActiveUsersBlock() {
  const { data: rawData, loading, error } = useUserActivityAnalyticsData();
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [granularity, setGranularity] = useState<Granularity>("day");
  const [activeWindow, setActiveWindow] = useState<ActiveWindow>("DAU");

  const { chartData, currentActiveUsers, percentChange } = useMemo(() => {
    if (!rawData || rawData.length === 0) {
      return {
        chartData: [] as DailyDataPoint[],
        currentActiveUsers: 0,
        percentChange: 0,
      };
    }

      const days = getTimeRangeDays(timeRange);
      const windowDays = getWindowDays(activeWindow);
      const now = new Date();
      const rangeStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

      // Parse user data, filtering out legacy users (lastSeenAt = Unix epoch 1970)
      const users = rawData
        .map((u) => ({
          lastSeenAt: new Date(u.lastSeenAt),
          createdAt: new Date(u.createdAt),
        }))
        .filter((u) => u.lastSeenAt.getFullYear() > 1970);

      // Initialize buckets based on granularity
      const bucketKeys: string[] = [];
      for (let d = new Date(rangeStart); d <= now; ) {
        const key = getGranularityKey(d, granularity);
        bucketKeys.push(key);
        if (granularity === "hour") {
          d.setHours(d.getHours() + 1);
        } else {
          d.setDate(d.getDate() + 1);
        }
      }

      // For each bucket, count users active within the window ending at that point
      const chartData: DailyDataPoint[] = bucketKeys.map((key) => {
        // Parse the bucket date
        const parts = key.split("-");
        const bucketDate = new Date(
          parseInt(parts[0]),
          parseInt(parts[1]) - 1,
          parseInt(parts[2]),
          granularity === "hour" ? parseInt(parts[3]) : 23,
          granularity === "hour" ? 59 : 59
        );

        // Count active users in this window
        const activeCount = users.filter((u) =>
          isActiveInWindow(u.lastSeenAt, bucketDate, windowDays)
        ).length;

        return {
          date: formatDisplayDate(key, granularity),
          dateKey: key,
          value: activeCount,
        };
      });

      // Current and previous period comparison
      const currentActiveUsers =
        chartData.length > 0 ? chartData[chartData.length - 1].value : 0;

      // Get the value from the start of the range for comparison
      const previousActiveUsers = chartData.length > 0 ? chartData[0].value : 0;

      const percentChange =
        previousActiveUsers > 0
          ? ((currentActiveUsers - previousActiveUsers) / previousActiveUsers) *
            100
          : 0;

      return {
        chartData,
        currentActiveUsers,
        percentChange,
      };
    }, [rawData, timeRange, granularity, activeWindow]);

  const chartConfig = createChartConfig(["value"], {
    labels: { value: `${activeWindow}` },
    colors: { value: "var(--heading-color)" },
  });

  const activeWindowControl = (
    <>
      <span
        style={{ marginLeft: 8, fontSize: 12, color: "var(--label-color)" }}
      >
        Window
      </span>
      <Select
        value={activeWindow}
        onChange={(val) => setActiveWindow(val as ActiveWindow)}
        options={[
          { value: "DAU", label: "Daily" },
          { value: "WAU", label: "Weekly" },
          { value: "MAU", label: "Monthly" },
        ]}
        style={{
          width: "fit-content",
          minHeight: 24,
          height: 24,
          padding: "0 8px",
          fontSize: 12,
        }}
      />
    </>
  );

  if (loading) {
    return (
      <AnalyticsCard
        title="Active Users"
        description="Users who logged in recently"
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
        title="Active Users"
        description="Users who logged in recently"
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
      title="Active Users"
      description={`Users who logged in within the last ${activeWindow === "DAU" ? "day" : activeWindow === "WAU" ? "week" : "month"}`}
      currentValue={currentActiveUsers}
      currentValueLabel={`${activeWindow}`}
      percentChange={percentChange}
      changeTimescale={timeRange}
      showTimeRangeSelector
      timeRange={timeRange}
      onTimeRangeChange={(val) => {
        setTimeRange(val);
        setGranularity(val === "7d" ? "hour" : "day");
      }}
      granularity={granularity}
      onGranularityChange={setGranularity}
      customControls={activeWindowControl}
    >
      <ChartContainer config={chartConfig} style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient
                id="activeUsersGradient"
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
              domain={[0, "auto"]}
            />
            <ChartTooltip />
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--heading-color)"
              strokeWidth={2}
              fill="url(#activeUsersGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    </AnalyticsCard>
  );
}

interface RecencyBucket {
  label: string;
  count: number;
  percent: number;
}

// User Activity Recency Distribution Block - shows how recently users were active
export function UserActivityRecencyBlock() {
  const { data: rawData, loading, error } = useUserActivityAnalyticsData();

  const { buckets, activeIn30dPercent, totalUsers } = useMemo(() => {
    if (!rawData || rawData.length === 0) {
      return {
        buckets: [] as RecencyBucket[],
        activeIn30dPercent: 0,
        totalUsers: 0,
      };
    }

    const now = new Date();
    const totalUsers = rawData.length;

    // Define bucket boundaries (in days)
    const bucketDefs = [
      { label: "Today", maxDays: 1 },
      { label: "1-7 days", maxDays: 7 },
      { label: "8-30 days", maxDays: 30 },
      { label: "31-90 days", maxDays: 90 },
      { label: "90+ days", maxDays: Infinity },
      { label: "Never", maxDays: -1 }, // Special: lastSeenAt = Unix epoch
    ];

    // Count users in each bucket
    const bucketCounts = new Map<string, number>();
    bucketDefs.forEach((b) => bucketCounts.set(b.label, 0));

    rawData.forEach((user) => {
      const lastSeen = new Date(user.lastSeenAt);
      const daysSinceLastSeen = Math.floor(
        (now.getTime() - lastSeen.getTime()) / (24 * 60 * 60 * 1000)
      );

      // Check for legacy users (lastSeenAt = Unix epoch 1970)
      if (lastSeen.getFullYear() <= 1970) {
        bucketCounts.set("Never", (bucketCounts.get("Never") || 0) + 1);
        return;
      }

      // Find the appropriate bucket
      let assigned = false;
      for (const bucket of bucketDefs) {
        if (bucket.maxDays === -1) continue; // Skip "Never" bucket
        if (daysSinceLastSeen < bucket.maxDays) {
          bucketCounts.set(
            bucket.label,
            (bucketCounts.get(bucket.label) || 0) + 1
          );
          assigned = true;
          break;
        }
      }

      if (!assigned) {
        bucketCounts.set("90+ days", (bucketCounts.get("90+ days") || 0) + 1);
      }
    });

    // Convert to array with percentages
    const buckets: RecencyBucket[] = bucketDefs.map((b) => {
      const count = bucketCounts.get(b.label) || 0;
      return {
        label: b.label,
        count,
        percent: totalUsers > 0 ? (count / totalUsers) * 100 : 0,
      };
    });

    // Calculate active in 30 days (Today + 1-7 days + 8-30 days)
    const activeIn30d =
      (bucketCounts.get("Today") || 0) +
      (bucketCounts.get("1-7 days") || 0) +
      (bucketCounts.get("8-30 days") || 0);
    const activeIn30dPercent =
      totalUsers > 0 ? (activeIn30d / totalUsers) * 100 : 0;

    return { buckets, activeIn30dPercent, totalUsers };
  }, [rawData]);

  const chartConfig = createChartConfig(["percent"], {
    labels: { percent: "Users" },
    colors: { percent: "var(--heading-color)" },
  });

  if (loading) {
    return (
      <AnalyticsCard
        title="User Activity Recency"
        description="Distribution of user login recency"
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
        title="User Activity Recency"
        description="Distribution of user login recency"
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
      title="User Activity Recency"
      description="When users last logged in"
      currentValue={totalUsers}
      currentValueLabel="total users"
      subtitle={`${activeIn30dPercent.toFixed(1)}% active in 30d`}
    >
      <ChartContainer config={chartConfig} style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={buckets} layout="vertical">
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border-color)"
              horizontal={false}
            />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--label-color)", fontSize: 10 }}
              tickFormatter={(v) => `${v.toFixed(0)}%`}
              domain={[0, "auto"]}
            />
            <YAxis
              type="category"
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--label-color)", fontSize: 11 }}
              width={70}
            />
            <ChartTooltip
              tooltipConfig={{
                labelFormatter: (_, payload) =>
                  payload?.[0]?.payload?.label || "",
                valueFormatter: (value: number, _name, item) => {
                  const count = item?.payload?.count || 0;
                  return `${value.toFixed(1)}% (${count.toLocaleString()} users)`;
                },
              }}
            />
            <Bar
              dataKey="percent"
              fill="var(--heading-color)"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </AnalyticsCard>
  );
}
