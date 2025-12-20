import { useMemo, useState } from "react";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  Treemap,
  XAxis,
  YAxis,
} from "recharts";

import { LoadingIndicator, Select } from "@repo/theme";

import {
  ChartContainer,
  ChartTooltip,
  createChartConfig,
} from "@/components/Chart";
import {
  useRatingAnalyticsData,
  useRatingMetricsAnalyticsData,
} from "@/hooks/api";

import { AnalyticsCard, Granularity, TimeRange } from "./AnalyticsCard";

// Helper functions for time range and granularity
function getTimeRangeDays(timeRange: TimeRange): number {
  if (timeRange === "7d") return 7;
  if (timeRange === "90d") return 90;
  return 30;
}

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

interface DailyDataPoint {
  date: string;
  dateKey: string;
  value: number;
}

interface MetricSummary {
  current: number;
  absoluteChange: number;
  percentChange: number;
}

/**
 * Process raw rating data points into daily cumulative timeseries (last 30 days)
 */
function useProcessedAnalyticsData() {
  const { data: rawData, loading, error } = useRatingAnalyticsData();

  const processedData = useMemo(() => {
    if (!rawData || rawData.length === 0) {
      return {
        totalRatings: [] as DailyDataPoint[],
        uniqueUsers: [] as DailyDataPoint[],
        uniqueCourses: [] as DailyDataPoint[],
        summaries: {
          totalRatings: { current: 0, percentChange7d: 0 },
          uniqueUsers: { current: 0, percentChange7d: 0 },
          uniqueCourses: { current: 0, percentChange7d: 0 },
        },
      };
    }

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

    // Get date 30 days ago
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Sort by date first
    const sortedData = [...rawData].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // Count baseline values (before the 30-day window)
    let baselineRatings = 0;
    const baselineUsers = new Set<string>();
    const baselineCourses = new Set<string>();

    sortedData.forEach((point) => {
      const date = new Date(point.createdAt);
      if (date < thirtyDaysAgo) {
        baselineRatings++;
        baselineUsers.add(point.anonymousUserId);
        baselineCourses.add(point.courseKey);
      }
    });

    // Initialize all days in the last 30 days
    const dailyData = new Map<
      string,
      {
        count: number;
        users: Set<string>;
        courses: Set<string>;
      }
    >();

    for (
      let d = new Date(thirtyDaysAgo);
      d <= now;
      d.setDate(d.getDate() + 1)
    ) {
      const dayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      dailyData.set(dayKey, {
        count: 0,
        users: new Set(),
        courses: new Set(),
      });
    }

    // Fill in data for the last 30 days
    sortedData.forEach((point) => {
      const date = new Date(point.createdAt);
      if (date >= thirtyDaysAgo && date <= now) {
        const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

        const dayData = dailyData.get(dayKey);
        if (dayData) {
          dayData.count++;
          dayData.users.add(point.anonymousUserId);
          dayData.courses.add(point.courseKey);
        }
      }
    });

    // Convert to sorted array and compute cumulative values
    const sortedDays = Array.from(dailyData.keys()).sort();

    let cumulativeRatings = baselineRatings;
    const cumulativeUsers = new Set<string>(baselineUsers);
    const cumulativeCourses = new Set<string>(baselineCourses);

    const totalRatings: DailyDataPoint[] = [];
    const uniqueUsers: DailyDataPoint[] = [];
    const uniqueCourses: DailyDataPoint[] = [];

    sortedDays.forEach((dayKey) => {
      const data = dailyData.get(dayKey)!;

      // Format date for display (e.g., "Dec 19")
      const [, month, day] = dayKey.split("-");
      const displayDate = `${monthNames[parseInt(month) - 1]} ${parseInt(day)}`;

      // Cumulative ratings
      cumulativeRatings += data.count;
      totalRatings.push({
        date: displayDate,
        dateKey: dayKey,
        value: cumulativeRatings,
      });

      // Cumulative unique users
      data.users.forEach((u) => cumulativeUsers.add(u));
      uniqueUsers.push({
        date: displayDate,
        dateKey: dayKey,
        value: cumulativeUsers.size,
      });

      // Cumulative unique courses
      data.courses.forEach((c) => cumulativeCourses.add(c));
      uniqueCourses.push({
        date: displayDate,
        dateKey: dayKey,
        value: cumulativeCourses.size,
      });
    });

    // Calculate 30-day change (comparing first and last point in window)
    const calc30dChange = (data: DailyDataPoint[]): MetricSummary => {
      if (data.length === 0)
        return { current: 0, absoluteChange: 0, percentChange: 0 };

      const current = data[data.length - 1].value;
      const start = data[0].value;

      const absoluteChange = current - start;
      const percentChange =
        start > 0 ? ((current - start) / start) * 100 : current > 0 ? 100 : 0;

      return { current, absoluteChange, percentChange };
    };

    return {
      totalRatings,
      uniqueUsers,
      uniqueCourses,
      summaries: {
        totalRatings: calc30dChange(totalRatings),
        uniqueUsers: calc30dChange(uniqueUsers),
        uniqueCourses: calc30dChange(uniqueCourses),
      },
    };
  }, [rawData]);

  return { ...processedData, loading, error };
}

