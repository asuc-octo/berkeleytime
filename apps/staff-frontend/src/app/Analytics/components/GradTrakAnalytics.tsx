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
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
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

// Total GradTraks Block
export function TotalGradTraksBlock() {
  const { data, loading, error } = useGradTrakAnalyticsData();
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [granularity, setGranularity] = useState<Granularity>("day");

  // Filter out empty gradtraks
  const nonEmptyData = useMemo(() => {
    return data.filter((plan) => plan.totalCourses > 0);
  }, [data]);

  const { chartData, current, absoluteChange, percentChange } = useMemo(() => {
    if (!nonEmptyData || nonEmptyData.length === 0) {
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

    const sortedData = [...nonEmptyData].sort(
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
  }, [nonEmptyData, timeRange, granularity]);

  const chartConfig = createChartConfig(["value"], {
    labels: { value: "GradTraks" },
    colors: { value: "var(--heading-color)" },
  });

  if (loading) {
    return (
      <AnalyticsCard title="Total GradTraks" description="Users with a GradTrak">
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
      <AnalyticsCard title="Total GradTraks" description="Users with a GradTrak">
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

  // Filter out empty gradtraks
  const nonEmptyData = useMemo(() => {
    return data.filter((plan) => plan.totalCourses > 0);
  }, [data]);

  const histogramData = useMemo(() => {
    if (!nonEmptyData || nonEmptyData.length === 0) return [];

    // Create buckets: 1-5, 6-10, 11-15, 16-20, 21-25, 26-30, 31-35, 36-40, 40+
    const buckets = [
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

    nonEmptyData.forEach((plan) => {
      const courses = plan.totalCourses;
      for (const bucket of buckets) {
        if (courses >= bucket.min && courses <= bucket.max) {
          bucket.count++;
          break;
        }
      }
    });

    return buckets.map((b) => ({ range: b.range, count: b.count }));
  }, [nonEmptyData]);

  const avgCourses = useMemo(() => {
    if (!nonEmptyData || nonEmptyData.length === 0) return 0;
    const total = nonEmptyData.reduce((sum, plan) => sum + plan.totalCourses, 0);
    return total / nonEmptyData.length;
  }, [nonEmptyData]);

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
      currentValuePrefix="avg "
      currentValue={Math.round(avgCourses * 10) / 10}
      currentValueLabel="courses"
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

  // Filter out empty gradtraks
  const nonEmptyData = useMemo(() => {
    return data.filter((plan) => plan.totalCourses > 0);
  }, [data]);

  const histogramData = useMemo(() => {
    if (!nonEmptyData || nonEmptyData.length === 0) return [];

    // Count gradtraks per major
    const majorCounts = new Map<string, number>();
    nonEmptyData.forEach((plan) => {
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
  }, [nonEmptyData]);

  const { uniqueMajors, avgPerMajor } = useMemo(() => {
    if (!nonEmptyData || nonEmptyData.length === 0) return { uniqueMajors: 0, avgPerMajor: 0 };
    const majors = new Set<string>();
    let totalMajorAssignments = 0;
    nonEmptyData.forEach((plan) => {
      plan.majors.forEach((m) => {
        majors.add(m);
        totalMajorAssignments++;
      });
    });
    return {
      uniqueMajors: majors.size,
      avgPerMajor: majors.size > 0 ? totalMajorAssignments / majors.size : 0,
    };
  }, [nonEmptyData]);

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
      subtitle={`avg ${avgPerMajor.toFixed(1)}/major`}
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

  // Filter out empty gradtraks
  const nonEmptyData = useMemo(() => {
    return data.filter((plan) => plan.totalCourses > 0);
  }, [data]);

  const histogramData = useMemo(() => {
    if (!nonEmptyData || nonEmptyData.length === 0) return [];

    // Count gradtraks per start year
    const yearCounts = new Map<number, number>();
    nonEmptyData.forEach((plan) => {
      if (plan.startYear) {
        yearCounts.set(plan.startYear, (yearCounts.get(plan.startYear) || 0) + 1);
      }
    });

    // Sort by year ascending
    return Array.from(yearCounts.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([year, count]) => ({
        year: String(year),
        count,
      }));
  }, [nonEmptyData]);

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

  const topUsers = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Sort by total courses descending and take top 50
    return [...data]
      .filter((plan) => plan.totalCourses > 0)
      .sort((a, b) => b.totalCourses - a.totalCourses)
      .slice(0, 50);
  }, [data]);

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
            {topUsers.map((user, index) => (
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
