import { useMemo, useState } from "react";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer } from "recharts";

import { LoadingIndicator } from "@repo/theme";

import {
  ChartContainer,
  ChartTooltip,
  createChartConfig,
} from "@/components/Chart";
import { useDeviceAnalyticsData } from "@/hooks/api";
import { DeviceCategoryCount, DeviceVendorCount } from "@/lib/api/analytics";

import { AnalyticsCard, TimeRange } from "./AnalyticsCard";

function getTimeRangeDays(timeRange: TimeRange): number {
  if (timeRange === "7d") return 7;
  if (timeRange === "90d") return 90;
  return 30;
}

const CATEGORY_COLORS: Record<string, string> = {
  Mobile: "var(--blue-500)",
  Computer: "var(--green-500)",
  TV: "var(--purple-500)",
  Other: "var(--amber-500)",
};

// Recharts pie tooltip entries nest the original datum differently across
// chart types, so resolve it defensively
function resolveDatum<T>(entry: { payload?: T & { payload?: T } }): T | null {
  if (!entry?.payload) return null;
  return (entry.payload.payload ?? entry.payload) as T;
}

function formatShare(users: number, total: number): string {
  if (total <= 0) return `${users}`;
  return `${users.toLocaleString()} (${Math.round((users / total) * 100)}%)`;
}

function CardState({ message }: { message?: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        color: message ? "var(--red-500)" : undefined,
      }}
    >
      {message ?? <LoadingIndicator />}
    </div>
  );
}

interface DeviceBlockProps {
  /** Scope to one feature's events (e.g. "grades"); omit for site-wide */
  targetType?: string;
  /** Feature name shown in the description, e.g. "Grades" */
  scopeLabel?: string;
}

// Devices Block - unique visitors by macro device category, with the
// per-vendor breakdown (Apple/Samsung/..., or OS for computers) on hover
export function DevicesBlock({ targetType, scopeLabel }: DeviceBlockProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const days = getTimeRangeDays(timeRange);
  const { data, loading, error } = useDeviceAnalyticsData(days, targetType);

  const chartData = useMemo(
    () =>
      (data?.devices ?? []).map((d) => ({
        ...d,
        fill: CATEGORY_COLORS[d.category] ?? "var(--label-color)",
      })),
    [data]
  );
  const sliceTotal = chartData.reduce((sum, d) => sum + d.users, 0);

  const chartConfig = createChartConfig(
    chartData.map((d) => d.category),
    {
      colors: Object.fromEntries(chartData.map((d) => [d.category, d.fill])),
    }
  );

  const description = scopeLabel
    ? `Unique ${scopeLabel} visitors by device type`
    : "Unique visitors by device type";

  if (loading) {
    return (
      <AnalyticsCard title="Devices" description={description}>
        <CardState />
      </AnalyticsCard>
    );
  }

  if (error || !data) {
    return (
      <AnalyticsCard title="Devices" description={description}>
        <CardState message="Error loading data" />
      </AnalyticsCard>
    );
  }

  return (
    <AnalyticsCard
      title="Devices"
      description={`${description} (${timeRange})`}
      currentValue={data.totalUsers}
      currentValueLabel="visitors"
      showTimeRangeSelector
      timeRange={timeRange}
      onTimeRangeChange={setTimeRange}
    >
      <ChartContainer config={chartConfig} style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="users"
              nameKey="category"
              innerRadius="50%"
              outerRadius="80%"
              paddingAngle={2}
              stroke="var(--background-color)"
              isAnimationActive={false}
            >
              {chartData.map((entry) => (
                <Cell key={entry.category} fill={entry.fill} />
              ))}
            </Pie>
            <ChartTooltip
              cursor={false}
              isAnimationActive={false}
              tooltipConfig={{
                hideLabel: true,
                valueFormatter: (value: number) =>
                  formatShare(value, sliceTotal),
                footer: (payload) => {
                  const datum = resolveDatum<DeviceCategoryCount>(payload?.[0]);
                  if (!datum?.vendors?.length) return null;
                  return (
                    <div style={{ fontSize: 12, color: "var(--label-color)" }}>
                      {datum.vendors.map((vendor: DeviceVendorCount) => (
                        <div
                          key={vendor.name}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 16,
                          }}
                        >
                          <span>{vendor.name}</span>
                          <span>{vendor.users.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  );
                },
              }}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(value: string) => (
                <span style={{ color: "var(--paragraph-color)", fontSize: 12 }}>
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    </AnalyticsCard>
  );
}
