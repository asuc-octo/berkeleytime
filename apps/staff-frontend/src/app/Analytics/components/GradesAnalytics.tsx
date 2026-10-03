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
import { useGradesSessionUsersData } from "@/hooks/api";

import { AnalyticsCard, TimeRange } from "./AnalyticsCard";

// Helper to get time range in days
function getTimeRangeDays(timeRange: TimeRange): number {
  if (timeRange === "7d") return 7;
  if (timeRange === "90d") return 90;
  return 30;
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

// Grades Users Block - unique users who started a Grades session each day
export function GradesUsersBlock() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const days = getTimeRangeDays(timeRange);
  const { data, loading, error } = useGradesSessionUsersData(days);

  const chartData = useMemo(
    () =>
      (data?.dataPoints ?? []).map((dp) => ({
        ...dp,
        displayDate: formatDisplayDate(dp.date),
      })),
    [data]
  );

  const chartConfig = createChartConfig(["totalUsers"], {
    labels: { totalUsers: "Users" },
    colors: { totalUsers: "var(--heading-color)" },
  });

  if (loading) {
    return (
      <AnalyticsCard
        title="Grades Users"
        description="Unique users who added a course to Grades"
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

  if (error || !data) {
    return (
      <AnalyticsCard
        title="Grades Users"
        description="Unique users who added a course to Grades"
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
      title="Grades Users"
      description={`Unique users who added a course to Grades (${timeRange})`}
      currentValue={data.uniqueUsers}
      currentValueLabel="users"
      showTimeRangeSelector
      timeRange={timeRange}
      onTimeRangeChange={setTimeRange}
    >
      <ChartContainer config={chartConfig} style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient
                id="gradesUsersGradient"
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
              width={40}
              domain={[0, "auto"]}
              allowDecimals={false}
            />
            <ChartTooltip
              tooltipConfig={{
                valueFormatter: (value: number) =>
                  typeof value === "number" && Number.isFinite(value)
                    ? String(Math.round(value))
                    : "-",
              }}
            />
            <Area
              type="monotone"
              dataKey="totalUsers"
              stroke="var(--heading-color)"
              strokeWidth={2}
              fill="url(#gradesUsersGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    </AnalyticsCard>
  );
}
