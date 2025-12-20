import { useMemo } from "react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  createChartConfig,
} from "@/components/Chart";

import { useUserCreationAnalyticsData } from "@/hooks/api";

import { AnalyticsCard } from "./AnalyticsCard";

interface DailyDataPoint {
  date: string;
  dateKey: string;
  value: number;
}

// User Growth Block - accounts created in the last month (per day)
export function UserGrowthBlock() {
  const { data: rawData, loading, error } = useUserCreationAnalyticsData();

  const { dailyData, totalUsers, newLastMonth, percentGrowth } = useMemo(() => {
    if (!rawData || rawData.length === 0) {
      return { dailyData: [] as DailyDataPoint[], totalUsers: 0, newLastMonth: 0, percentGrowth: 0 };
    }

    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    // Get date 30 days ago
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Sort all users by creation time
    const sortedUsers = [...rawData].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // Count users created before the 30-day window (baseline)
    let cumulativeCount = 0;
    for (const user of sortedUsers) {
      if (new Date(user.createdAt) < thirtyDaysAgo) {
        cumulativeCount++;
      } else {
        break;
      }
    }
    const baselineCount = cumulativeCount;

    // Initialize all days in the last 30 days
    const dayMap = new Map<string, number>();
    for (let d = new Date(thirtyDaysAgo); d <= now; d.setDate(d.getDate() + 1)) {
      const dayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      dayMap.set(dayKey, 0);
    }

    // Count new users per day
    sortedUsers.forEach((point) => {
      const date = new Date(point.createdAt);
      if (date >= thirtyDaysAgo && date <= now) {
        const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        dayMap.set(dayKey, (dayMap.get(dayKey) || 0) + 1);
      }
    });

    // Convert to sorted array with cumulative values
    const sortedDays = Array.from(dayMap.keys()).sort();

    let cumulative = baselineCount;
    const dailyData: DailyDataPoint[] = sortedDays.map((dayKey) => {
      const [, month, day] = dayKey.split("-");
      const displayDate = `${monthNames[parseInt(month) - 1]} ${parseInt(day)}`;
      cumulative += dayMap.get(dayKey) || 0;
      return {
        date: displayDate,
        dateKey: dayKey,
        value: cumulative,
      };
    });

    const totalUsers = cumulative;
    const newLastMonth = totalUsers - baselineCount;
    const percentGrowth = baselineCount > 0 ? (newLastMonth / baselineCount) * 100 : 0;

    return { dailyData, totalUsers, newLastMonth, percentGrowth };
  }, [rawData]);

  const chartConfig = createChartConfig(["value"], {
    labels: { value: "Total Users" },
    colors: { value: "var(--heading-color)" },
  });

  if (loading) {
    return (
      <AnalyticsCard
        title="User Growth (30 days)"
        description="New accounts created per day"
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
        title="User Growth (30 days)"
        description="New accounts created per day"
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, color: "var(--red-500)" }}>
          Error loading data
        </div>
      </AnalyticsCard>
    );
  }

  return (
    <AnalyticsCard
      title="User Growth (30 days)"
      description="Cumulative user accounts"
      currentValue={totalUsers}
      currentValueLabel="users"
      absoluteChange={newLastMonth}
      percentChange={percentGrowth}
      changeTimescale="30d"
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
              tick={{ fill: "var(--label-color)", fontSize: 10 }}
              interval="preserveStartEnd"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--label-color)", fontSize: 12 }}
              width={40}
              domain={["dataMin", "dataMax"]}
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

// Signup Hour Histogram Block - count of signups by hour of day
export function SignupHourHistogramBlock() {
  const { data: rawData, loading, error } = useUserCreationAnalyticsData();

  const { hourlyData, peakHour, totalUsers } = useMemo(() => {
    if (!rawData || rawData.length === 0) {
      return { hourlyData: [], peakHour: null, totalUsers: 0 };
    }

    // Count signups per hour of day (0-23)
    const hourCounts = new Array(24).fill(0);

    rawData.forEach((point) => {
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

    const total = rawData.length;
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
      peakHour: { hour: peakHour, count: maxCount, label: formatHour(peakHour), percent: peakPercent },
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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
          Loading...
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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, color: "var(--red-500)" }}>
          Error loading data
        </div>
      </AnalyticsCard>
    );
  }

  return (
    <AnalyticsCard
      title="Signup Time Distribution"
      description="When users create accounts (hour of day)"
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
                labelFormatter: (_, payload) => payload?.[0]?.payload?.hourLabel || "",
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

// Daily Signups Block - signups per calendar day (last 30 days)
export function SignupDayHistogramBlock() {
  const { data: rawData, loading, error } = useUserCreationAnalyticsData();

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

    // Count signups per day (only last 30 days)
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

    // Calculate total signups in window and average
    const totalInWindow = dailyData.reduce((sum, d) => sum + d.value, 0);
    const avgPerDay = dailyData.length > 0 ? totalInWindow / dailyData.length : 0;

    return {
      dailyData,
      totalInWindow,
      avgPerDay,
    };
  }, [rawData]);

  const chartConfig = createChartConfig(["value"], {
    labels: { value: "Signups" },
    colors: { value: "var(--heading-color)" },
  });

  if (loading) {
    return (
      <AnalyticsCard
        title="Daily Signups (30 days)"
        description="Number of signups per day"
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
        title="Daily Signups (30 days)"
        description="Number of signups per day"
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, color: "var(--red-500)" }}>
          Error loading data
        </div>
      </AnalyticsCard>
    );
  }

  return (
    <AnalyticsCard
      title="Daily Signups (30 days)"
      description="Number of signups per day"
      currentValue={totalInWindow}
      currentValueLabel="signups"
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
