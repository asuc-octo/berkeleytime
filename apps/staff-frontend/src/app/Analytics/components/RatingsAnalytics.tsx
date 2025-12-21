import { useMemo, useState } from "react";

import { Filter, FilterSolid } from "iconoir-react";
import { Popover } from "radix-ui";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  Treemap,
  XAxis,
  YAxis,
} from "recharts";

import { IconButton, Input, LoadingIndicator, Select } from "@repo/theme";

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

// Filter popover for "At least N ratings" filter
function MinRatingsFilterPopover({
  value,
  onChange,
  hasOtherActiveFilters,
  children,
}: {
  value: number;
  onChange: (val: number) => void;
  hasOtherActiveFilters?: boolean;
  children?: React.ReactNode;
}) {
  const hasActiveFilter = value > 0 || hasOtherActiveFilters;

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <IconButton
          size="small"
          style={{ width: 24, height: 24, marginLeft: "auto" }}
        >
          {hasActiveFilter ? (
            <FilterSolid width={14} height={14} color="var(--blue-500)" />
          ) : (
            <Filter width={14} height={14} />
          )}
        </IconButton>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="end"
          sideOffset={4}
          style={{
            background: "var(--foreground-color)",
            border: "1px solid var(--border-color)",
            borderRadius: 8,
            padding: "12px 14px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {children}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: "var(--label-color)" }}>
              At least
            </span>
            <Input
              value={value === 0 ? "" : String(value)}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                onChange(val === "" ? 0 : parseInt(val) || 0);
              }}
              style={{
                width: 50,
                minHeight: 24,
                height: 24,
                padding: "0 8px",
                fontSize: 12,
                textAlign: "center",
              }}
            />
            <span style={{ fontSize: 12, color: "var(--label-color)" }}>
              ratings
            </span>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

// Unique Users Growth Block
export function UniqueUsersGrowthBlock() {
  const { data: rawData, loading, error } = useRatingAnalyticsData();
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [granularity, setGranularity] = useState<Granularity>("day");
  const [minRatings, setMinRatings] = useState(0);

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

    // Count ratings per user (up to current point in time)
    const userRatingCounts = new Map<string, number>();
    sortedData.forEach((point) => {
      userRatingCounts.set(
        point.userEmail,
        (userRatingCounts.get(point.userEmail) || 0) + 1
      );
    });

    // Filter users who have at least minRatings
    const qualifiedUsers = new Set(
      [...userRatingCounts.entries()]
        .filter(([, count]) => count >= minRatings)
        .map(([userId]) => userId)
    );

    // Baseline users before the window (only qualified ones)
    const baselineUsers = new Set<string>();
    sortedData.forEach((point) => {
      if (
        new Date(point.createdAt) < rangeStart &&
        qualifiedUsers.has(point.userEmail)
      ) {
        baselineUsers.add(point.userEmail);
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

    // Fill buckets (only qualified users)
    sortedData.forEach((point) => {
      const date = new Date(point.createdAt);
      if (
        date >= rangeStart &&
        date <= now &&
        qualifiedUsers.has(point.userEmail)
      ) {
        const key = getGranularityKey(date, granularity);
        bucketMap.get(key)?.add(point.userEmail);
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
  }, [rawData, timeRange, granularity, minRatings]);

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
      isCumulative
      showTimeRangeSelector
      timeRange={timeRange}
      onTimeRangeChange={(val) => {
        setTimeRange(val);
        setGranularity(val === "7d" ? "hour" : "day");
      }}
      granularity={granularity}
      onGranularityChange={setGranularity}
      customControls={
        <MinRatingsFilterPopover value={minRatings} onChange={setMinRatings} />
      }
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
  const [minRatings, setMinRatings] = useState(0);

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

    // Count ratings per course
    const courseRatingCounts = new Map<string, number>();
    sortedData.forEach((point) => {
      courseRatingCounts.set(
        point.courseKey,
        (courseRatingCounts.get(point.courseKey) || 0) + 1
      );
    });

    // Filter courses that have at least minRatings
    const qualifiedCourses = new Set(
      [...courseRatingCounts.entries()]
        .filter(([, count]) => count >= minRatings)
        .map(([courseKey]) => courseKey)
    );

    // Baseline courses before the window (only qualified ones)
    const baselineCourses = new Set<string>();
    sortedData.forEach((point) => {
      if (
        new Date(point.createdAt) < rangeStart &&
        qualifiedCourses.has(point.courseKey)
      ) {
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

    // Fill buckets (only qualified courses)
    sortedData.forEach((point) => {
      const date = new Date(point.createdAt);
      if (
        date >= rangeStart &&
        date <= now &&
        qualifiedCourses.has(point.courseKey)
      ) {
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
  }, [rawData, timeRange, granularity, minRatings]);

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
      isCumulative
      showTimeRangeSelector
      timeRange={timeRange}
      onTimeRangeChange={(val) => {
        setTimeRange(val);
        setGranularity(val === "7d" ? "hour" : "day");
      }}
      granularity={granularity}
      onGranularityChange={setGranularity}
      customControls={
        <MinRatingsFilterPopover value={minRatings} onChange={setMinRatings} />
      }
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
interface TreemapPayloadItem {
  payload: {
    fullName?: string;
    name: string;
    value: number;
    metrics?: { Usefulness?: number; Difficulty?: number; Workload?: number };
  };
}

const TreemapTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TreemapPayloadItem[];
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
interface TreemapContentProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  name?: string;
  value?: number;
  root?: { color?: string };
}

const TreemapContent = (props: TreemapContentProps) => {
  const {
    x = 0,
    y = 0,
    width = 0,
    height = 0,
    name = "",
    value = 0,
    root,
  } = props;

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
  const [minRatings, setMinRatings] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [treemapTimeRange, setTreemapTimeRange] = useState<
    "all" | "week" | "month"
  >("all");

  // Filter data by time range
  const filteredData = useMemo(() => {
    if (!rawData || rawData.length === 0) return [];
    if (treemapTimeRange === "all") return rawData;

    const now = new Date();
    const cutoff = new Date();
    if (treemapTimeRange === "week") {
      cutoff.setDate(now.getDate() - 7);
    } else {
      cutoff.setMonth(now.getMonth() - 1);
    }

    return rawData.filter((point) => new Date(point.createdAt) >= cutoff);
  }, [rawData, treemapTimeRange]);

  // Extract all unique subjects with course counts for the dropdown
  const subjectOptions = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];

    const subjectCourseCounts = new Map<string, Map<string, number>>();
    filteredData.forEach((point) => {
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
  }, [filteredData, minRatings]);

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

  const { treemapData, totalCourses, avgPerClass } = useMemo(() => {
    if (!filteredData || filteredData.length === 0) {
      return {
        treemapData: [],
        totalSubjects: 0,
        totalCourses: 0,
        avgPerClass: 0,
      };
    }

    // Count ratings per course and group by subject
    const subjectData = new Map<string, Map<string, number>>();

    filteredData.forEach((point) => {
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
  }, [filteredData, minRatings, selectedSubject, courseMetrics]);

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
      subtitle={`avg. ${avgPerClass.toFixed(1)} ratings/class`}
      customControls={
        <>
          <span style={{ fontSize: 12, color: "var(--label-color)" }}>
            Time created
          </span>
          <Select
            value={treemapTimeRange}
            onChange={(val) =>
              setTreemapTimeRange(val as "all" | "week" | "month")
            }
            options={[
              { value: "all", label: "All time" },
              { value: "week", label: "This week" },
              { value: "month", label: "This month" },
            ]}
            style={{
              width: 110,
              minHeight: 24,
              height: 24,
              padding: "0 8px",
              fontSize: 12,
            }}
          />
          <MinRatingsFilterPopover
            value={minRatings}
            onChange={setMinRatings}
            hasOtherActiveFilters={selectedSubject !== null}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
            </div>
          </MinRatingsFilterPopover>
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
      subtitle={`avg. ${avgPerDay.toFixed(1)}/day`}
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

// Score distribution colors (1-5) - gradient from red to green
const SCORE_COLORS: Record<number, string> = {
  1: "#e15759", // red (low)
  2: "#f28e2c", // orange
  3: "#edc949", // yellow
  4: "#76b7b2", // teal
  5: "#59a14f", // green (high)
};

// Score Distribution Block - 100% stacked bar showing 1-5 distribution per metric
export function ScoreDistributionBlock() {
  const { data: rawData, loading, error } = useRatingMetricsAnalyticsData();

  const { chartData } = useMemo(() => {
    if (!rawData || rawData.length === 0) {
      return { chartData: [] };
    }

    const metrics = ["Usefulness", "Difficulty", "Workload"];
    const scoreCounts: Record<string, Record<number, number>> = {};

    metrics.forEach((m) => {
      scoreCounts[m] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    });

    rawData.forEach((point) => {
      if (metrics.includes(point.metricName)) {
        const score = Math.round(point.value);
        if (score >= 1 && score <= 5) {
          scoreCounts[point.metricName][score]++;
        }
      }
    });

    const chartData = metrics.map((metric) => {
      const counts = scoreCounts[metric];
      const total = Object.values(counts).reduce((a, b) => a + b, 0);

      return {
        metric,
        score1: total > 0 ? (counts[1] / total) * 100 : 0,
        score2: total > 0 ? (counts[2] / total) * 100 : 0,
        score3: total > 0 ? (counts[3] / total) * 100 : 0,
        score4: total > 0 ? (counts[4] / total) * 100 : 0,
        score5: total > 0 ? (counts[5] / total) * 100 : 0,
        counts,
        total,
      };
    });

    return { chartData };
  }, [rawData]);

  const chartConfig = createChartConfig(
    ["score1", "score2", "score3", "score4", "score5"],
    {
      labels: {
        score1: "1",
        score2: "2",
        score3: "3",
        score4: "4",
        score5: "5",
      },
      colors: {
        score1: SCORE_COLORS[1],
        score2: SCORE_COLORS[2],
        score3: SCORE_COLORS[3],
        score4: SCORE_COLORS[4],
        score5: SCORE_COLORS[5],
      },
    }
  );

  if (loading) {
    return (
      <AnalyticsCard
        title="Score Distribution"
        description="Distribution of 1-5 scores per metric"
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
        title="Score Distribution"
        description="Distribution of 1-5 scores per metric"
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
      title="Score Distribution"
      description="Distribution of 1-5 scores per metric"
    >
      <ChartContainer config={chartConfig} style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" stackOffset="expand">
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border-color)"
              horizontal={false}
            />
            <XAxis type="number" hide />
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ paddingTop: 8 }}
              formatter={(value: string) => {
                const scoreNum = value.replace("score", "");
                return (
                  <span style={{ color: "var(--label-color)", fontSize: 12 }}>
                    {scoreNum}
                  </span>
                );
              }}
            />
            <YAxis
              type="category"
              dataKey="metric"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--label-color)", fontSize: 11 }}
              width={75}
            />
            <ChartTooltip
              tooltipConfig={{
                sortBy: "name",
                sortOrder: "asc",
                valueFormatter: (value: number, _name, item) => {
                  const payload = item?.payload;
                  if (!payload) return `${value.toFixed(1)}%`;
                  const scoreKey = item?.dataKey as string;
                  const scoreNum = parseInt(
                    scoreKey?.replace("score", "") || "0"
                  );
                  const count = payload.counts?.[scoreNum] || 0;
                  return `${value.toFixed(1)}% (${count})`;
                },
              }}
            />
            <Bar dataKey="score1" stackId="a" fill={SCORE_COLORS[1]} />
            <Bar dataKey="score2" stackId="a" fill={SCORE_COLORS[2]} />
            <Bar dataKey="score3" stackId="a" fill={SCORE_COLORS[3]} />
            <Bar dataKey="score4" stackId="a" fill={SCORE_COLORS[4]} />
            <Bar dataKey="score5" stackId="a" fill={SCORE_COLORS[5]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </AnalyticsCard>
  );
}

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