// Unique Users Growth Block
export function UniqueUsersGrowthBlock() {
  const { data: rawData, loading, error } = useRatingAnalyticsData();
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [granularity, setGranularity] = useState<Granularity>("day");

  const { chartData, current, absoluteChange, percentChange } = useMemo(() => {
    if (!rawData || rawData.length === 0) {
      return {
        chartData: [] as DailyDataPoint[],
        current: 0,
        absoluteChange: 0,
        percentChange: 0,
      };
    }

    const days = getTimeRangeDays(timeRange);
    const now = new Date();
    const rangeStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const sortedData = [...rawData].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // Baseline users before the window
    const baselineUsers = new Set<string>();
    sortedData.forEach((point) => {
      if (new Date(point.createdAt) < rangeStart) {
        baselineUsers.add(point.anonymousUserId);
      }
    });

    // Initialize buckets
    const bucketMap = new Map<string, Set<string>>();
    for (let d = new Date(rangeStart); d <= now; ) {
      const key = getGranularityKey(d, granularity);
      bucketMap.set(key, new Set());
      if (granularity === "hour") {
        d.setHours(d.getHours() + 1);
      } else {
        d.setDate(d.getDate() + 1);
      }
    }

    // Fill buckets
    sortedData.forEach((point) => {
      const date = new Date(point.createdAt);
      if (date >= rangeStart && date <= now) {
        const key = getGranularityKey(date, granularity);
        bucketMap.get(key)?.add(point.anonymousUserId);
      }
    });

    // Build cumulative data
    const sortedKeys = Array.from(bucketMap.keys()).sort();
    const cumulativeUsers = new Set<string>(baselineUsers);
    const chartData: DailyDataPoint[] = sortedKeys.map((key) => {
      bucketMap.get(key)?.forEach((u) => cumulativeUsers.add(u));
      return {
        date: formatDisplayDate(key, granularity),
        dateKey: key,
        value: cumulativeUsers.size,
      };
    });

    const current =
      chartData.length > 0 ? chartData[chartData.length - 1].value : 0;
    const start = chartData.length > 0 ? chartData[0].value : 0;
    const absoluteChange = current - start;
    const percentChange =
      start > 0 ? ((current - start) / start) * 100 : current > 0 ? 100 : 0;

    return { chartData, current, absoluteChange, percentChange };
  }, [rawData, timeRange, granularity]);

  const chartConfig = createChartConfig(["value"], {
    labels: { value: "Unique Users" },
    colors: { value: "var(--heading-color)" },
  });

  if (loading) {
    return (
      <AnalyticsCard
        title="Rating Users"
        description="Users who submitted ratings"
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
        title="Rating Users"
        description="Users who submitted ratings"
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
      title="Rating Users"
      description={`Users who submitted ratings (${timeRange})`}
      currentValue={current}
      currentValueLabel="users"
      absoluteChange={absoluteChange}
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
    >
      <ChartContainer config={chartConfig} style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient
                id="uniqueUsersGradient"
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
              fill="url(#uniqueUsersGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    </AnalyticsCard>
  );
}

// Ratings Count Block
export function RatingsCountBlock() {
  const { data: rawData, loading, error } = useRatingAnalyticsData();
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [granularity, setGranularity] = useState<Granularity>("day");

  const { chartData, current, absoluteChange, percentChange } = useMemo(() => {
    if (!rawData || rawData.length === 0) {
      return {
        chartData: [] as DailyDataPoint[],
        current: 0,
        absoluteChange: 0,
        percentChange: 0,
      };
    }

    const days = getTimeRangeDays(timeRange);
    const now = new Date();
    const rangeStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const sortedData = [...rawData].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // Baseline count before the window
    let baselineCount = 0;
    sortedData.forEach((point) => {
      if (new Date(point.createdAt) < rangeStart) {
        baselineCount++;
      }
    });

    // Initialize buckets
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

    // Fill buckets
    sortedData.forEach((point) => {
      const date = new Date(point.createdAt);
      if (date >= rangeStart && date <= now) {
        const key = getGranularityKey(date, granularity);
        bucketMap.set(key, (bucketMap.get(key) || 0) + 1);
      }
    });

    // Build cumulative data
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

    const current =
      chartData.length > 0 ? chartData[chartData.length - 1].value : 0;
    const start = chartData.length > 0 ? chartData[0].value : 0;
    const absoluteChange = current - start;
    const percentChange =
      start > 0 ? ((current - start) / start) * 100 : current > 0 ? 100 : 0;

    return { chartData, current, absoluteChange, percentChange };
  }, [rawData, timeRange, granularity]);

  const chartConfig = createChartConfig(["value"], {
    labels: { value: "Total Submissions" },
    colors: { value: "var(--heading-color)" },
  });

  if (loading) {
    return (
      <AnalyticsCard
        title="Total Ratings"
        description="Cumulative rating submissions"
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
        title="Total Ratings"
        description="Cumulative rating submissions"
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
      title="Total Ratings"
      description={`Cumulative rating submissions (${timeRange})`}
      currentValue={current}
      currentValueLabel="submissions"
      absoluteChange={absoluteChange}
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
    >
      <ChartContainer config={chartConfig} style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient
                id="ratingsCountGradient"
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
              fill="url(#ratingsCountGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    </AnalyticsCard>
  );
}

// Course Distribution Block
export function CourseDistributionBlock() {
  const { data: rawData, loading, error } = useRatingAnalyticsData();
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [granularity, setGranularity] = useState<Granularity>("day");

  const { chartData, current, absoluteChange, percentChange } = useMemo(() => {
    if (!rawData || rawData.length === 0) {
      return {
        chartData: [] as DailyDataPoint[],
        current: 0,
        absoluteChange: 0,
        percentChange: 0,
      };
    }

    const days = getTimeRangeDays(timeRange);
    const now = new Date();
    const rangeStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const sortedData = [...rawData].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // Baseline courses before the window
    const baselineCourses = new Set<string>();
    sortedData.forEach((point) => {
      if (new Date(point.createdAt) < rangeStart) {
        baselineCourses.add(point.courseKey);
      }
    });

    // Initialize buckets
    const bucketMap = new Map<string, Set<string>>();
    for (let d = new Date(rangeStart); d <= now; ) {
      const key = getGranularityKey(d, granularity);
      bucketMap.set(key, new Set());
      if (granularity === "hour") {
        d.setHours(d.getHours() + 1);
      } else {
        d.setDate(d.getDate() + 1);
      }
    }

    // Fill buckets
    sortedData.forEach((point) => {
      const date = new Date(point.createdAt);
      if (date >= rangeStart && date <= now) {
        const key = getGranularityKey(date, granularity);
        bucketMap.get(key)?.add(point.courseKey);
      }
    });

    // Build cumulative data
    const sortedKeys = Array.from(bucketMap.keys()).sort();
    const cumulativeCourses = new Set<string>(baselineCourses);
    const chartData: DailyDataPoint[] = sortedKeys.map((key) => {
      bucketMap.get(key)?.forEach((c) => cumulativeCourses.add(c));
      return {
        date: formatDisplayDate(key, granularity),
        dateKey: key,
        value: cumulativeCourses.size,
      };
    });

    const current =
      chartData.length > 0 ? chartData[chartData.length - 1].value : 0;
    const start = chartData.length > 0 ? chartData[0].value : 0;
    const absoluteChange = current - start;
    const percentChange =
      start > 0 ? ((current - start) / start) * 100 : current > 0 ? 100 : 0;

    return { chartData, current, absoluteChange, percentChange };
  }, [rawData, timeRange, granularity]);

  const chartConfig = createChartConfig(["value"], {
    labels: { value: "Courses with Ratings" },
    colors: { value: "var(--heading-color)" },
  });

  if (loading) {
    return (
      <AnalyticsCard title="Rated Courses" description="Courses with ratings">
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
      <AnalyticsCard title="Rated Courses" description="Courses with ratings">
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
      title="Rated Courses"
      description={`Courses with ratings (${timeRange})`}
      currentValue={current}
      currentValueLabel="courses"
      absoluteChange={absoluteChange}
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
    >
      <ChartContainer config={chartConfig} style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient
                id="courseRatingsGradient"
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
              fill="url(#courseRatingsGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    </AnalyticsCard>
  );
}

// Custom tooltip for treemap
const TreemapTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: any[];
}) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const displayName = data.fullName || data.name;
  const metrics = data.metrics as
    | { Usefulness?: number; Difficulty?: number; Workload?: number }
    | undefined;

  return (
    <div
      style={{
        background: "var(--foreground-color)",
        border: "1px solid var(--border-color)",
        borderRadius: 8,
        padding: "10px 14px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        minWidth: 160,
      }}
    >
      <div
        style={{ fontWeight: 600, color: "var(--heading-color)", fontSize: 14 }}
      >
        {displayName}
      </div>
      <div style={{ color: "var(--label-color)", fontSize: 12, marginTop: 2 }}>
        {data.value.toLocaleString()} ratings
      </div>
      {metrics && (
        <div
          style={{
            marginTop: 8,
            paddingTop: 8,
            borderTop: "1px solid var(--border-color)",
            fontSize: 12,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {metrics.Usefulness !== undefined && (
            <div style={{ color: "var(--paragraph-color)" }}>
              Usefulness: {metrics.Usefulness.toFixed(2)}
            </div>
          )}
          {metrics.Difficulty !== undefined && (
            <div style={{ color: "var(--paragraph-color)" }}>
              Difficulty: {metrics.Difficulty.toFixed(2)}
            </div>
          )}
          {metrics.Workload !== undefined && (
            <div style={{ color: "var(--paragraph-color)" }}>
              Workload: {metrics.Workload.toFixed(2)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Tableau 10 color palette - professional categorical colors
const SUBJECT_PALETTE = [
  "#4e79a7",
  "#f28e2c",
  "#e15759",
  "#76b7b2",
  "#59a14f",
  "#edc949",
  "#af7aa1",
  "#ff9da7",
  "#9c755f",
  "#bab0ab",
];

// Custom treemap cell content
const TreemapContent = (props: any) => {
  const { x, y, width, height, name, value, root } = props;

  const showName = width > 40 && height > 25;
  const showValue = width > 35 && height > 40;
  const color = root?.color || "var(--heading-color)";

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={color}
        stroke="var(--background-color)"
        strokeWidth={2}
      />
      {showName && (
        <text
          x={x + width / 2}
          y={y + height / 2 - (showValue ? 6 : 0)}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="var(--background-color)"
          fontSize={10}
          fontWeight={600}
        >
          {name}
        </text>
      )}
      {showValue && (
        <text
          x={x + width / 2}
          y={y + height / 2 + 10}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="var(--background-color)"
          fontSize={9}
          opacity={0.9}
        >
          {value}
        </text>
      )}
    </g>
  );
};

// Course Ratings Distribution Block (Treemap)
export function CourseRatingsDistributionBlock() {
  const { data: rawData, loading, error } = useRatingAnalyticsData();
  const { data: metricsData } = useRatingMetricsAnalyticsData();
  const [minRatings, setMinRatings] = useState(1);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  // Extract all unique subjects with course counts for the dropdown
  const subjectOptions = useMemo(() => {
    if (!rawData || rawData.length === 0) return [];

    const subjectCourseCounts = new Map<string, Map<string, number>>();
    rawData.forEach((point) => {
      const parts = point.courseKey.split(" ");
      const subject = parts[0];
      if (!subjectCourseCounts.has(subject)) {
        subjectCourseCounts.set(subject, new Map());
      }
      const courses = subjectCourseCounts.get(subject)!;
      courses.set(point.courseKey, (courses.get(point.courseKey) || 0) + 1);
    });

    return Array.from(subjectCourseCounts.entries())
      .map(([subject, courses]) => {
        const qualifyingCourses = Array.from(courses.values()).filter(
          (count) => count >= minRatings
        ).length;
        return { subject, count: qualifyingCourses };
      })
      .filter(({ count }) => count > 0)
      .sort((a, b) => a.subject.localeCompare(b.subject))
      .map(({ subject, count }) => ({
        value: subject,
        label: subject,
        meta: `${count}`,
      }));
  }, [rawData, minRatings]);

  // Calculate per-course metric averages for tooltip display
  const courseMetrics = useMemo(() => {
    if (!metricsData || metricsData.length === 0) return null;

    const metricNames = ["Usefulness", "Difficulty", "Workload"] as const;
    const courseMetricValues = new Map<string, Map<string, number[]>>();

    metricsData.forEach((point) => {
      if (!courseMetricValues.has(point.courseKey)) {
        courseMetricValues.set(point.courseKey, new Map());
      }
      const metricMap = courseMetricValues.get(point.courseKey)!;
      if (!metricMap.has(point.metricName)) {
        metricMap.set(point.metricName, []);
      }
      metricMap.get(point.metricName)!.push(point.value);
    });

    const result = new Map<
      string,
      { Usefulness?: number; Difficulty?: number; Workload?: number }
    >();
    courseMetricValues.forEach((metricMap, courseKey) => {
      const metrics: {
        Usefulness?: number;
        Difficulty?: number;
        Workload?: number;
      } = {};
      metricNames.forEach((metricName) => {
        const values = metricMap.get(metricName);
        if (values && values.length > 0) {
          metrics[metricName] =
            values.reduce((a, b) => a + b, 0) / values.length;
        }
      });
      if (Object.keys(metrics).length > 0) {
        result.set(courseKey, metrics);
      }
    });

    return result;
  }, [metricsData]);

  const { treemapData, totalSubjects, totalCourses, avgPerClass } =
    useMemo(() => {
      if (!rawData || rawData.length === 0) {
        return {
          treemapData: [],
          totalSubjects: 0,
          totalCourses: 0,
          avgPerClass: 0,
        };
      }

      // Count ratings per course and group by subject
      const subjectData = new Map<string, Map<string, number>>();

      rawData.forEach((point) => {
        const parts = point.courseKey.split(" ");
        const subject = parts[0];
        const courseNum = parts.slice(1).join(" ") || point.courseKey;

        if (selectedSubject && subject !== selectedSubject) return;

        if (!subjectData.has(subject)) {
          subjectData.set(subject, new Map());
        }
        const courses = subjectData.get(subject)!;
        courses.set(courseNum, (courses.get(courseNum) || 0) + 1);
      });

      // Create hierarchical treemap data grouped by subject
      const sortedSubjects = Array.from(subjectData.entries())
        .map(([subject, courses]) => {
          const children = Array.from(courses.entries())
            .filter(([, count]) => count >= minRatings)
            .map(([courseNum, count]) => {
              const courseKey = `${subject} ${courseNum}`;
              return {
                name: courseNum,
                fullName: courseKey,
                value: count,
                metrics: courseMetrics?.get(courseKey),
              };
            })
            .sort((a, b) => b.value - a.value);

          return {
            subject,
            children,
            totalValue: children.reduce((sum, c) => sum + c.value, 0),
          };
        })
        .filter(({ children }) => children.length > 0)
        .sort((a, b) => b.totalValue - a.totalValue);

      const treemapData = sortedSubjects.map(
        ({ subject, children, totalValue }, index) => ({
          name: subject,
          color: SUBJECT_PALETTE[index % SUBJECT_PALETTE.length],
          children,
          value: totalValue,
        })
      );

      const totalCourses = treemapData.reduce(
        (sum, s) => sum + s.children.length,
        0
      );
      const totalRatings = treemapData.reduce((sum, s) => sum + s.value, 0);
      const avgPerClass = totalCourses > 0 ? totalRatings / totalCourses : 0;

      return {
        treemapData,
        totalSubjects: treemapData.length,
        totalCourses,
        avgPerClass,
      };
    }, [rawData, minRatings, selectedSubject, courseMetrics]);

  const chartConfig = createChartConfig(["value"], {
    labels: { value: "Ratings" },
    colors: { value: "var(--heading-color)" },
  });

  if (loading) {
    return (
      <AnalyticsCard
        title="Course Ratings Treemap"
        description="Area = rating count, by subject"
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
        title="Course Ratings Treemap"
        description="Area = rating count, by subject"
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
      title="Course Ratings Treemap"
      description={`Area = rating count, by subject`}
      currentValue={totalCourses}
      currentValueLabel="courses"
      subtitle={`avg ${avgPerClass.toFixed(1)} ratings/class`}
      customControls={
        <>
          <span style={{ fontSize: 12, color: "var(--label-color)" }}>
            Subject
          </span>
          <Select
            searchable
            clearable
            value={selectedSubject}
            onChange={(val) => setSelectedSubject(val as string | null)}
            options={subjectOptions}
            placeholder="All"
            searchPlaceholder="Search"
            style={{
              width: 140,
              minHeight: 24,
              height: 24,
              padding: "0 8px",
              fontSize: 12,
            }}
          />
          <span style={{ fontSize: 12, color: "var(--label-color)" }}>
            At least
          </span>
          <Select
            value={String(minRatings)}
            onChange={(val) => setMinRatings(parseInt(val as string))}
            options={[
              { value: "1", label: "1" },
              { value: "2", label: "2" },
              { value: "3", label: "3" },
              { value: "5", label: "5" },
              { value: "10", label: "10" },
              { value: "20", label: "20" },
            ]}
            style={{
              width: "fit-content",
              minHeight: 24,
              height: 24,
              padding: "0 8px",
              fontSize: 12,
            }}
          />
          <span style={{ fontSize: 12, color: "var(--label-color)" }}>
            ratings
          </span>
        </>
      }
    >
      <ChartContainer config={chartConfig} style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={treemapData}
            dataKey="value"
            aspectRatio={4 / 3}
            stroke="var(--background-color)"
            content={<TreemapContent />}
            isAnimationActive={false}
          >
            <Tooltip content={<TreemapTooltip />} />
          </Treemap>
        </ResponsiveContainer>
      </ChartContainer>
    </AnalyticsCard>
  );
}

// Daily Ratings Block - ratings per day
export function RatingsDayHistogramBlock() {
  const { data: rawData, loading, error } = useRatingAnalyticsData();
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");

  const { chartData, totalInWindow, avgPerDay } = useMemo(() => {
    if (!rawData || rawData.length === 0) {
      return {
        chartData: [] as DailyDataPoint[],
        totalInWindow: 0,
        avgPerDay: 0,
      };
    }

    const days = getTimeRangeDays(timeRange);
    const now = new Date();
    const rangeStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    // Initialize daily buckets
    const bucketMap = new Map<string, number>();
    for (let d = new Date(rangeStart); d <= now; d.setDate(d.getDate() + 1)) {
      const key = getGranularityKey(d, "day");
      bucketMap.set(key, 0);
    }

    // Count ratings per day
    rawData.forEach((point) => {
      const date = new Date(point.createdAt);
      if (date >= rangeStart && date <= now) {
        const key = getGranularityKey(date, "day");
        bucketMap.set(key, (bucketMap.get(key) || 0) + 1);
      }
    });

    // Convert to chart data
    const sortedKeys = Array.from(bucketMap.keys()).sort();
    const chartData: DailyDataPoint[] = sortedKeys.map((key) => ({
      date: formatDisplayDate(key, "day"),
      dateKey: key,
      value: bucketMap.get(key) || 0,
    }));

    const totalInWindow = chartData.reduce((sum, d) => sum + d.value, 0);
    const avgPerDay =
      chartData.length > 0 ? totalInWindow / chartData.length : 0;

    return { chartData, totalInWindow, avgPerDay };
  }, [rawData, timeRange]);

  const chartConfig = createChartConfig(["value"], {
    labels: { value: "Ratings" },
    colors: { value: "var(--heading-color)" },
  });

  if (loading) {
    return (
      <AnalyticsCard
        title="Daily Ratings"
        description="Number of ratings submitted"
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
        title="Daily Ratings"
        description="Number of ratings submitted"
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
      title="Daily Ratings"
      description={`Number of ratings submitted (${timeRange})`}
      currentValue={totalInWindow}
      currentValueLabel="ratings"
      subtitle={`${avgPerDay.toFixed(1)} avg/day`}
      showTimeRangeSelector
      timeRange={timeRange}
      onTimeRangeChange={setTimeRange}
    >
      <ChartContainer config={chartConfig} style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
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

// Metric colors
const METRIC_COLORS: Record<string, string> = {
  Usefulness: "#4e79a7",
  Difficulty: "#e15759",
  Workload: "#f28e2c",
};

interface MetricDailyDataPoint {
  date: string;
  dateKey: string;
  Usefulness: number | null;
  Difficulty: number | null;
  Workload: number | null;
}

// Average Rating Scores Over Time Block (Cumulative)
export function AverageScoresOverTimeBlock() {
  const { data: rawData, loading, error } = useRatingMetricsAnalyticsData();

  const { dailyData, overallAverages } = useMemo(() => {
    if (!rawData || rawData.length === 0) {
      return {
        dailyData: [] as MetricDailyDataPoint[],
        overallAverages: { Usefulness: 0, Difficulty: 0, Workload: 0 },
      };
    }

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

    // Group by date and metric
    const dateMetricMap = new Map<string, Map<string, number[]>>();

    rawData.forEach((point) => {
      const date = new Date(point.createdAt);
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

      if (!dateMetricMap.has(dateKey)) {
        dateMetricMap.set(dateKey, new Map());
      }

      const metricsForDay = dateMetricMap.get(dateKey)!;
      if (!metricsForDay.has(point.metricName)) {
        metricsForDay.set(point.metricName, []);
      }
      metricsForDay.get(point.metricName)!.push(point.value);
    });

    // Sort dates and compute cumulative averages
    const sortedDates = Array.from(dateMetricMap.keys()).sort();

    // Track cumulative totals for each metric
    const cumulativeTotals: Record<string, { sum: number; count: number }> = {
      Usefulness: { sum: 0, count: 0 },
      Difficulty: { sum: 0, count: 0 },
      Workload: { sum: 0, count: 0 },
    };

    const dailyData: MetricDailyDataPoint[] = sortedDates.map((dateKey) => {
      const [, month, day] = dateKey.split("-");
      const displayDate = `${monthNames[parseInt(month) - 1]} ${parseInt(day)}`;

      const metricsForDay = dateMetricMap.get(dateKey)!;

      // Add today's values to cumulative totals
      ["Usefulness", "Difficulty", "Workload"].forEach((metricName) => {
        const values = metricsForDay.get(metricName);
        if (values) {
          cumulativeTotals[metricName].sum += values.reduce((a, b) => a + b, 0);
          cumulativeTotals[metricName].count += values.length;
        }
      });

      // Compute cumulative average up to this point
      const calcCumulativeAvg = (metricName: string): number | null => {
        const { sum, count } = cumulativeTotals[metricName];
        if (count === 0) return null;
        return sum / count;
      };

      return {
        date: displayDate,
        dateKey,
        Usefulness: calcCumulativeAvg("Usefulness"),
        Difficulty: calcCumulativeAvg("Difficulty"),
        Workload: calcCumulativeAvg("Workload"),
      };
    });

    // Final cumulative totals are the overall averages
    const overallAverages = {
      Usefulness:
        cumulativeTotals.Usefulness.count > 0
          ? cumulativeTotals.Usefulness.sum / cumulativeTotals.Usefulness.count
          : 0,
      Difficulty:
        cumulativeTotals.Difficulty.count > 0
          ? cumulativeTotals.Difficulty.sum / cumulativeTotals.Difficulty.count
          : 0,
      Workload:
        cumulativeTotals.Workload.count > 0
          ? cumulativeTotals.Workload.sum / cumulativeTotals.Workload.count
          : 0,
    };

    return { dailyData, overallAverages };
  }, [rawData]);

  const chartConfig = createChartConfig(
    ["Usefulness", "Difficulty", "Workload"],
    {
      labels: {
        Usefulness: "Usefulness",
        Difficulty: "Difficulty",
        Workload: "Workload",
      },
      colors: METRIC_COLORS,
    }
  );

  if (loading) {
    return (
      <AnalyticsCard
        title="Average Scores"
        description="Running average of all ratings up to each day"
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
        title="Average Scores"
        description="Running average of all ratings up to each day"
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
      title="Average Scores"
      description="Running average of all ratings up to each day"
      subtitle={`Use: ${overallAverages.Usefulness.toFixed(2)} | Diff: ${overallAverages.Difficulty.toFixed(2)} | Work: ${overallAverages.Workload.toFixed(2)}`}
    >
      <ChartContainer config={chartConfig} style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dailyData}>
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
              width={35}
              domain={["auto", "auto"]}
              tickFormatter={(value) => value.toFixed(1)}
            />
            <ChartTooltip
              tooltipConfig={{
                valueFormatter: (value: number) =>
                  value ? `${value.toFixed(2)}/5` : "-",
              }}
            />
            <Line
              type="monotone"
              dataKey="Usefulness"
              stroke={METRIC_COLORS.Usefulness}
              strokeWidth={2}
              dot={false}
              connectNulls
              activeDot={{ r: 4, fill: METRIC_COLORS.Usefulness }}
            />
            <Line
              type="monotone"
              dataKey="Difficulty"
              stroke={METRIC_COLORS.Difficulty}
              strokeWidth={2}
              dot={false}
              connectNulls
              activeDot={{ r: 4, fill: METRIC_COLORS.Difficulty }}
            />
            <Line
              type="monotone"
              dataKey="Workload"
              stroke={METRIC_COLORS.Workload}
              strokeWidth={2}
              dot={false}
              connectNulls
              activeDot={{ r: 4, fill: METRIC_COLORS.Workload }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </AnalyticsCard>
  );
}
