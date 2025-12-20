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

import { useCollectionAnalyticsData } from "@/hooks/api";

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

// Users with Bookmarks Block - cumulative users who have saved classes (30 days)
export function UsersWithBookmarksBlock() {
  const { data, loading, error } = useCollectionAnalyticsData();

  const { dailyData, summaries } = useMemo(() => {
    if (!data || data.collectionCreations.length === 0) {
      return {
        dailyData: [] as DailyDataPoint[],
        summaries: { current: 0, absoluteChange: 0, percentChange: 0 },
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
    const sortedData = [...data.collectionCreations].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // Count baseline (users who created collections before the 30-day window)
    let baselineCount = 0;
    sortedData.forEach((point) => {
      const date = new Date(point.createdAt);
      if (date < thirtyDaysAgo) {
        baselineCount++;
      }
    });

    // Initialize all days in the last 30 days
    const dailyNewUsers = new Map<string, number>();
    for (let d = new Date(thirtyDaysAgo); d <= now; d.setDate(d.getDate() + 1)) {
      const dayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      dailyNewUsers.set(dayKey, 0);
    }

    // Count new users per day within the window
    sortedData.forEach((point) => {
      const date = new Date(point.createdAt);
      if (date >= thirtyDaysAgo && date <= now) {
        const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        dailyNewUsers.set(dayKey, (dailyNewUsers.get(dayKey) || 0) + 1);
      }
    });

    // Convert to sorted array and compute cumulative values
    const sortedDays = Array.from(dailyNewUsers.keys()).sort();

    let cumulativeCount = baselineCount;
    const dailyData: DailyDataPoint[] = sortedDays.map((dayKey) => {
      const [, month, day] = dayKey.split("-");
      const displayDate = `${monthNames[parseInt(month) - 1]} ${parseInt(day)}`;

      cumulativeCount += dailyNewUsers.get(dayKey) || 0;
      return { date: displayDate, dateKey: dayKey, value: cumulativeCount };
    });

    // Calculate 30-day change
    const calcChange = (data: DailyDataPoint[]): MetricSummary => {
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
      dailyData,
      summaries: calcChange(dailyData),
    };
  }, [data]);

  const chartConfig = createChartConfig(["value"], {
    labels: { value: "Users with Bookmarks" },
    colors: { value: "var(--heading-color)" },
  });

  if (loading) {
    return (
      <AnalyticsCard
        title="Bookmark Users"
        description="Users with saved classes (30d)"
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
        title="Bookmark Users"
        description="Users with saved classes (30d)"
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, color: "var(--red-500)" }}>
          Error loading data
        </div>
      </AnalyticsCard>
    );
  }

  return (
    <AnalyticsCard
      title="Bookmark Users"
      description="Users with saved classes (30d)"
      currentValue={summaries.current}
      currentValueLabel="users"
      absoluteChange={summaries.absoluteChange}
      percentChange={summaries.percentChange}
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

// Daily Bookmarks Block - classes bookmarked per day (30 days)
export function DailyBookmarksBlock() {
  const { data, loading, error } = useCollectionAnalyticsData();

  const { dailyData, totalInWindow, avgPerDay } = useMemo(() => {
    if (!data || data.classAdditions.length === 0) {
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

    // Count classes saved per day (only last 30 days)
    data.classAdditions.forEach((point) => {
      const date = new Date(point.addedAt);
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

    // Calculate total classes saved in window and average
    const totalInWindow = dailyData.reduce((sum, d) => sum + d.value, 0);
    const avgPerDay = dailyData.length > 0 ? totalInWindow / dailyData.length : 0;

    return {
      dailyData,
      totalInWindow,
      avgPerDay,
    };
  }, [data]);

  const chartConfig = createChartConfig(["value"], {
    labels: { value: "Bookmarks" },
    colors: { value: "var(--heading-color)" },
  });

  if (loading) {
    return (
      <AnalyticsCard
        title="Daily Bookmarks"
        description="Classes bookmarked per day (30d)"
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
        title="Daily Bookmarks"
        description="Classes bookmarked per day (30d)"
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, color: "var(--red-500)" }}>
          Error loading data
        </div>
      </AnalyticsCard>
    );
  }

  return (
    <AnalyticsCard
      title="Daily Bookmarks"
      description="Classes bookmarked per day (30d)"
      currentValue={totalInWindow}
      currentValueLabel="bookmarks"
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

// Total Bookmarks Block - cumulative classes bookmarked over time (30 days)
export function TotalBookmarksBlock() {
  const { data, loading, error } = useCollectionAnalyticsData();

  const { dailyData, summaries } = useMemo(() => {
    if (!data || data.classAdditions.length === 0) {
      return {
        dailyData: [] as DailyDataPoint[],
        summaries: { current: 0, absoluteChange: 0, percentChange: 0 },
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
    const sortedData = [...data.classAdditions].sort(
      (a, b) =>
        new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime()
    );

    // Count baseline (classes added before the 30-day window)
    let baselineCount = 0;
    sortedData.forEach((point) => {
      const date = new Date(point.addedAt);
      if (date < thirtyDaysAgo) {
        baselineCount++;
      }
    });

    // Initialize all days in the last 30 days
    const dailyAdditions = new Map<string, number>();
    for (let d = new Date(thirtyDaysAgo); d <= now; d.setDate(d.getDate() + 1)) {
      const dayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      dailyAdditions.set(dayKey, 0);
    }

    // Count classes saved per day within the window
    sortedData.forEach((point) => {
      const date = new Date(point.addedAt);
      if (date >= thirtyDaysAgo && date <= now) {
        const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        dailyAdditions.set(dayKey, (dailyAdditions.get(dayKey) || 0) + 1);
      }
    });

    // Convert to sorted array and compute cumulative values
    const sortedDays = Array.from(dailyAdditions.keys()).sort();

    let cumulativeCount = baselineCount;
    const dailyData: DailyDataPoint[] = sortedDays.map((dayKey) => {
      const [, month, day] = dayKey.split("-");
      const displayDate = `${monthNames[parseInt(month) - 1]} ${parseInt(day)}`;

      cumulativeCount += dailyAdditions.get(dayKey) || 0;
      return { date: displayDate, dateKey: dayKey, value: cumulativeCount };
    });

    // Calculate 30-day change
    const calcChange = (data: DailyDataPoint[]): MetricSummary => {
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
      dailyData,
      summaries: calcChange(dailyData),
    };
  }, [data]);

  const chartConfig = createChartConfig(["value"], {
    labels: { value: "Total Bookmarks" },
    colors: { value: "var(--heading-color)" },
  });

  if (loading) {
    return (
      <AnalyticsCard
        title="Total Bookmarks"
        description="Cumulative classes bookmarked (30d)"
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
        title="Total Bookmarks"
        description="Cumulative classes bookmarked (30d)"
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, color: "var(--red-500)" }}>
          Error loading data
        </div>
      </AnalyticsCard>
    );
  }

  return (
    <AnalyticsCard
      title="Total Bookmarks"
      description="Cumulative classes bookmarked (30d)"
      currentValue={summaries.current}
      currentValueLabel="bookmarks"
      absoluteChange={summaries.absoluteChange}
      percentChange={summaries.percentChange}
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

// Custom Collections Block - cumulative user-created collections over time (30 days)
export function CustomCollectionsBlock() {
  const { data, loading, error } = useCollectionAnalyticsData();

  const { dailyData, summaries } = useMemo(() => {
    if (!data || data.customCollectionCreations.length === 0) {
      return {
        dailyData: [] as DailyDataPoint[],
        summaries: { current: 0, absoluteChange: 0, percentChange: 0 },
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
    const sortedData = [...data.customCollectionCreations].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // Count baseline (collections created before the 30-day window)
    let baselineCount = 0;
    sortedData.forEach((point) => {
      const date = new Date(point.createdAt);
      if (date < thirtyDaysAgo) {
        baselineCount++;
      }
    });

    // Initialize all days in the last 30 days
    const dailyNew = new Map<string, number>();
    for (let d = new Date(thirtyDaysAgo); d <= now; d.setDate(d.getDate() + 1)) {
      const dayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      dailyNew.set(dayKey, 0);
    }

    // Count new collections per day within the window
    sortedData.forEach((point) => {
      const date = new Date(point.createdAt);
      if (date >= thirtyDaysAgo && date <= now) {
        const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        dailyNew.set(dayKey, (dailyNew.get(dayKey) || 0) + 1);
      }
    });

    // Convert to sorted array and compute cumulative values
    const sortedDays = Array.from(dailyNew.keys()).sort();

    let cumulativeCount = baselineCount;
    const dailyData: DailyDataPoint[] = sortedDays.map((dayKey) => {
      const [, month, day] = dayKey.split("-");
      const displayDate = `${monthNames[parseInt(month) - 1]} ${parseInt(day)}`;

      cumulativeCount += dailyNew.get(dayKey) || 0;
      return { date: displayDate, dateKey: dayKey, value: cumulativeCount };
    });

    // Calculate 30-day change
    const calcChange = (data: DailyDataPoint[]): MetricSummary => {
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
      dailyData,
      summaries: calcChange(dailyData),
    };
  }, [data]);

  const chartConfig = createChartConfig(["value"], {
    labels: { value: "Custom Collections" },
    colors: { value: "var(--heading-color)" },
  });

  if (loading) {
    return (
      <AnalyticsCard
        title="Custom Collections"
        description="User-created collections (30d)"
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
        title="Custom Collections"
        description="User-created collections (30d)"
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, color: "var(--red-500)" }}>
          Error loading data
        </div>
      </AnalyticsCard>
    );
  }

  return (
    <AnalyticsCard
      title="Custom Collections"
      description="User-created collections (30d)"
      currentValue={summaries.current}
      currentValueLabel="collections"
      percentChange={summaries.percentChange}
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

// Users with Custom Collections Block - unique users who have created custom collections (30 days)
export function UsersWithCustomCollectionsBlock() {
  const { data, loading, error } = useCollectionAnalyticsData();

  const { dailyData, summaries } = useMemo(() => {
    if (!data || data.usersWithCustomCollections.length === 0) {
      return {
        dailyData: [] as DailyDataPoint[],
        summaries: { current: 0, absoluteChange: 0, percentChange: 0 },
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
    const sortedData = [...data.usersWithCustomCollections].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // Count baseline (users before the 30-day window)
    let baselineCount = 0;
    sortedData.forEach((point) => {
      const date = new Date(point.createdAt);
      if (date < thirtyDaysAgo) {
        baselineCount++;
      }
    });

    // Initialize all days in the last 30 days
    const dailyNew = new Map<string, number>();
    for (let d = new Date(thirtyDaysAgo); d <= now; d.setDate(d.getDate() + 1)) {
      const dayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      dailyNew.set(dayKey, 0);
    }

    // Count new users per day within the window
    sortedData.forEach((point) => {
      const date = new Date(point.createdAt);
      if (date >= thirtyDaysAgo && date <= now) {
        const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        dailyNew.set(dayKey, (dailyNew.get(dayKey) || 0) + 1);
      }
    });

    // Convert to sorted array and compute cumulative values
    const sortedDays = Array.from(dailyNew.keys()).sort();

    let cumulativeCount = baselineCount;
    const dailyData: DailyDataPoint[] = sortedDays.map((dayKey) => {
      const [, month, day] = dayKey.split("-");
      const displayDate = `${monthNames[parseInt(month) - 1]} ${parseInt(day)}`;

      cumulativeCount += dailyNew.get(dayKey) || 0;
      return { date: displayDate, dateKey: dayKey, value: cumulativeCount };
    });

    // Calculate 30-day change
    const calcChange = (data: DailyDataPoint[]): MetricSummary => {
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
      dailyData,
      summaries: calcChange(dailyData),
    };
  }, [data]);

  const chartConfig = createChartConfig(["value"], {
    labels: { value: "Users" },
    colors: { value: "var(--heading-color)" },
  });

  if (loading) {
    return (
      <AnalyticsCard
        title="Collection Users"
        description="Unique users who created collections (30d)"
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
        title="Collection Users"
        description="Unique users who created collections (30d)"
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, color: "var(--red-500)" }}>
          Error loading data
        </div>
      </AnalyticsCard>
    );
  }

  return (
    <AnalyticsCard
      title="Collection Users"
      description="Unique users who created collections (30d)"
      currentValue={summaries.current}
      currentValueLabel="users"
      percentChange={summaries.percentChange}
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
