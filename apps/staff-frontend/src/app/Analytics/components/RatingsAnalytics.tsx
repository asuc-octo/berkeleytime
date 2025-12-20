import { useMemo } from "react";

import {
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

import { useRatingAnalyticsData } from "@/hooks/api";

import { AnalyticsCard } from "./AnalyticsCard";

interface DailyDataPoint {
  date: string;
  dateKey: string;
  value: number;
}

interface MetricSummary {
  current: number;
  percentChange7d: number;
}

/**
 * Process raw rating data points into daily cumulative timeseries
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

    // Group data by day (YYYY-MM-DD format)
    const dailyData = new Map<
      string,
      {
        count: number;
        users: Set<string>;
        courses: Set<string>;
      }
    >();

    // Sort by date first
    const sortedData = [...rawData].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    sortedData.forEach((point) => {
      const date = new Date(point.createdAt);
      const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

      if (!dailyData.has(dayKey)) {
        dailyData.set(dayKey, {
          count: 0,
          users: new Set(),
          courses: new Set(),
        });
      }

      const dayData = dailyData.get(dayKey)!;
      dayData.count++;
      dayData.users.add(point.anonymousUserId);
      dayData.courses.add(point.courseKey);
    });

    // Convert to sorted array and compute cumulative values
    const sortedDays = Array.from(dailyData.keys()).sort();

    let cumulativeRatings = 0;
    const cumulativeUsers = new Set<string>();
    const cumulativeCourses = new Set<string>();

    const totalRatings: DailyDataPoint[] = [];
    const uniqueUsers: DailyDataPoint[] = [];
    const uniqueCourses: DailyDataPoint[] = [];

    sortedDays.forEach((dayKey) => {
      const data = dailyData.get(dayKey)!;

      // Format date for display (e.g., "Dec 19")
      const [, month, day] = dayKey.split("-");
      const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      ];
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

    // Calculate 7-day percent change
    const calc7dChange = (data: DailyDataPoint[]): MetricSummary => {
      if (data.length === 0) return { current: 0, percentChange7d: 0 };

      const current = data[data.length - 1].value;

      // Find value from 7 days ago
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const sevenDaysAgoKey = `${sevenDaysAgo.getFullYear()}-${String(sevenDaysAgo.getMonth() + 1).padStart(2, "0")}-${String(sevenDaysAgo.getDate()).padStart(2, "0")}`;

      // Find the closest data point on or before 7 days ago
      let value7dAgo = 0;
      for (const point of data) {
        if (point.dateKey <= sevenDaysAgoKey) {
          value7dAgo = point.value;
        } else {
          break;
        }
      }

      const percentChange7d = value7dAgo > 0
        ? ((current - value7dAgo) / value7dAgo) * 100
        : current > 0 ? 100 : 0;

      return { current, percentChange7d };
    };

    return {
      totalRatings,
      uniqueUsers,
      uniqueCourses,
      summaries: {
        totalRatings: calc7dChange(totalRatings),
        uniqueUsers: calc7dChange(uniqueUsers),
        uniqueCourses: calc7dChange(uniqueCourses),
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
        title="Unique Users Growth"
        description="Number of unique users who have submitted ratings"
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
        title="Unique Users Growth"
        description="Number of unique users who have submitted ratings"
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, color: "var(--red-500)" }}>
          Error loading data
        </div>
      </AnalyticsCard>
    );
  }

  return (
    <AnalyticsCard
      title="Unique Users Growth"
      description="Number of unique users who have submitted ratings"
      currentValue={summaries.uniqueUsers.current}
      percentChange={summaries.uniqueUsers.percentChange7d}
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
        title="Total Submissions"
        description="Cumulative number of rating submissions over time"
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
        title="Total Submissions"
        description="Cumulative number of rating submissions over time"
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, color: "var(--red-500)" }}>
          Error loading data
        </div>
      </AnalyticsCard>
    );
  }

  return (
    <AnalyticsCard
      title="Total Submissions"
      description="Cumulative number of rating submissions over time"
      currentValue={summaries.totalRatings.current}
      percentChange={summaries.totalRatings.percentChange7d}
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
        title="Courses with Ratings"
        description="Number of courses that have received at least one rating"
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
        title="Courses with Ratings"
        description="Number of courses that have received at least one rating"
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, color: "var(--red-500)" }}>
          Error loading data
        </div>
      </AnalyticsCard>
    );
  }

  return (
    <AnalyticsCard
      title="Courses with Ratings"
      description="Number of courses that have received at least one rating"
      currentValue={summaries.uniqueCourses.current}
      percentChange={summaries.uniqueCourses.percentChange7d}
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
        title="Ratings Distribution by Course"
        description="Size represents number of ratings"
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
        title="Ratings Distribution by Course"
        description="Size represents number of ratings"
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
      description={`Area equiv. ratings, grouped by subject (${totalSubjects} subjects)`}
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
