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
import { useGradTrakAnalyticsData } from "@/hooks/api";

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

type GradTrakTimeRange = "all" | "week" | "month";

// Filter popover for GradTrak filters
function GradTrakFilterPopover({
  minCourses,
  onMinCoursesChange,
  selectedYear,
  onYearChange,
  yearOptions,
  children,
}: {
  minCourses: number;
  onMinCoursesChange: (val: number) => void;
  selectedYear: string | null;
  onYearChange: (val: string | null) => void;
  yearOptions: { value: string; label: string }[];
  children?: React.ReactNode;
}) {
  const hasActiveFilter = minCourses > 0 || selectedYear !== null;

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
              value={minCourses === 0 ? "" : String(minCourses)}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                onMinCoursesChange(val === "" ? 0 : parseInt(val) || 0);
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
              courses
            </span>
          </div>
          {yearOptions.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: "var(--label-color)" }}>
                Start year
              </span>
              <Select
                searchable
                clearable
                value={selectedYear}
                onChange={(val) => onYearChange(val as string | null)}
                options={yearOptions}
                placeholder="All"
                searchPlaceholder="Search"
                style={{
                  width: 100,
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

// Total GradTraks Block
export function TotalGradTraksBlock() {
  const { data, loading, error } = useGradTrakAnalyticsData();
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [granularity, setGranularity] = useState<Granularity>("day");
  const [minCourses, setMinCourses] = useState(0);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  // Get unique years for filter dropdown
  const yearOptions = useMemo(() => {
    if (!data || data.length === 0) return [];
    const years = new Set<number>();
    data.forEach((plan) => {
      if (plan.startYear) years.add(plan.startYear);
    });
    return Array.from(years)
      .sort((a, b) => b - a)
      .map((year) => ({ value: String(year), label: String(year) }));
  }, [data]);

  // Filter by min courses and start year
  const filteredData = useMemo(() => {
    let filtered = [...data];
    if (minCourses > 0) {
      filtered = filtered.filter((plan) => plan.totalCourses >= minCourses);
    }
    if (selectedYear) {
      filtered = filtered.filter(
        (plan) => plan.startYear === parseInt(selectedYear)
      );
    }
    return filtered;
  }, [data, minCourses, selectedYear]);

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
    labels: { value: "GradTraks" },
    colors: { value: "var(--heading-color)" },
  });

  if (loading) {
    return (
      <AnalyticsCard
        title="Total GradTraks"
        description="Users with a GradTrak"
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
        title="Total GradTraks"
        description="Users with a GradTrak"
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
      title="Total GradTraks"
      description={`Cumulative gradtraks created (${timeRange})`}
      currentValue={current}
      currentValueLabel="gradtraks"
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
        <GradTrakFilterPopover
          minCourses={minCourses}
          onMinCoursesChange={setMinCourses}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          yearOptions={yearOptions}
        />
      }
    >
      <ChartContainer config={chartConfig} style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient
                id="gradtrakGrowthGradient"
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
              fill="url(#gradtrakGrowthGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    </AnalyticsCard>
  );
}

