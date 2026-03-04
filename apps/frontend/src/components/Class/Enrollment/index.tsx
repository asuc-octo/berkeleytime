import { useMemo, useRef } from "react";

import { GraphUp } from "iconoir-react";
import moment from "moment";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ColoredSquare } from "@repo/theme";

import {
  CapacityChangeMarker,
  ChartContainer,
  createChartConfig,
  formatters,
  useCapacityChangeTooltip,
} from "@/components/Chart";
import ClassChartBox from "@/components/Class/ClassChartBox";
import { useGetClassEnrollment } from "@/hooks/api/classes/useGetClass";
import { useReadEnrollmentTimeframes } from "@/hooks/api/enrollment";
import useClass from "@/hooks/useClass";

import type {
  CapacityChangeEvent,
  EnrollmentPoint,
} from "@/app/Enrollment/EnrollmentGraph.utils";
import {
  compressPlateaus,
  getCapacityChangeEvents,
  getCapacityChangeTimeDeltas,
  getTimeDeltaKey,
  interpolateEnrollmentPoint,
} from "@/app/Enrollment/EnrollmentGraph.utils";

import styles from "./Enrollment.module.scss";

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "America/Los_Angeles",
});

const TOOLTIP_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "2-digit",
  day: "2-digit",
  year: "2-digit",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "America/Los_Angeles",
});

const GROUP_LABELS: Record<string, string> = {
  continuing: "Continuing Students",
  new_transfer: "New Transfer Students",
  new_freshman: "New Freshman Students",
  new_graduate: "New Graduate Students",
  new_student: "New Students",
  all: "All Students",
};

interface PhaseLine {
  timeDelta: number;
  label: string;
  key: string;
}

const chartConfig = createChartConfig(["enrolled"], {
  labels: { enrolled: "Enrolled" },
  colors: { enrolled: "var(--blue-500)" },
});
const ACTIVITY_THRESHOLD_PERCENT = 5;

