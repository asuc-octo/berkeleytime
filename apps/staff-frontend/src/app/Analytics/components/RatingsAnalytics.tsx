import { useMemo } from "react";

import {
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

import {
  ChartContainer,
  ChartTooltip,
  createChartConfig,
} from "@/components/Chart";

import { useRatingAnalyticsData, useRatingMetricsAnalyticsData } from "@/hooks/api";

import { AnalyticsCard } from "./AnalyticsCard";

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
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
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

    for (let d = new Date(thirtyDaysAgo); d <= now; d.setDate(d.getDate() + 1)) {
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
      totalRatings.push({ date: displayDate, dateKey: dayKey, value: cumulativeRatings });

      // Cumulative unique users
      data.users.forEach((u) => cumulativeUsers.add(u));
      uniqueUsers.push({ date: displayDate, dateKey: dayKey, value: cumulativeUsers.size });

      // Cumulative unique courses
      data.courses.forEach((c) => cumulativeCourses.add(c));
      uniqueCourses.push({ date: displayDate, dateKey: dayKey, value: cumulativeCourses.size });
    });

    // Calculate 30-day change (comparing first and last point in window)
    const calc30dChange = (data: DailyDataPoint[]): MetricSummary => {
      if (data.length === 0) return { current: 0, absoluteChange: 0, percentChange: 0 };

      const current = data[data.length - 1].value;
      const start = data[0].value;

      const absoluteChange = current - start;
      const percentChange = start > 0
        ? ((current - start) / start) * 100
        : current > 0 ? 100 : 0;

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
  const { uniqueUsers, summaries, loading, error } = useProcessedAnalyticsData();

  const chartConfig = createChartConfig(["value"], {
    labels: { value: "Unique Users" },
    colors: { value: "var(--heading-color)" },
  });

  if (loading) {
    return (
      <AnalyticsCard
        title="Rating Users"
        description="Users who submitted ratings (30d)"
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
          Loading...
        </div>
      </AnalyticsCard>
    );
  }

  if (error) {
    return (
      <AnalyticsCard
        title="Rating Users"
        description="Users who submitted ratings (30d)"
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, color: "var(--red-500)" }}>
          Error loading data
        </div>
      </AnalyticsCard>
    );
  }

  return (
    <AnalyticsCard
      title="Rating Users"
      description="Users who submitted ratings (30d)"
      currentValue={summaries.uniqueUsers.current}
      currentValueLabel="users"
      absoluteChange={summaries.uniqueUsers.absoluteChange}
      percentChange={summaries.uniqueUsers.percentChange}
      changeTimescale="30d"
    >
      <ChartContainer config={chartConfig} style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={uniqueUsers}>
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
            />
            <ChartTooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke="var(--heading-color)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "var(--heading-color)" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </AnalyticsCard>
  );
}

// Ratings Count Block
export function RatingsCountBlock() {
  const { totalRatings, summaries, loading, error } = useProcessedAnalyticsData();

  const chartConfig = createChartConfig(["value"], {
    labels: { value: "Total Submissions" },
    colors: { value: "var(--heading-color)" },
  });

  if (loading) {
    return (
      <AnalyticsCard
        title="Total Ratings"
        description="Cumulative rating submissions (30d)"
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
          Loading...
        </div>
      </AnalyticsCard>
    );
  }

  if (error) {
    return (
      <AnalyticsCard
        title="Total Ratings"
        description="Cumulative rating submissions (30d)"
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, color: "var(--red-500)" }}>
          Error loading data
        </div>
      </AnalyticsCard>
    );
  }

  return (
    <AnalyticsCard
      title="Total Ratings"
      description="Cumulative rating submissions (30d)"
      currentValue={summaries.totalRatings.current}
      currentValueLabel="submissions"
      absoluteChange={summaries.totalRatings.absoluteChange}
      percentChange={summaries.totalRatings.percentChange}
      changeTimescale="30d"
    >
      <ChartContainer config={chartConfig} style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={totalRatings}>
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
            />
            <ChartTooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke="var(--heading-color)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "var(--heading-color)" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </AnalyticsCard>
  );
}

