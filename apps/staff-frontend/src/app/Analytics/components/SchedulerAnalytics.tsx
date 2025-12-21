import { useMemo, useState } from "react";

import { Filter, FilterSolid } from "iconoir-react";
import { Popover } from "radix-ui";
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

import { IconButton, Input, LoadingIndicator, Select } from "@repo/theme";

import {
  ChartContainer,
  ChartTooltip,
  createChartConfig,
} from "@/components/Chart";
import { useSchedulerAnalyticsData } from "@/hooks/api";

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

type SchedulerTimeRange = "all" | "week" | "month";

// Filter popover for Scheduler filters
function SchedulerFilterPopover({
  minClasses,
  onMinClassesChange,
  selectedSemester,
  onSemesterChange,
  semesterOptions,
  children,
}: {
  minClasses: number;
  onMinClassesChange: (val: number) => void;
  selectedSemester: string | null;
  onSemesterChange: (val: string | null) => void;
  semesterOptions: { value: string; label: string }[];
  children?: React.ReactNode;
}) {
  const hasActiveFilter = minClasses > 0 || selectedSemester !== null;

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
              value={minClasses === 0 ? "" : String(minClasses)}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                onMinClassesChange(val === "" ? 0 : parseInt(val) || 0);
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
              classes
            </span>
          </div>
          {semesterOptions.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: "var(--label-color)" }}>
                Semester
              </span>
              <Select
                searchable
                clearable
                value={selectedSemester}
                onChange={(val) => onSemesterChange(val as string | null)}
                options={semesterOptions}
                placeholder="All"
                searchPlaceholder="Search"
                style={{
                  width: 120,
                  minHeight: 24,
                  height: 24,
                  padding: "0 8px",
                  fontSize: 12,
                }}
              />
            </div>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

