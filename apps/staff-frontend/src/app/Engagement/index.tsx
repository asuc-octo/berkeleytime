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
import { useTrackingEventsTimeSeries } from "@/hooks/api/tracking";

import {
  AnalyticsCard,
  TimeRange,
} from "../Analytics/components/AnalyticsCard";
import styles from "./Engagement.module.scss";

const MONTH_NAMES = [
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

function getTimeRangeDays(timeRange: TimeRange): number {
  if (timeRange === "7d") return 7;
  if (timeRange === "90d") return 90;
  return 30;
}

function formatDisplayDate(dateKey: string): string {
  const [, month, day] = dateKey.split("-").map(Number);
  return `${MONTH_NAMES[month - 1]} ${day}`;
}

interface EventCardProps {
  title: string;
  description: string;
  /** Tracking event type, e.g. "schedule_saved" */
  eventType: string;
  /** Tracking target type; the staff query skips unless this is set */
  targetType: string;
  /** Unit shown next to the headline number, e.g. "saved" */
  valueLabel: string;
}

function EventCard({
  title,
  description,
  eventType,
  targetType,
  valueLabel,
}: EventCardProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");

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
  } = useTrackingEventsTimeSeries({
    eventType,
    targetType,
    startDate: startDateStr,
    endDate: endDateStr,
  });

  // Fill every day in the range so gaps read as zero rather than disappearing
  const chartData = useMemo(() => {
    const countByDate = new Map<string, number>();

    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      countByDate.set(d.toISOString().slice(0, 10), 0);
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

  const total = useMemo(
    () => chartData.reduce((sum, point) => sum + point.count, 0),
    [chartData]
  );

  const chartConfig = createChartConfig(["count"], {
    labels: { count: title },
    colors: { count: "var(--heading-color)" },
  });

  return (
    <AnalyticsCard
      title={title}
      description={`${description} (${timeRange})`}
      currentValue={total}
      currentValueLabel={valueLabel}
      showTimeRangeSelector
      timeRange={timeRange}
      onTimeRangeChange={(value) => setTimeRange(value)}
    >
      {loading && (
        <div className={styles.state}>
          <LoadingIndicator />
        </div>
      )}

      {!loading && error && (
        <div className={`${styles.state} ${styles.error}`}>
          Error loading data
        </div>
      )}

      {!loading && !error && (
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

const SECTIONS: { title: string; cards: EventCardProps[] }[] = [
  {
    title: "Schedules",
    cards: [
      {
        title: "Schedules saved",
        description:
          "New schedules created from the schedules page, a clone, or a class page",
        eventType: "schedule_saved",
        targetType: "schedule",
        valueLabel: "saved",
      },
      {
        title: "Schedules generated",
        description: "Times the schedule generator produced combinations",
        eventType: "schedule_generate",
        targetType: "schedule",
        valueLabel: "generated",
      },
    ],
  },
  {
    title: "Course discovery",
    cards: [
      {
        title: "Course results clicked",
        description: "Classes opened from the catalog results list",
        eventType: "course_result_clicked",
        targetType: "class",
        valueLabel: "clicks",
      },
      {
        title: "Search filters applied",
        description:
          "Catalog filter changes (sort, level, requirements, units, and more)",
        eventType: "search_filter_applied",
        targetType: "catalog_filter",
        valueLabel: "applied",
      },
    ],
  },
  {
    title: "Reliability",
    cards: [
      {
        title: "Page errors",
        description: "Catalog render crashes caught by the error boundary",
        eventType: "page_error",
        targetType: "course-discovery",
        valueLabel: "errors",
      },
      {
        title: "Data load failures",
        description: "Class details that failed to load in the catalog",
        eventType: "data_load_failed",
        targetType: "course-discovery",
        valueLabel: "failures",
      },
      {
        title: "Search failures",
        description:
          "Catalog or course searches that errored, as opposed to returning no results",
        eventType: "search_failed",
        targetType: "course-discovery",
        valueLabel: "failures",
      },
    ],
  },
];

export default function Engagement() {
  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <h1 className={styles.title}>Engagement</h1>
        <p className={styles.subtitle}>
          Schedule, course discovery, and reliability activity from unified
          tracking. Counts start from the day each event ships — earlier
          activity can be backfilled later.
        </p>
      </div>

      {SECTIONS.map((section) => (
        <section key={section.title} className={styles.section}>
          <h2 className={styles.sectionTitle}>{section.title}</h2>
          <div className={styles.grid}>
            {section.cards.map((card) => (
              <div key={card.eventType} className={styles.cell}>
                <EventCard {...card} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