// Course Distribution Block
export function CourseDistributionBlock() {
  const { uniqueCourses, summaries, loading, error } = useProcessedAnalyticsData();

  const chartConfig = createChartConfig(["value"], {
    labels: { value: "Courses with Ratings" },
    colors: { value: "var(--heading-color)" },
  });

  if (loading) {
    return (
      <AnalyticsCard
        title="Rated Courses"
        description="Courses with ratings (30d)"
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
          Loading...
        </div>
      </AnalyticsCard>
    );
  }

  if (error) {
    return (
      <AnalyticsCard
        title="Rated Courses"
        description="Courses with ratings (30d)"
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, color: "var(--red-500)" }}>
          Error loading data
        </div>
      </AnalyticsCard>
    );
  }

  return (
    <AnalyticsCard
      title="Rated Courses"
      description="Courses with ratings (30d)"
      currentValue={summaries.uniqueCourses.current}
      currentValueLabel="courses"
      absoluteChange={summaries.uniqueCourses.absoluteChange}
      percentChange={summaries.uniqueCourses.percentChange}
      changeTimescale="30d"
    >
      <ChartContainer config={chartConfig} style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={uniqueCourses}>
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
            />
            <ChartTooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke="var(--heading-color)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "var(--heading-color)" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </AnalyticsCard>
  );
}

