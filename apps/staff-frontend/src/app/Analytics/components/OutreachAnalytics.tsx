import { useMemo, useState } from "react";

import {
  CartesianGrid,
  Line,
  LineChart,
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
import { useClickEventsTimeSeries } from "@/hooks/api/click-tracking";
import { useAllRouteRedirects } from "@/hooks/api/route-redirect";

import { AnalyticsCard, TimeRange } from "./AnalyticsCard";

const APPLY_NOW_REDIRECT_FROM_PATH = "/about-mechanize";

function getTimeRangeDays(timeRange: TimeRange): number {
  if (timeRange === "7d") return 7;
  if (timeRange === "90d") return 90;
  return 30;
}

function formatDisplayDate(dateKey: string): string {
  const [, m, d] = dateKey.split("-").map(Number);
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${monthNames[m - 1]} ${d}`;
}

export function OutreachPanelBlock() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const { data: redirects } = useAllRouteRedirects();
  const applyNowRedirect = useMemo(
    () => redirects.find((r) => r.fromPath === APPLY_NOW_REDIRECT_FROM_PATH),
    [redirects]
  );

  const days = getTimeRangeDays(timeRange);
  const endDate = useMemo(() => new Date(), []);
  const startDate = useMemo(() => {
    const d = new Date(endDate);
    d.setDate(d.getDate() - days);
    return d;
  }, [endDate, days]);

  const startDateStr = startDate.toISOString().slice(0, 10);
  const endDateStr = endDate.toISOString().slice(0, 10);

  const {
    data: seriesData,
    loading,
    error,
  } = useClickEventsTimeSeries({
    targetId: applyNowRedirect?.id ?? null,
    targetType: "redirect",
    startDate: startDateStr,
    endDate: endDateStr,
  });

  const chartData = useMemo(() => {
    const countByDate = new Map<string, number>();
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().slice(0, 10);
      countByDate.set(key, 0);
    }
    for (const point of seriesData) {
      countByDate.set(point.date, point.count);
    }
    return Array.from(countByDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dateKey, count]) => ({
        dateKey,
        date: formatDisplayDate(dateKey),
        count,
      }));
  }, [seriesData, startDate, endDate]);

  const totalClicks = useMemo(
    () => chartData.reduce((sum, p) => sum + p.count, 0),
    [chartData]
  );

  const chartConfig = createChartConfig(["count"], {
    labels: { count: "Clicks" },
    colors: { count: "var(--heading-color)" },
  });

  if (!applyNowRedirect) {
    return (
      <AnalyticsCard
        title="Apply Now clicks"
        description="Mechanize apply now link (route redirect)"
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            color: "var(--label-color)",
          }}
        >
          Redirect not found. Ensure /about-mechanize is configured in Outreach.
        </div>
      </AnalyticsCard>
    );
  }

  if (loading) {
    return (
      <AnalyticsCard
        title="Apply Now clicks"
        description="Mechanize apply now link (route redirect)"
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
        title="Apply Now clicks"
        description="Mechanize apply now link (route redirect)"
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
      title="Apply Now clicks"
      description={`Mechanize apply now link (${timeRange})`}
      currentValue={totalClicks}
      currentValueLabel="clicks"
      showTimeRangeSelector
      timeRange={timeRange}
      onTimeRangeChange={(val) => setTimeRange(val)}
    >
      <ChartContainer config={chartConfig} style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
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
              domain={[0, "auto"]}
            />
            <ChartTooltip
              tooltipConfig={{
                valueFormatter: (value: number) =>
                  typeof value === "number" && Number.isFinite(value)
                    ? String(Math.round(value))
                    : "-",
              }}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="var(--heading-color)"
              strokeWidth={2}
              dot={false}
              connectNulls
              activeDot={{ r: 4, fill: "var(--heading-color)" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </AnalyticsCard>
  );
}