// Course Count Histogram Block
export function CourseCountHistogramBlock() {
  const { data, loading, error } = useGradTrakAnalyticsData();
  const [timeRange, setTimeRange] = useState<GradTrakTimeRange>("all");
  const [minCourses, setMinCourses] = useState(0);

  // Filter data by time range and min courses
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
      filtered = filtered.filter((plan) => new Date(plan.createdAt) >= cutoff);
    }

    // Min courses filter
    if (minCourses > 0) {
      filtered = filtered.filter((plan) => plan.totalCourses >= minCourses);
    }

    return filtered;
  }, [data, timeRange, minCourses]);

  const histogramData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];

    // Create buckets: 0, 1-5, 6-10, 11-15, 16-20, 21-25, 26-30, 31-35, 36-40, 40+
    const buckets = [
      { range: "0", min: 0, max: 0, count: 0 },
      { range: "1-5", min: 1, max: 5, count: 0 },
      { range: "6-10", min: 6, max: 10, count: 0 },
      { range: "11-15", min: 11, max: 15, count: 0 },
      { range: "16-20", min: 16, max: 20, count: 0 },
      { range: "21-25", min: 21, max: 25, count: 0 },
      { range: "26-30", min: 26, max: 30, count: 0 },
      { range: "31-35", min: 31, max: 35, count: 0 },
      { range: "36-40", min: 36, max: 40, count: 0 },
      { range: "40+", min: 41, max: Infinity, count: 0 },
    ];

    filteredData.forEach((plan) => {
      const courses = plan.totalCourses;
      for (const bucket of buckets) {
        if (courses >= bucket.min && courses <= bucket.max) {
          bucket.count++;
          break;
        }
      }
    });

    return buckets.map((b) => ({ range: b.range, count: b.count }));
  }, [filteredData]);

  const { maxCourses, avgCourses } = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return { maxCourses: 0, avgCourses: 0 };
    const total = filteredData.reduce(
      (sum, plan) => sum + plan.totalCourses,
      0
    );
    const max = Math.max(...filteredData.map((plan) => plan.totalCourses));
    return {
      maxCourses: max,
      avgCourses: total / filteredData.length,
    };
  }, [filteredData]);

  const chartConfig = createChartConfig(["count"], {
    labels: { count: "GradTraks" },
    colors: { count: "var(--heading-color)" },
  });

  if (loading) {
    return (
      <AnalyticsCard
        title="Courses per GradTrak"
        description="Distribution of course counts"
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
        title="Courses per GradTrak"
        description="Distribution of course counts"
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
      title="Courses per GradTrak"
      description="Distribution of course counts"
      currentValue={maxCourses}
      currentValueLabel="max"
      subtitle={`avg. ${avgCourses.toFixed(1)}/gradtrak`}
      customControls={
        <>
          <span style={{ fontSize: 12, color: "var(--label-color)" }}>
            Time created
          </span>
          <Select
            value={timeRange}
            onChange={(val) => setTimeRange(val as GradTrakTimeRange)}
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
          <GradTrakFilterPopover
            minCourses={minCourses}
            onMinCoursesChange={setMinCourses}
            selectedYear={null}
            onYearChange={() => {}}
            yearOptions={[]}
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

// Major Distribution Histogram Block
export function MajorDistributionBlock() {
  const { data, loading, error } = useGradTrakAnalyticsData();
  const [timeRange, setTimeRange] = useState<GradTrakTimeRange>("all");
  const [minCourses, setMinCourses] = useState(0);

  // Filter data by time range and min courses
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
      filtered = filtered.filter((plan) => new Date(plan.createdAt) >= cutoff);
    }

    // Min courses filter
    if (minCourses > 0) {
      filtered = filtered.filter((plan) => plan.totalCourses >= minCourses);
    }

    return filtered;
  }, [data, timeRange, minCourses]);

  const histogramData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];

    // Count gradtraks per major
    const majorCounts = new Map<string, number>();
    filteredData.forEach((plan) => {
      plan.majors.forEach((major) => {
        majorCounts.set(major, (majorCounts.get(major) || 0) + 1);
      });
    });

    // Sort by count descending and take top 15
    return Array.from(majorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([major, count]) => ({
        major: major.substring(0, 4).toUpperCase(),
        fullMajor: major,
        count,
      }));
  }, [filteredData]);

  const { uniqueMajors, avgPerMajor } = useMemo(() => {
    if (!filteredData || filteredData.length === 0)
      return { uniqueMajors: 0, avgPerMajor: 0 };
    const majors = new Set<string>();
    let totalMajorAssignments = 0;
    filteredData.forEach((plan) => {
      plan.majors.forEach((m) => {
        majors.add(m);
        totalMajorAssignments++;
      });
    });
    return {
      uniqueMajors: majors.size,
      avgPerMajor: majors.size > 0 ? totalMajorAssignments / majors.size : 0,
    };
  }, [filteredData]);

  const chartConfig = createChartConfig(["count"], {
    labels: { count: "GradTraks" },
    colors: { count: "var(--heading-color)" },
  });

  if (loading) {
    return (
      <AnalyticsCard
        title="GradTraks by Major"
        description="Distribution across majors"
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
        title="GradTraks by Major"
        description="Distribution across majors"
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
      title="GradTraks by Major"
      description="Top 15 majors by gradtrak count"
      currentValue={uniqueMajors}
      currentValueLabel="majors"
      subtitle={`avg. ${avgPerMajor.toFixed(1)}/major`}
      customControls={
        <>
          <span style={{ fontSize: 12, color: "var(--label-color)" }}>
            Time created
          </span>
          <Select
            value={timeRange}
            onChange={(val) => setTimeRange(val as GradTrakTimeRange)}
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
          <GradTrakFilterPopover
            minCourses={minCourses}
            onMinCoursesChange={setMinCourses}
            selectedYear={null}
            onYearChange={() => {}}
            yearOptions={[]}
          />
        </>
      }
    >
      <ChartContainer config={chartConfig} style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={histogramData} layout="vertical">
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
            />
            <YAxis
              type="category"
              dataKey="major"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--label-color)", fontSize: 10 }}
              width={45}
              interval={0}
            />
            <ChartTooltip
              tooltipConfig={{
                labelFormatter: (_label, payload) =>
                  payload?.[0]?.payload?.fullMajor ?? _label,
              }}
            />
            <Bar
              dataKey="count"
              fill="var(--heading-color)"
              radius={[0, 2, 2, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </AnalyticsCard>
  );
}

// Start Year Distribution Histogram Block
export function StartYearDistributionBlock() {
  const { data, loading, error } = useGradTrakAnalyticsData();
  const [timeRange, setTimeRange] = useState<GradTrakTimeRange>("all");
  const [minCourses, setMinCourses] = useState(0);

  // Filter data by time range and min courses
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
      filtered = filtered.filter((plan) => new Date(plan.createdAt) >= cutoff);
    }

    // Min courses filter
    if (minCourses > 0) {
      filtered = filtered.filter((plan) => plan.totalCourses >= minCourses);
    }

    return filtered;
  }, [data, timeRange, minCourses]);

  const histogramData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];

    // Count gradtraks per start year
    const yearCounts = new Map<number, number>();
    filteredData.forEach((plan) => {
      if (plan.startYear) {
        yearCounts.set(
          plan.startYear,
          (yearCounts.get(plan.startYear) || 0) + 1
        );
      }
    });

    // Sort by year ascending
    return Array.from(yearCounts.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([year, count]) => ({
        year: String(year),
        count,
      }));
  }, [filteredData]);

  const peakYear = useMemo(() => {
    if (histogramData.length === 0) return null;
    return histogramData.reduce((max, item) =>
      item.count > max.count ? item : max
    ).year;
  }, [histogramData]);

  const chartConfig = createChartConfig(["count"], {
    labels: { count: "GradTraks" },
    colors: { count: "var(--heading-color)" },
  });

  if (loading) {
    return (
      <AnalyticsCard
        title="GradTraks by Start Year"
        description="Distribution across start years"
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
        title="GradTraks by Start Year"
        description="Distribution across start years"
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
      title="GradTraks by Start Year"
      description="Distribution across start years"
      currentValue={histogramData.length}
      currentValueLabel="start years"
      subtitle={peakYear ? `peak: ${peakYear}` : undefined}
      customControls={
        <>
          <span style={{ fontSize: 12, color: "var(--label-color)" }}>
            Time created
          </span>
          <Select
            value={timeRange}
            onChange={(val) => setTimeRange(val as GradTrakTimeRange)}
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
          <GradTrakFilterPopover
            minCourses={minCourses}
            onMinCoursesChange={setMinCourses}
            selectedYear={null}
            onYearChange={() => {}}
            yearOptions={[]}
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
              dataKey="year"
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

// Top Users Table Block
export function TopUsersTableBlock() {
  const { data, loading, error } = useGradTrakAnalyticsData();
  const [timeRange, setTimeRange] = useState<GradTrakTimeRange>("all");

  const topUsers = useMemo(() => {
    if (!data || data.length === 0) return [];

    let filtered = [...data].filter((plan) => plan.totalCourses > 0);

    // Time range filter
    if (timeRange !== "all") {
      const now = new Date();
      const cutoff = new Date();
      if (timeRange === "week") {
        cutoff.setDate(now.getDate() - 7);
      } else {
        cutoff.setMonth(now.getMonth() - 1);
      }
      filtered = filtered.filter((plan) => new Date(plan.createdAt) >= cutoff);
    }

    // Sort by total courses descending and take top 50
    return filtered
      .sort((a, b) => b.totalCourses - a.totalCourses)
      .slice(0, 50);
  }, [data, timeRange]);

  const maxCourses = topUsers.length > 0 ? topUsers[0].totalCourses : 0;

  if (loading) {
    return (
      <AnalyticsCard
        title="Top GradTrak Users"
        description="Users with most courses in their plan"
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
        title="Top GradTrak Users"
        description="Users with most courses in their plan"
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
      title="Top GradTrak Users"
      description="Top 50 users by course count"
      subtitle={`max ${maxCourses} courses`}
      customControls={
        <>
          <span style={{ fontSize: 12, color: "var(--label-color)" }}>
            Time created
          </span>
          <Select
            value={timeRange}
            onChange={(val) => setTimeRange(val as GradTrakTimeRange)}
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
                  width: 50,
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
                  width: 70,
                }}
              >
                Email
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "8px 4px",
                  color: "var(--label-color)",
                  fontWeight: 600,
                }}
              >
                Majors
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "8px 4px",
                  color: "var(--label-color)",
                  fontWeight: 600,
                }}
              >
                Minors
              </th>
            </tr>
          </thead>
          <tbody>
            {topUsers.map((user) => (
              <tr
                key={user.planId}
                style={{
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                <td
                  style={{
                    textAlign: "center",
                    padding: "6px 4px",
                    color: "var(--heading-color)",
                    fontWeight: 600,
                  }}
                >
                  {user.totalCourses}
                </td>
                <td
                  style={{
                    padding: "6px 4px",
                    color: "var(--paragraph-color)",
                  }}
                  title={user.userEmail}
                >
                  {user.userEmail.substring(0, 5)}...
                </td>
                <td
                  style={{
                    padding: "6px 4px",
                    color: "var(--paragraph-color)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={user.majors.join(", ")}
                >
                  {user.majors.join(", ") || "—"}
                </td>
                <td
                  style={{
                    padding: "6px 4px",
                    color: "var(--paragraph-color)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={user.minors.join(", ")}
                >
                  {user.minors.join(", ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AnalyticsCard>
  );
}

// Utilization Ratio Block - percentage of non-empty GradTraks over time
export function UtilizationRatioBlock() {
  const { data, loading, error } = useGradTrakAnalyticsData();
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
    sortedData.forEach((plan) => {
      if (new Date(plan.createdAt) < rangeStart) {
        if (plan.totalCourses === 0) {
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
    sortedData.forEach((plan) => {
      const date = new Date(plan.createdAt);
      if (date >= rangeStart && date <= now) {
        const key = getGranularityKey(date, granularity);
        const bucket = bucketMap.get(key);
        if (bucket) {
          if (plan.totalCourses === 0) {
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
        description="Percentage of non-empty gradtraks"
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
        description="Percentage of non-empty gradtraks"
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
      description="Non-empty / empty gradtraks"
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
                id="utilizationGradient"
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
              fill="url(#utilizationGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    </AnalyticsCard>
  );
}