// Custom tooltip for treemap
const TreemapTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const displayName = data.fullName || data.name;

  return (
    <div
      style={{
        background: "var(--background-color)",
        border: "1px solid var(--border-color)",
        borderRadius: 6,
        padding: "8px 12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}
    >
      <div style={{ fontWeight: 600, color: "var(--heading-color)" }}>
        {displayName}
      </div>
      <div style={{ color: "var(--label-color)", fontSize: 13, marginTop: 2 }}>
        {data.value.toLocaleString()} ratings
      </div>
    </div>
  );
};

// Tableau 10 color palette - professional categorical colors
const SUBJECT_PALETTE = [
  "#4e79a7", "#f28e2c", "#e15759", "#76b7b2", "#59a14f",
  "#edc949", "#af7aa1", "#ff9da7", "#9c755f", "#bab0ab",
];

// Custom treemap cell content with color support
const TreemapContent = (props: any) => {
  const { x, y, width, height, name, value, root } = props;

  // Only show text if cell is big enough
  const showName = width > 40 && height > 25;
  const showValue = width > 35 && height > 40;

  // Get color from root (subject level)
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
        rx={0}
        ry={0}
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

  const { treemapData, totalSubjects, singleRatingCount, avgPerClass } = useMemo(() => {
    if (!rawData || rawData.length === 0) {
      return { treemapData: [], totalSubjects: 0, singleRatingCount: 0, avgPerClass: 0 };
    }

    // Count ratings per course and group by subject
    const subjectData = new Map<string, Map<string, number>>();

    rawData.forEach((point) => {
      // Parse "COMPSCI 61A" into subject="COMPSCI", courseNum="61A"
      const parts = point.courseKey.split(" ");
      const subject = parts[0];
      const courseNum = parts.slice(1).join(" ") || point.courseKey;

      if (!subjectData.has(subject)) {
        subjectData.set(subject, new Map());
      }
      const courses = subjectData.get(subject)!;
      courses.set(courseNum, (courses.get(courseNum) || 0) + 1);
    });

    // Create hierarchical treemap data grouped by subject
    // Sort by total ratings so biggest subjects get first colors from palette
    const sortedSubjects = Array.from(subjectData.entries())
      .map(([subject, courses]) => {
        const children = Array.from(courses.entries())
          .map(([courseNum, count]) => ({
            name: courseNum,
            fullName: `${subject} ${courseNum}`,
            value: count,
          }))
          .sort((a, b) => b.value - a.value);

        const totalValue = children.reduce((sum, c) => sum + c.value, 0);

        return { subject, children, totalValue };
      })
      .sort((a, b) => b.totalValue - a.totalValue);

    const treemapData = sortedSubjects.map(({ subject, children, totalValue }, index) => ({
      name: subject,
      color: SUBJECT_PALETTE[index % SUBJECT_PALETTE.length],
      children,
      value: totalValue,
    }));

    // Count classes with only 1 rating
    const singleRatingCount = treemapData.reduce(
      (sum, subject) => sum + subject.children.filter((c) => c.value === 1).length,
      0
    );

    // Average ratings per class
    const totalRatings = treemapData.reduce((sum, s) => sum + s.value, 0);
    const totalClasses = treemapData.reduce((sum, s) => sum + s.children.length, 0);
    const avgPerClass = totalClasses > 0 ? totalRatings / totalClasses : 0;

    return { treemapData, totalSubjects: treemapData.length, singleRatingCount, avgPerClass };
  }, [rawData]);

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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
          Loading...
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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, color: "var(--red-500)" }}>
          Error loading data
        </div>
      </AnalyticsCard>
    );
  }

  return (
    <AnalyticsCard
      title="Course Ratings Treemap"
      description={`Area = rating count, by subject`}
      currentValue={singleRatingCount}
      currentValueLabel="w. 1 rating"
      subtitle={`avg ${avgPerClass.toFixed(1)} ratings/class`}
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

// Daily Ratings Block - ratings per calendar day (last 30 days)
export function RatingsDayHistogramBlock() {
  const { data: rawData, loading, error } = useRatingAnalyticsData();

  const { dailyData, totalInWindow, avgPerDay } = useMemo(() => {
    if (!rawData || rawData.length === 0) {
      return { dailyData: [] as DailyDataPoint[], totalInWindow: 0, avgPerDay: 0 };
    }

    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    // Get date 30 days ago
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Initialize all days in the last 30 days with 0
    const dateMap = new Map<string, number>();
    for (let d = new Date(thirtyDaysAgo); d <= now; d.setDate(d.getDate() + 1)) {
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      dateMap.set(dateKey, 0);
    }

    // Count ratings per day (only last 30 days)
    rawData.forEach((point) => {
      const date = new Date(point.createdAt);
      if (date >= thirtyDaysAgo && date <= now) {
        const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + 1);
      }
    });

    // Sort by date and convert to chart data
    const sortedDates = Array.from(dateMap.keys()).sort();
    const dailyData: DailyDataPoint[] = sortedDates.map((dateKey) => {
      const [, month, day] = dateKey.split("-");
      const displayDate = `${monthNames[parseInt(month) - 1]} ${parseInt(day)}`;
      return {
        date: displayDate,
        dateKey,
        value: dateMap.get(dateKey) || 0,
      };
    });

    // Calculate total ratings in window and average
    const totalInWindow = dailyData.reduce((sum, d) => sum + d.value, 0);
    const avgPerDay = dailyData.length > 0 ? totalInWindow / dailyData.length : 0;

    return {
      dailyData,
      totalInWindow,
      avgPerDay,
    };
  }, [rawData]);

  const chartConfig = createChartConfig(["value"], {
    labels: { value: "Ratings" },
    colors: { value: "var(--heading-color)" },
  });

  if (loading) {
    return (
      <AnalyticsCard
        title="Daily Ratings"
        description="Number of ratings submitted per day (30d)"
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
          Loading...
        </div>
      </AnalyticsCard>
    );
  }

  if (error) {
    return (
      <AnalyticsCard
        title="Daily Ratings"
        description="Number of ratings submitted per day (30d)"
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, color: "var(--red-500)" }}>
          Error loading data
        </div>
      </AnalyticsCard>
    );
  }

  return (
    <AnalyticsCard
      title="Daily Ratings"
      description="Number of ratings submitted per day (30d)"
      currentValue={totalInWindow}
      currentValueLabel="ratings"
      subtitle={`avg ${avgPerDay.toFixed(1)}/day`}
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
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
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
      Usefulness: cumulativeTotals.Usefulness.count > 0
        ? cumulativeTotals.Usefulness.sum / cumulativeTotals.Usefulness.count
        : 0,
      Difficulty: cumulativeTotals.Difficulty.count > 0
        ? cumulativeTotals.Difficulty.sum / cumulativeTotals.Difficulty.count
        : 0,
      Workload: cumulativeTotals.Workload.count > 0
        ? cumulativeTotals.Workload.sum / cumulativeTotals.Workload.count
        : 0,
    };

    return { dailyData, overallAverages };
  }, [rawData]);

  const chartConfig = createChartConfig(["Usefulness", "Difficulty", "Workload"], {
    labels: {
      Usefulness: "Usefulness",
      Difficulty: "Difficulty",
      Workload: "Workload",
    },
    colors: METRIC_COLORS,
  });

  if (loading) {
    return (
      <AnalyticsCard
        title="Average Scores"
        description="Running average of all ratings up to each day"
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
          Loading...
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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, color: "var(--red-500)" }}>
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
              width={30}
              domain={[1, 5]}
              ticks={[1, 2, 3, 4, 5]}
            />
            <ChartTooltip
              tooltipConfig={{
                valueFormatter: (value: number) => value?.toFixed(2) ?? "-",
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
