import { useMemo } from "react";

import { GraphUp } from "iconoir-react";
import moment from "moment";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  createChartConfig,
  formatters,
} from "@/components/Chart";
import ClassChartBox from "@/components/Class/ClassChartBox";
import { useGetClassEnrollment } from "@/hooks/api/classes/useGetClass";
import useClass from "@/hooks/useClass";

import styles from "./Enrollment.module.scss";

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "America/Los_Angeles",
});

const chartConfig = createChartConfig(["enrolled"], {
  labels: { enrolled: "Enrolled" },
  colors: { enrolled: "var(--blue-500)" },
});
const ACTIVITY_THRESHOLD_PERCENT = 5;

export default function Enrollment() {
  const { class: _class } = useClass();
  const { data: enrollmentData, loading } = useGetClassEnrollment(
    _class.year,
    _class.semester,
    _class.sessionId,
    _class.subject,
    _class.courseNumber,
    _class.number
  );

  const history = enrollmentData?.primarySection?.enrollment?.history ?? [];

  const data = useMemo(() => {
    if (history.length === 0) return [];

    const firstTime = moment(history[0].startTime).startOf("minute");
    const maxEnrollHistory = history.map(
      (enrollment) => enrollment.maxEnroll ?? 0
    );
    const maxEnrollMax = Math.max(...maxEnrollHistory);
    const lastMaxEnroll = history[history.length - 1].maxEnroll ?? 0;
    const validMaxEnroll =
      maxEnrollMax > 0 ? (lastMaxEnroll > 0 ? lastMaxEnroll : maxEnrollMax) : 0;

    const timeToEnrollmentMap = new Map<
      number,
      { enrolledPercent: number | null }
    >();

    for (const enrollment of history) {
      const start = moment(enrollment.startTime).startOf("minute");
      const end = moment(enrollment.endTime).startOf("minute");
      const granularity = enrollment.granularitySeconds;

      for (
        let cur = start.clone();
        !cur.isAfter(end);
        cur.add(granularity, "seconds")
      ) {
        const timeDelta = moment.duration(cur.diff(firstTime)).asMinutes();

        timeToEnrollmentMap.set(timeDelta, {
          enrolledPercent:
            validMaxEnroll > 0
              ? (enrollment.enrolledCount / validMaxEnroll) * 100
              : null,
        });
      }
    }

    const sortedData = Array.from(timeToEnrollmentMap.entries())
      .map(([timeDelta, values]) => ({
        timeDelta,
        enrolled: values.enrolledPercent,
      }))
      .sort((a, b) => a.timeDelta - b.timeDelta);
    return sortedData;
  }, [history]);

  const dataMax = useMemo(() => {
    if (data.length === 0) return 0;
    const maxValue = data.reduce(
      (acc, point) => Math.max(acc, point.enrolled ?? 0),
      0
    );

    return maxValue * 1.2;
  }, [data]);

  const hasEnrolledActivity = useMemo(
    () =>
      data.some((point) => (point.enrolled ?? 0) > ACTIVITY_THRESHOLD_PERCENT),
    [data]
  );

  const enrollmentExplorerUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set(
      "input",
      `${_class.subject};${_class.courseNumber};T;${_class.year}:${_class.semester};${_class.number}`
    );

    if (typeof window !== "undefined") {
      try {
        const url = new URL(window.location.origin);
        url.pathname = "/enrollment";
        url.search = params.toString();
        return url.toString();
      } catch {
        // ignore and fall back
      }
    }

    return `/enrollment?${params.toString()}`;
  }, [
    _class.subject,
    _class.courseNumber,
    _class.year,
    _class.semester,
    _class.number,
  ]);

  const emptyState = useMemo(() => {
    if (data.length === 0) {
      return {
        icon: <GraphUp width={32} height={32} />,
        heading: "No Enrollment Data Available",
        paragraph: (
          <>
            This class doesn&apos;t have enrollment history data yet.
            <br />
            Enrollment trends will appear here once data is available.
          </>
        ),
      };
    }
    if (!hasEnrolledActivity) {
      return {
        icon: <GraphUp width={32} height={32} />,
        heading: "No Enrollment Activity Available",
        paragraph:
          "Enrollment history exists for this class, but no enrolled activity was recorded.",
      };
    }
    return undefined;
  }, [data.length, hasEnrolledActivity]);

  return (
    <ClassChartBox
      title="Enrollment History"
      subtitle={`${_class.semester} ${_class.year}`}
      actionLabel="Open in Enrollment"
      actionHref={enrollmentExplorerUrl}
      loading={loading && !enrollmentData}
      emptyState={emptyState}
    >
      <div className={styles.chart}>
        <ChartContainer
          config={chartConfig}
          className={styles.chartContainer}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              width={730}
              height={450}
              data={data}
              margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--border-color)"
              />
              <XAxis
                dataKey="timeDelta"
                type="number"
                stroke="var(--label-color)"
                tickMargin={8}
                tick={{
                  fill: "var(--paragraph-color)",
                  fontSize: "var(--text-14)",
                }}
                tickFormatter={(timeDelta) =>
                  String(
                    Math.floor(
                      moment
                        .duration(timeDelta as number, "minutes")
                        .asDays()
                    ) + 1
                  )
                }
              />
              <YAxis
                stroke="var(--label-color)"
                tickFormatter={(v) => formatters.percentRound(v)}
                tick={{
                  fill: "var(--paragraph-color)",
                  fontSize: "var(--text-14)",
                }}
                domain={[0, dataMax || 100]}
              />
              <ChartTooltip
                tooltipConfig={{
                  labelFormatter: (label) => {
                    const duration = moment.duration(label, "minutes");
                    const day = Math.floor(duration.asDays()) + 1;
                    const time = timeFormatter.format(
                      moment.utc(0).add(duration).toDate()
                    );
                    return `Day ${day} ${time}`;
                  },
                  valueFormatter: (value) => formatters.percentRound(value),
                  indicator: "line",
                }}
              />
              <ReferenceLine
                y={100}
                stroke="var(--label-color)"
                strokeDasharray="5 5"
                strokeOpacity={0.5}
                label={{
                  value: "100% Capacity",
                  position: "insideTopLeft",
                  fill: "var(--paragraph-color)",
                  fontSize: "var(--text-14)",
                  offset: 10,
                }}
              />
              {hasEnrolledActivity && (
                <Line
                  type="monotone"
                  dataKey="enrolled"
                  stroke="var(--blue-500)"
                  dot={false}
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  name="enrolled"
                  connectNulls
                  isAnimationActive={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
        <p className={styles.axisLabel}>Days since enrollment opened</p>
      </div>
    </ClassChartBox>
  );
}