// Total Schedules Block
export function TotalSchedulesBlock() {
  const { data, loading, error } = useSchedulerAnalyticsData();
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [granularity, setGranularity] = useState<Granularity>("day");
  const [minClasses, setMinClasses] = useState(0);
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);

  // Get unique semesters for filter dropdown
  const semesterOptions = useMemo(() => {
    if (!data || data.length === 0) return [];
    const semesters = new Set<string>();
    data.forEach((schedule) => {
      semesters.add(`${schedule.semester} ${schedule.year}`);
    });
    return Array.from(semesters)
      .sort((a, b) => {
        const [aSem, aYear] = a.split(" ");
        const [bSem, bYear] = b.split(" ");
        if (aYear !== bYear) return parseInt(bYear) - parseInt(aYear);
        const semOrder = { Spring: 0, Summer: 1, Fall: 2, Winter: 3 };
        return (
          (semOrder[bSem as keyof typeof semOrder] || 0) -
          (semOrder[aSem as keyof typeof semOrder] || 0)
        );
      })
      .map((sem) => ({ value: sem, label: sem }));
  }, [data]);

  // Filter by min classes and semester
  const filteredData = useMemo(() => {
    let filtered = [...data];
    if (minClasses > 0) {
      filtered = filtered.filter(
        (schedule) => schedule.totalClasses >= minClasses
      );
    }
    if (selectedSemester) {
      filtered = filtered.filter(
        (schedule) =>
          `${schedule.semester} ${schedule.year}` === selectedSemester
      );
    }
    return filtered;
  }, [data, minClasses, selectedSemester]);

  const { chartData, current, absoluteChange, percentChange } = useMemo(() => {
    if (!filteredData || filteredData.length === 0) {
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

    const sortedData = [...filteredData].sort(
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
  }, [filteredData, timeRange, granularity]);

  const chartConfig = createChartConfig(["value"], {
    labels: { value: "Schedules" },
    colors: { value: "var(--heading-color)" },
  });

  if (loading) {
    return (
      <AnalyticsCard
        title="Total Schedules"
        description="Users with a schedule"
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
        title="Total Schedules"
        description="Users with a schedule"
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
      title="Total Schedules"
      description={`Cumulative schedules created (${timeRange})`}
      currentValue={current}
      currentValueLabel="schedules"
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
        <SchedulerFilterPopover
          minClasses={minClasses}
          onMinClassesChange={setMinClasses}
          selectedSemester={selectedSemester}
          onSemesterChange={setSelectedSemester}
          semesterOptions={semesterOptions}
        />
      }
    >
      <ChartContainer config={chartConfig} style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient
                id="schedulerGrowthGradient"
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
              fill="url(#schedulerGrowthGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    </AnalyticsCard>
  );
}

// Daily Schedules Block - schedules created per day
export function DailySchedulesBlock() {
  const { data, loading, error } = useSchedulerAnalyticsData();
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");

  const { chartData, totalInWindow, avgPerDay } = useMemo(() => {
    if (!data || data.length === 0) {
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

    // Count schedules per day
    data.forEach((schedule) => {
      const date = new Date(schedule.createdAt);
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
  }, [data, timeRange]);

  const chartConfig = createChartConfig(["value"], {
    labels: { value: "Schedules" },
    colors: { value: "var(--heading-color)" },
  });

  if (loading) {
    return (
      <AnalyticsCard
        title="Daily Schedules"
        description="Number of schedules created"
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
        title="Daily Schedules"
        description="Number of schedules created"
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
      title="Daily Schedules"
      description={`Number of schedules created (${timeRange})`}
      currentValue={totalInWindow}
      currentValueLabel="schedules"
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

// Classes Per Schedule Histogram Block
export function ClassesPerScheduleBlock() {
  const { data, loading, error } = useSchedulerAnalyticsData();
  const [timeRange, setTimeRange] = useState<SchedulerTimeRange>("all");
  const [minClasses, setMinClasses] = useState(0);

  // Filter data by time range and min classes
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];

    let filtered = [...data];

    // Time range filter
    if (timeRange !== "all") {
      const now = new Date();
      const cutoff = new Date();
      if (timeRange === "week") {
        cutoff.setDate(now.getDate() - 7);
      } else {
        cutoff.setMonth(now.getMonth() - 1);
      }
      filtered = filtered.filter(
        (schedule) => new Date(schedule.createdAt) >= cutoff
      );
    }

    // Min classes filter
    if (minClasses > 0) {
      filtered = filtered.filter(
        (schedule) => schedule.totalClasses >= minClasses
      );
    }

    return filtered;
  }, [data, timeRange, minClasses]);

  const histogramData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];

    // Create buckets: 0, 1-2, 3-4, 5-6, 7-8, 9-10, 10+
    const buckets = [
      { range: "0", min: 0, max: 0, count: 0 },
      { range: "1-2", min: 1, max: 2, count: 0 },
      { range: "3-4", min: 3, max: 4, count: 0 },
      { range: "5-6", min: 5, max: 6, count: 0 },
      { range: "7-8", min: 7, max: 8, count: 0 },
      { range: "9-10", min: 9, max: 10, count: 0 },
      { range: "10+", min: 11, max: Infinity, count: 0 },
    ];

    filteredData.forEach((schedule) => {
      const classes = schedule.totalClasses;
      for (const bucket of buckets) {
        if (classes >= bucket.min && classes <= bucket.max) {
          bucket.count++;
          break;
        }
      }
    });

    return buckets.map((b) => ({ range: b.range, count: b.count }));
  }, [filteredData]);

  const { maxClasses, avgClasses } = useMemo(() => {
    if (!filteredData || filteredData.length === 0)
      return { maxClasses: 0, avgClasses: 0 };
    const total = filteredData.reduce(
      (sum, schedule) => sum + schedule.totalClasses,
      0
    );
    const max = Math.max(
      ...filteredData.map((schedule) => schedule.totalClasses)
    );
    return {
      maxClasses: max,
      avgClasses: total / filteredData.length,
    };
  }, [filteredData]);

  const chartConfig = createChartConfig(["count"], {
    labels: { count: "Schedules" },
    colors: { count: "var(--heading-color)" },
  });

  if (loading) {
    return (
      <AnalyticsCard
        title="Classes per Schedule"
        description="Distribution of class counts"
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
        title="Classes per Schedule"
        description="Distribution of class counts"
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
      title="Classes per Schedule"
      description="Distribution of class counts"
      currentValue={maxClasses}
      currentValueLabel="max"
      subtitle={`avg. ${avgClasses.toFixed(1)}/schedule`}
      customControls={
        <>
          <span style={{ fontSize: 12, color: "var(--label-color)" }}>
            Time created
          </span>
          <Select
            value={timeRange}
            onChange={(val) => setTimeRange(val as SchedulerTimeRange)}
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
          <SchedulerFilterPopover
            minClasses={minClasses}
            onMinClassesChange={setMinClasses}
            selectedSemester={null}
            onSemesterChange={() => {}}
            semesterOptions={[]}
          />
        </>
      }
    >
      <ChartContainer config={chartConfig} style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={histogramData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border-color)"
              vertical={false}
            />
            <XAxis
              dataKey="range"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--label-color)", fontSize: 10 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--label-color)", fontSize: 12 }}
              width={30}
            />
            <ChartTooltip />
            <Bar
              dataKey="count"
              fill="var(--heading-color)"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </AnalyticsCard>
  );
}

