import { useMemo, useState } from "react";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import { LoadingIndicator, Select } from "@repo/theme";
import type { Option } from "@repo/theme";

import {
  ChartContainer,
  ChartTooltip,
  createChartConfig,
} from "@/components/Chart";
import { useAllBanners } from "@/hooks/api/banner";
import { useClickEventsTimeSeries } from "@/hooks/api/click-tracking";
import { useAllRouteRedirects } from "@/hooks/api/route-redirect";
import { useAllTargetedMessages } from "@/hooks/api/targeted-message";

import { AnalyticsCard, TimeRange } from "./AnalyticsCard";

type ClickTargetType = "banner" | "redirect" | "targeted-message";

interface SelectedTarget {
  targetType: ClickTargetType;
  targetId: string;
  /** Short label for trigger and card (e.g. path, title, or truncated text) */
  label: string;
  /** Optional type prefix for card description, e.g. "Redirect", "Banner", "Targeted ad" */
  typeLabel: string;
}

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

function encodeTargetValue(targetType: ClickTargetType, targetId: string): string {
  return `${targetType}:${targetId}`;
}

function parseTargetValue(
  value: string
): { targetType: ClickTargetType; targetId: string } | null {
  const [targetType, targetId] = value.split(":");
  if (
    targetType &&
    targetId &&
    (targetType === "banner" ||
      targetType === "redirect" ||
      targetType === "targeted-message")
  ) {
    return { targetType: targetType as ClickTargetType, targetId };
  }
  return null;
}

export function OutreachPanelBlock() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [selectedValue, setSelectedValue] = useState<string>("");

  const { data: redirects } = useAllRouteRedirects();
  const { data: banners } = useAllBanners();
  const { data: targetedMessages } = useAllTargetedMessages();

  const { targetOptions, targetOptionByValue } = useMemo(() => {
    const flat: Array<{
      value: string;
      label: string;
      meta?: string;
      typeLabel: string;
    }> = [];

    const options: Option<string>[] = [];

    if (redirects?.length) {
      options.push({ type: "label", label: "Redirects" });
      for (const r of redirects) {
        const value = encodeTargetValue("redirect", r.id);
        const label = r.fromPath;
        const meta = r.toPath.length > 50 ? `${r.toPath.slice(0, 50)}…` : r.toPath;
        flat.push({ value, label, meta, typeLabel: "Redirect" });
        options.push({ value, label, meta });
      }
    }

    if (banners?.length) {
      options.push({ type: "label", label: "Banners" });
      for (const b of banners) {
        const value = encodeTargetValue("banner", b.id);
        const label =
          b.text.length > 35 ? `${b.text.slice(0, 35).trim()}…` : b.text;
        flat.push({ value, label, typeLabel: "Banner" });
        options.push({ value, label });
      }
    }

    if (targetedMessages?.length) {
      options.push({ type: "label", label: "Targeted ads" });
      for (const m of targetedMessages) {
        const value = encodeTargetValue("targeted-message", m.id);
        flat.push({ value, label: m.title, typeLabel: "Targeted ad" });
        options.push({ value, label: m.title });
      }
    }

    const targetOptionByValue = new Map(
      flat.map((o) => [o.value, { label: o.label, typeLabel: o.typeLabel }])
    );
    return { targetOptions: options, targetOptionByValue };
  }, [redirects, banners, targetedMessages]);

  const selectedTarget: SelectedTarget | null = useMemo(() => {
    const parsed = selectedValue ? parseTargetValue(selectedValue) : null;
    if (!parsed) return null;
    const info = targetOptionByValue.get(selectedValue);
    if (!info) return null;
    return {
      targetType: parsed.targetType,
      targetId: parsed.targetId,
      label: info.label,
      typeLabel: info.typeLabel,
    };
  }, [selectedValue, targetOptionByValue]);

  const days = getTimeRangeDays(timeRange);
  const endDate = useMemo(() => new Date(), []);
  const startDate = useMemo(() => {
    const d = new Date(endDate);
    d.setDate(d.getDate() - days);
    return d;
  }, [endDate, days]);

  const startDateStr = startDate.toISOString().slice(0, 10);
  const endOfEndDate = new Date(endDate);
  endOfEndDate.setHours(23, 59, 59, 999);
  const endDateStr = endOfEndDate.toISOString();

  const {
    data: seriesData,
    loading,
    error,
  } = useClickEventsTimeSeries({
    targetId: selectedTarget?.targetId ?? null,
    targetType: selectedTarget?.targetType ?? "redirect",
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

  const targetSelect = (
    <Select
      value={selectedValue}
      onChange={(val) =>
        setSelectedValue(Array.isArray(val) ? val[0] ?? "" : val ?? "")
      }
      options={[
        { value: "", label: "Select banner / link / ad…" },
        ...targetOptions,
      ]}
      placeholder="Select banner / link / ad…"
      style={{
        width: "100%",
        maxWidth: 320,
        minHeight: 24,
        height: 24,
        padding: "0 8px",
        fontSize: 12,
      }}
    />
  );

  const loadingState = selectedTarget && loading;
  const errorState = selectedTarget && error;

  return (
    <AnalyticsCard
      title="Outreach click analytics"
      description={
        selectedTarget
          ? `${selectedTarget.typeLabel} · ${selectedTarget.label} (${timeRange})`
          : "Choose a banner, redirect, or targeted ad to view click stats"
      }
      currentValue={selectedTarget ? totalClicks : undefined}
      currentValueLabel={selectedTarget ? "clicks" : undefined}
      showTimeRangeSelector
      timeRange={timeRange}
      onTimeRangeChange={(val) => setTimeRange(val)}
      customControls={
        <>
          <span style={{ fontSize: 12, color: "var(--label-color)" }}>
            Target
          </span>
          {targetSelect}
        </>
      }
    >
      {!selectedTarget && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            color: "var(--label-color)",
            minHeight: 200,
          }}
        >
          Select a banner, redirect, or targeted ad above to see click stats.
        </div>
      )}

      {selectedTarget && loadingState && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            minHeight: 200,
          }}
        >
          <LoadingIndicator />
        </div>
      )}

      {selectedTarget && errorState && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            color: "var(--red-500)",
            minHeight: 200,
          }}
        >
          Error loading data
        </div>
      )}

      {selectedTarget && !loadingState && !errorState && (
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
      )}
    </AnalyticsCard>
  );
}