const getValidDenominator = (values: number[]) => {
  const maxSeen = Math.max(...values, 0);
  if (maxSeen === 0) return 0;

  const lastValue = values[values.length - 1] ?? 0;
  return lastValue > 0 ? lastValue : maxSeen;
};

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

  const chartRef = useRef<HTMLDivElement>(null);
  const {
    show: showCapacityTooltip,
    hide: hideCapacityTooltip,
    element: capacityTooltipElement,
  } = useCapacityChangeTooltip(chartRef);

  const history = enrollmentData?.primarySection?.enrollment?.history ?? [];

  const data = useMemo(() => {
    if (history.length === 0) return [];

    const firstTime = moment(history[0].startTime).startOf("minute");
    const maxEnrollDenominator = getValidDenominator(
      history.map((entry) => entry.maxEnroll ?? 0)
    );

    const map = new Map<number, EnrollmentPoint>();

    for (const entry of history) {
      const start = moment(entry.startTime).startOf("minute");
      const end = moment(entry.endTime).startOf("minute");
      const granularitySeconds = Math.max(entry.granularitySeconds ?? 60, 60);

      for (
        let cursor = start.clone();
        !cursor.isAfter(end);
        cursor.add(granularitySeconds, "seconds")
      ) {
        const timeDelta = moment.duration(cursor.diff(firstTime)).asMinutes();
        const maxEnroll = entry.maxEnroll ?? 0;

        map.set(timeDelta, {
          enrolledCount: entry.enrolledCount ?? 0,
          enrolledPercent:
            maxEnrollDenominator > 0
              ? (entry.enrolledCount / maxEnrollDenominator) * 100
              : null,
          capacityCount: maxEnroll,
          capacityPercent:
            maxEnrollDenominator > 0
              ? (maxEnroll / maxEnrollDenominator) * 100
              : null,
        });
      }
    }

    const sortedEntries = Array.from(map.entries()).sort(
      (a, b) => a[0] - b[0]
    );
    const protectedTimeDeltas = getCapacityChangeTimeDeltas(history);
    const compressed = compressPlateaus(sortedEntries, protectedTimeDeltas);

    // Gap-fill for smooth tooltip tracking
    const allTimeDeltas = new Set(compressed.map(([td]) => td));
    const sortedDeltas = Array.from(allTimeDeltas).sort((a, b) => a - b);

    if (sortedDeltas.length >= 2) {
      const totalRange =
        sortedDeltas[sortedDeltas.length - 1] - sortedDeltas[0];
      const maxGap = Math.max(totalRange / 300, 5);

      for (let i = 1; i < sortedDeltas.length; i++) {
        const gap = sortedDeltas[i] - sortedDeltas[i - 1];
        if (gap > maxGap) {
          const steps = Math.ceil(gap / maxGap);
          const step = gap / steps;
          for (let j = 1; j < steps; j++) {
            allTimeDeltas.add(sortedDeltas[i - 1] + j * step);
          }
        }
      }
    }

    const compressedMap = new Map(compressed);

    return Array.from(allTimeDeltas)
      .sort((a, b) => a - b)
      .map((timeDelta) => {
        const point =
          compressedMap.get(timeDelta) ??
          interpolateEnrollmentPoint(compressed, timeDelta);
        return {
          timeDelta,
          enrolled: point?.enrolledPercent ?? null,
        };
      });
  }, [history]);

  const firstTime = useMemo(() => {
    if (history.length === 0) return null;
    return moment(history[0].startTime).startOf("minute");
  }, [history]);

  const { data: enrollmentTimeframes } = useReadEnrollmentTimeframes(
    _class.year,
    _class.semester
  );

  const phaseLines = useMemo((): PhaseLine[] => {
    if (!enrollmentTimeframes.length || !data.length || !firstTime) return [];

    const lastTimeDelta = data[data.length - 1]?.timeDelta ?? 0;
    if (lastTimeDelta <= 0) return [];

    return enrollmentTimeframes
      .filter(
        (timeframe) =>
          timeframe.group === "continuing" ||
          timeframe.group === "all" ||
          (timeframe.group === "new_freshman" &&
            timeframe.phase === 1 &&
            !timeframe.isAdjustment)
      )
      .map((timeframe) => {
        const phaseStart = moment(timeframe.startDate);
        const timeDelta = moment
          .duration(phaseStart.diff(firstTime))
          .asMinutes();

        if (timeDelta < 0 || timeDelta > lastTimeDelta) return null;

        const phaseLabel = timeframe.isAdjustment
          ? "Adjustment"
          : timeframe.phase
            ? `Phase ${timeframe.phase}`
            : "Phase";
        const groupLabel = GROUP_LABELS[timeframe.group] ?? timeframe.group;

        return {
          timeDelta,
          label: `${phaseLabel} - ${groupLabel}`,
          key: `${timeframe.phase ?? "adjustment"}-${timeframe.group}-${timeframe.startDate}`,
        };
      })
      .filter((line): line is PhaseLine => line !== null)
      .toSorted((a, b) => a.timeDelta - b.timeDelta);
  }, [data, enrollmentTimeframes, firstTime]);

  const capacityChangeEvents = useMemo(() => {
    const events = new Map<string, CapacityChangeEvent>();
    getCapacityChangeEvents(history).forEach((e) =>
      events.set(getTimeDeltaKey(e.timeDelta), e)
    );
    return events;
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
      <div className={styles.chart} ref={chartRef}>
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
              onMouseLeave={hideCapacityTooltip}
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
              <Tooltip
                animationDuration={100}
                cursor={{ stroke: "var(--border-color)", strokeWidth: 1 }}
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;

                  const labelMinutes =
                    typeof label === "number"
                      ? label
                      : typeof payload?.[0]?.payload?.timeDelta === "number"
                        ? payload[0].payload.timeDelta
                        : null;

                  if (labelMinutes === null) return null;

                  const tooltipLabel = firstTime
                    ? TOOLTIP_DATE_FORMATTER.format(
                        firstTime
                          .clone()
                          .add(labelMinutes, "minutes")
                          .toDate()
                      )
                    : (() => {
                        const duration = moment.duration(
                          labelMinutes,
                          "minutes"
                        );
                        const day = Math.floor(duration.asDays()) + 1;
                        const timeLabel = timeFormatter.format(
                          moment.utc(0).add(duration).toDate()
                        );
                        return `Day ${day} ${timeLabel}`;
                      })();

                  const value = payload[0]?.value;
                  if (typeof value !== "number") return null;

                  return (
                    <div className={styles.tooltipCard}>
                      <div className={styles.tooltipLabel}>
                        {tooltipLabel}
                      </div>
                      <div className={styles.tooltipItems}>
                        <div className={styles.tooltipItem}>
                          <span className={styles.tooltipItemLabel}>
                            <ColoredSquare
                              size="sm"
                              color="var(--blue-500)"
                              variant="square"
                              className={styles.tooltipIndicator}
                            />
                            Enrolled
                          </span>
                          <span className={styles.tooltipItemValue}>
                            {formatters.percent(value, 1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
              {phaseLines.map((phaseLine) => (
                <ReferenceLine
                  key={phaseLine.key}
                  x={phaseLine.timeDelta}
                  stroke="var(--paragraph-color)"
                  strokeDasharray="6 4"
                  strokeOpacity={0.8}
                  strokeWidth={1}
                  label={{
                    value: phaseLine.label,
                    position: "insideBottomLeft",
                    fill: "var(--paragraph-color)",
                    fontSize: 10,
                    angle: -90,
                    dx: 12,
                    dy: -8,
                  }}
                />
              ))}
              {hasEnrolledActivity && (
                <Line
                  type="monotone"
                  dataKey="enrolled"
                  stroke="var(--blue-500)"
                  dot={(dotProps) => {
                    if (
                      typeof dotProps.cx !== "number" ||
                      typeof dotProps.cy !== "number" ||
                      typeof dotProps.payload?.timeDelta !== "number"
                    ) {
                      return <g />;
                    }

                    const key = getTimeDeltaKey(dotProps.payload.timeDelta);
                    const event = capacityChangeEvents.get(key);
                    if (!event) return <g />;

                    return (
                      <CapacityChangeMarker
                        cx={dotProps.cx}
                        cy={dotProps.cy}
                        event={event}
                        color="var(--blue-500)"
                        onMouseEnter={showCapacityTooltip}
                        onMouseLeave={hideCapacityTooltip}
                      />
                    );
                  }}
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
        {capacityTooltipElement}
      </div>
    </ClassChartBox>
  );
}