// Schedules By Semester Block
export function SchedulesBySemesterBlock() {
  const { data, loading, error } = useSchedulerAnalyticsData();
  const [timeRange, setTimeRange] = useState<SchedulerTimeRange>("all");
  const [minClasses, setMinClasses] = useState(0);

  // Filter data by time range and min classes
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];

    let filtered = [...data];

    // Time range filter
    if (timeRange !== "all") {
      const now = new Date();
      const cutoff = new Date();
      if (timeRange === "week") {
        cutoff.setDate(now.getDate() - 7);
      } else {
        cutoff.setMonth(now.getMonth() - 1);
      }
      filtered = filtered.filter(
        (schedule) => new Date(schedule.createdAt) >= cutoff
      );
    }

    // Min classes filter
    if (minClasses > 0) {
      filtered = filtered.filter(
        (schedule) => schedule.totalClasses >= minClasses
      );
    }

    return filtered;
  }, [data, timeRange, minClasses]);

  const histogramData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];

    // Count schedules per semester
    const semesterCounts = new Map<string, number>();
    filteredData.forEach((schedule) => {
      const key = `${schedule.semester} ${schedule.year}`;
      semesterCounts.set(key, (semesterCounts.get(key) || 0) + 1);
    });

    // Sort by year and semester
    return Array.from(semesterCounts.entries())
      .sort((a, b) => {
        const [aSem, aYear] = a[0].split(" ");
        const [bSem, bYear] = b[0].split(" ");
        if (aYear !== bYear) return parseInt(aYear) - parseInt(bYear);
        const semOrder = { Spring: 0, Summer: 1, Fall: 2, Winter: 3 };
        return (
          (semOrder[aSem as keyof typeof semOrder] || 0) -
          (semOrder[bSem as keyof typeof semOrder] || 0)
        );
      })
      .map(([semester, count]) => ({
        semester,
        count,
      }));
  }, [filteredData]);

  const peakSemester = useMemo(() => {
    if (histogramData.length === 0) return null;
    return histogramData.reduce((max, item) =>
      item.count > max.count ? item : max
    ).semester;
  }, [histogramData]);

  const chartConfig = createChartConfig(["count"], {
    labels: { count: "Schedules" },
    colors: { count: "var(--heading-color)" },
  });

  if (loading) {
    return (
      <AnalyticsCard
        title="Schedules by Semester"
        description="Distribution across semesters"
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
        title="Schedules by Semester"
        description="Distribution across semesters"
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
      title="Schedules by Semester"
      description="Distribution across semesters"
      currentValue={histogramData.length}
      currentValueLabel="semesters"
      subtitle={peakSemester ? `peak: ${peakSemester}` : undefined}
      customControls={
        <>
          <span style={{ fontSize: 12, color: "var(--label-color)" }}>
            Time created
          </span>
          <Select
            value={timeRange}
            onChange={(val) => setTimeRange(val as SchedulerTimeRange)}
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
          <SchedulerFilterPopover
            minClasses={minClasses}
            onMinClassesChange={setMinClasses}
            selectedSemester={null}
            onSemesterChange={() => {}}
            semesterOptions={[]}
          />
        </>
      }
    >
      <ChartContainer config={chartConfig} style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={histogramData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border-color)"
              vertical={false}
            />
            <XAxis
              dataKey="semester"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--label-color)", fontSize: 10 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--label-color)", fontSize: 12 }}
              width={30}
            />
            <ChartTooltip />
            <Bar
              dataKey="count"
              fill="var(--heading-color)"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </AnalyticsCard>
  );
}

// Top Scheduler Users Table Block
export function TopSchedulerUsersBlock() {
  const { data, loading, error } = useSchedulerAnalyticsData();
  const [timeRange, setTimeRange] = useState<SchedulerTimeRange>("all");

  const topUsers = useMemo(() => {
    if (!data || data.length === 0) return [];

    let filtered = [...data];

    // Time range filter
    if (timeRange !== "all") {
      const now = new Date();
      const cutoff = new Date();
      if (timeRange === "week") {
        cutoff.setDate(now.getDate() - 7);
      } else {
        cutoff.setMonth(now.getMonth() - 1);
      }
      filtered = filtered.filter(
        (schedule) => new Date(schedule.createdAt) >= cutoff
      );
    }

    // Group by user email and count schedules
    const userScheduleCounts = new Map<string, number>();
    filtered.forEach((schedule) => {
      userScheduleCounts.set(
        schedule.userEmail,
        (userScheduleCounts.get(schedule.userEmail) || 0) + 1
      );
    });

    // Sort by count descending and take top 50
    return Array.from(userScheduleCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 50)
      .map(([email, count]) => ({ email, count }));
  }, [data, timeRange]);

  const maxSchedules = topUsers.length > 0 ? topUsers[0].count : 0;

  if (loading) {
    return (
      <AnalyticsCard
        title="Top Scheduler Users"
        description="Users with most schedules"
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
        title="Top Scheduler Users"
        description="Users with most schedules"
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
      title="Top Scheduler Users"
      description="Top 50 users by schedule count"
      subtitle={`max ${maxSchedules} schedules`}
      customControls={
        <>
          <span style={{ fontSize: 12, color: "var(--label-color)" }}>
            Time created
          </span>
          <Select
            value={timeRange}
            onChange={(val) => setTimeRange(val as SchedulerTimeRange)}
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
        </>
      }
    >
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflow: "auto",
          fontSize: 12,
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            tableLayout: "fixed",
          }}
        >
          <colgroup>
            <col style={{ width: "15%" }} />
            <col style={{ width: "85%" }} />
          </colgroup>
          <thead
            style={{
              position: "sticky",
              top: 0,
              background: "var(--foreground-color)",
              zIndex: 1,
            }}
          >
            <tr
              style={{
                borderBottom: "1px solid var(--border-color)",
              }}
            >
              <th
                style={{
                  textAlign: "center",
                  padding: "8px 4px",
                  color: "var(--label-color)",
                  fontWeight: 600,
                }}
              >
                #
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "8px 4px",
                  color: "var(--label-color)",
                  fontWeight: 600,
                }}
              >
                Email
              </th>
            </tr>
          </thead>
          <tbody>
            {topUsers.map((user) => (
              <tr
                key={user.email}
                style={{
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                <td
                  style={{
                    textAlign: "center",
                    padding: "6px 4px",
                    color: "var(--paragraph-color)",
                  }}
                >
                  {user.count}
                </td>
                <td
                  style={{
                    padding: "6px 4px",
                    color: "var(--paragraph-color)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={user.email}
                >
                  {user.email}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AnalyticsCard>
  );
}

// Utilization Ratio Block - percentage of non-empty Schedules over time
export function SchedulerUtilizationRatioBlock() {
  const { data, loading, error } = useSchedulerAnalyticsData();
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [granularity, setGranularity] = useState<Granularity>("day");

  const { chartData, currentRatio, percentChange } = useMemo(() => {
    if (!data || data.length === 0) {
      return { chartData: [], currentRatio: 0, percentChange: null };
    }

    const days = getTimeRangeDays(timeRange);
    const now = new Date();
    const rangeStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const sortedData = [...data].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // Baseline counts before the window
    let baselineEmpty = 0;
    let baselineNonEmpty = 0;
    sortedData.forEach((schedule) => {
      if (new Date(schedule.createdAt) < rangeStart) {
        if (schedule.totalClasses === 0) {
          baselineEmpty++;
        } else {
          baselineNonEmpty++;
        }
      }
    });

    // Initialize buckets
    const bucketMap = new Map<string, { empty: number; nonEmpty: number }>();
    for (let d = new Date(rangeStart); d <= now; ) {
      const key = getGranularityKey(d, granularity);
      bucketMap.set(key, { empty: 0, nonEmpty: 0 });
      if (granularity === "hour") {
        d.setHours(d.getHours() + 1);
      } else {
        d.setDate(d.getDate() + 1);
      }
    }

    // Fill buckets
    sortedData.forEach((schedule) => {
      const date = new Date(schedule.createdAt);
      if (date >= rangeStart && date <= now) {
        const key = getGranularityKey(date, granularity);
        const bucket = bucketMap.get(key);
        if (bucket) {
          if (schedule.totalClasses === 0) {
            bucket.empty++;
          } else {
            bucket.nonEmpty++;
          }
        }
      }
    });

    // Build cumulative data
    const sortedKeys = Array.from(bucketMap.keys()).sort();
    let cumulativeEmpty = baselineEmpty;
    let cumulativeNonEmpty = baselineNonEmpty;

    const chartData = sortedKeys.map((key) => {
      const bucket = bucketMap.get(key)!;
      cumulativeEmpty += bucket.empty;
      cumulativeNonEmpty += bucket.nonEmpty;

      // Ratio = non-empty / empty (how many non-empty per empty)
      const ratio =
        cumulativeEmpty > 0
          ? cumulativeNonEmpty / cumulativeEmpty
          : cumulativeNonEmpty > 0
            ? Infinity
            : 0;

      return {
        date: formatDisplayDate(key, granularity),
        dateKey: key,
        ratio,
        nonEmptyCount: cumulativeNonEmpty,
        emptyCount: cumulativeEmpty,
      };
    });

    const last = chartData[chartData.length - 1];
    const first = chartData[0];
    const currentRatio = last?.ratio ?? 0;
    const startRatio = first?.ratio ?? 0;

    // For cumulative charts: compare end vs start of the visible range
    const percentChange =
      Number.isFinite(currentRatio) &&
      Number.isFinite(startRatio) &&
      startRatio !== 0
        ? ((currentRatio - startRatio) / startRatio) * 100
        : null;

    return { chartData, currentRatio, percentChange };
  }, [data, timeRange, granularity]);

  const chartConfig = createChartConfig(["ratio"], {
    labels: { ratio: "Ratio" },
    colors: { ratio: "var(--heading-color)" },
  });

  if (loading) {
    return (
      <AnalyticsCard
        title="Utilization Ratio"
        description="Percentage of non-empty schedules"
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
        title="Utilization Ratio"
        description="Percentage of non-empty schedules"
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
      title="Utilization Ratio"
      description="Non-empty / empty schedules"
      currentValue={
        Number.isFinite(currentRatio) ? `${currentRatio.toFixed(2)}:1` : "∞"
      }
      comparison={
        percentChange !== null ? (
          <span
            style={{
              color: percentChange >= 0 ? "var(--green-500)" : "var(--red-500)",
            }}
          >
            {percentChange >= 0 ? "+" : ""}
            {percentChange.toFixed(1)}%
          </span>
        ) : undefined
      }
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
                id="schedulerUtilizationGradient"
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
              tick={{ fill: "var(--label-color)", fontSize: 10 }}
              width={40}
              domain={["dataMin - 0.1", "dataMax + 0.1"]}
              tickFormatter={(value) =>
                Number.isFinite(value) ? `${value.toFixed(1)}` : "∞"
              }
            />
            <ChartTooltip
              tooltipConfig={{
                valueFormatter: (value: number, _name, item) => {
                  const payload = item?.payload;
                  const ratioStr = Number.isFinite(value)
                    ? `${value.toFixed(2)}:1`
                    : "∞";
                  if (!payload) return ratioStr;
                  return `${ratioStr} (${payload.nonEmptyCount.toLocaleString()} non-empty / ${payload.emptyCount.toLocaleString()} empty)`;
                },
              }}
            />
            <Area
              type="monotone"
              dataKey="ratio"
              stroke="var(--heading-color)"
              strokeWidth={2}
              fill="url(#schedulerUtilizationGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    </AnalyticsCard>
  );
}
