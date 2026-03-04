import { Fragment, useEffect, useMemo, useRef, useState } from "react";

import { StatDown, StatUp } from "iconoir-react";
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

import { ColoredSquare, Switch, Tooltip as ThemeTooltip } from "@repo/theme";

import { formatters } from "@/components/Chart";
import { CourseAnalyticsGraphBox } from "@/components/CourseAnalytics/CourseAnalyticsLayout";
import { useReadEnrollmentTimeframes } from "@/hooks/api/enrollment";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import type { IEnrollment } from "@/lib/api/enrollment";
import { Semester } from "@/lib/generated/graphql";

import styles from "./EnrollmentGraph.module.scss";
import {
  type CapacityChangeEvent,
  type SeriesPoint,
  areOutputsFromSameSemester,
  estimateSeriesValueAtTime,
  getCapacityChangeEvents,
} from "./EnrollmentGraph.utils";

interface EnrollmentGraphOutput {
  id: string;
  color: string;
  input: {
    year: number;
    semester: Semester;
  };
  course: {
    subject: string;
    number: string;
  };
  data: IEnrollment;
}

interface EnrollmentGraphProps {
  outputs: EnrollmentGraphOutput[];
  hoveredIndex?: number | null;
}

const TOOLTIP_TIME_FORMATTER = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "America/Los_Angeles",
});

const getSeriesKey = (index: number) => `enroll_${index}`;

const getGradientId = (outputId: string) =>
  `enroll-gradient-${outputId.replace(/[^a-zA-Z0-9_-]/g, "_")}`;

const getDisplayLabel = (output: EnrollmentGraphOutput) =>
  `${output.course.subject} ${output.course.number}`;

const CHART_HEIGHT_RATIO = 0.6;
const ROTATED_CHART_HEIGHT_RATIO = 0.72;
const PERCENT_AXIS_HEADROOM_MULTIPLIER = 1.05;
const ROTATE_ENTER_WIDTH = 600;
const ROTATE_EXIT_WIDTH = 640;
const SERIES_ANIMATION_DURATION_MS = 320;
const CAPACITY_CHANGE_MARKER_SIZE = 5;
const CAPACITY_CHANGE_MARKER_VERTICAL_OFFSET = 5;
const CAPACITY_CHANGE_MARKER_HIT_RADIUS = 8;
const CAPACITY_CHANGE_MARKER_HOVER_SCALE = 1.12;
const EMPTY_CAPACITY_CHANGE_EVENTS = new Map<string, CapacityChangeEvent>();
const GROUP_LABELS: Record<string, string> = {
  continuing: "Continuing Students",
  new_transfer: "New Transfer Students",
  new_freshman: "New Freshman Students",
  new_graduate: "New Graduate Students",
  new_student: "New Students",
  all: "All Students",
};
const MULTI_SEMESTER_STUDENT_COUNT_TOOLTIP =
  "Student count is unavailable when comparing multiple semesters.";

const getTimeDeltaKey = (timeDelta: number) => timeDelta.toFixed(4);

const getValidDenominator = (values: number[]) => {
  const maxSeen = Math.max(...values, 0);
  if (maxSeen === 0) return 0;

  const lastValue = values[values.length - 1] ?? 0;
  return lastValue > 0 ? lastValue : maxSeen;
};

interface EnrollmentPoint {
  enrolledCount: number | null;
  enrolledPercent: number | null;
}

interface EnrollmentGraphDatum {
  timeDelta: number;
  [key: string]: number | null;
}

interface PhaseLine {
  timeDelta: number;
  label: string;
  key: string;
}

interface HoveredCapacityGuide {
  timeDelta: number;
  previousValue: number;
  currentValue: number;
  percentChange: number;
  isIncrease: boolean;
  seatDelta: number;
}

export default function EnrollmentGraph({
  outputs,
  hoveredIndex = null,
}: EnrollmentGraphProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [showRawNumbers, setShowRawNumbers] = useState(false);
  const [showPhases, setShowPhases] = useState(false);
  const [isRotated, setIsRotated] = useState(false);
  const [hoveredCapacityMarkerKey, setHoveredCapacityMarkerKey] = useState<
    string | null
  >(null);
  const { height: viewportHeight } = useWindowDimensions();

  useEffect(() => {
    const element = rootRef.current;
    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      setIsRotated((previous) => {
        // Hysteresis prevents rapid flipping around the breakpoint.
        if (previous) return width < ROTATE_EXIT_WIDTH;
        return width < ROTATE_ENTER_WIDTH;
      });
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const chartData = useMemo(() => {
    if (outputs.length === 0) return [];

    const allTimeDeltas = new Set<number>();
    const outputMaps = outputs.map((output) => {
      const history = output.data.history;
      const map = new Map<number, EnrollmentPoint>();
      if (history.length === 0) return map;

      const maxEnrollDenominator = getValidDenominator(
        history.map((entry) => entry.maxEnroll ?? 0)
      );
      const firstTime = moment(history[0].startTime).startOf("minute");

      history.forEach((entry) => {
        const start = moment(entry.startTime).startOf("minute");
        const end = moment(entry.endTime).startOf("minute");
        const granularitySeconds = Math.max(entry.granularitySeconds ?? 60, 60);

        for (
          let cursor = start.clone();
          !cursor.isAfter(end);
          cursor.add(granularitySeconds, "seconds")
        ) {
          const timeDelta = moment.duration(cursor.diff(firstTime)).asMinutes();
          allTimeDeltas.add(timeDelta);

          map.set(timeDelta, {
            enrolledCount: entry.enrolledCount ?? 0,
            enrolledPercent:
              maxEnrollDenominator > 0
                ? (entry.enrolledCount / maxEnrollDenominator) * 100
                : null,
          });
        }
      });

      return map;
    });

    return Array.from(allTimeDeltas)
      .sort((a, b) => a - b)
      .map((timeDelta) => {
        const datum: EnrollmentGraphDatum = { timeDelta };

        outputs.forEach((_, outputIndex) => {
          const point = outputMaps[outputIndex].get(timeDelta);
          datum[getSeriesKey(outputIndex)] = showRawNumbers
            ? (point?.enrolledCount ?? null)
            : (point?.enrolledPercent ?? null);
        });

        return datum;
      });
  }, [outputs, showRawNumbers]);

  const seriesPointsByOutput = useMemo(
    () =>
      outputs.map((_, outputIndex) => {
        const seriesKey = getSeriesKey(outputIndex);
        return chartData.reduce<SeriesPoint[]>((points, datum) => {
          const value = datum[seriesKey];
          if (typeof value === "number") {
            points.push({
              timeDelta: datum.timeDelta,
              value,
            });
          }
          return points;
        }, []);
      }),
    [chartData, outputs]
  );

  const capacityChangeEventsByOutput = useMemo(
    () =>
      outputs.map((output) => {
        const events = new Map<string, CapacityChangeEvent>();
        getCapacityChangeEvents(output.data.history).forEach((event) => {
          events.set(getTimeDeltaKey(event.timeDelta), event);
        });
        return events;
      }),
    [outputs]
  );

  const capacityDenominatorByOutput = useMemo(
    () =>
      outputs.map((output) =>
        getValidDenominator(
          output.data.history.map((entry) => entry.maxEnroll ?? 0)
        )
      ),
    [outputs]
  );

  const capacityGuideByMarkerKey = useMemo(() => {
    const guides = new Map<string, HoveredCapacityGuide>();

    outputs.forEach((output, outputIndex) => {
      const events =
        capacityChangeEventsByOutput[outputIndex] ??
        EMPTY_CAPACITY_CHANGE_EVENTS;
      const denominator = capacityDenominatorByOutput[outputIndex] ?? 0;

      events.forEach((event, timeDeltaKey) => {
        const previousValue = showRawNumbers
          ? event.previousMaxEnroll
          : denominator > 0
            ? (event.previousMaxEnroll / denominator) * 100
            : null;
        const currentValue = showRawNumbers
          ? event.currentMaxEnroll
          : denominator > 0
            ? (event.currentMaxEnroll / denominator) * 100
            : null;

        if (previousValue === null || currentValue === null) return;

        guides.set(`${output.id}-${timeDeltaKey}`, {
          timeDelta: event.timeDelta,
          previousValue,
          currentValue,
          percentChange: event.percentChange,
          isIncrease: event.direction === "increase",
          seatDelta: event.currentMaxEnroll - event.previousMaxEnroll,
        });
      });
    });

    return guides;
  }, [
    capacityChangeEventsByOutput,
    capacityDenominatorByOutput,
    outputs,
    showRawNumbers,
  ]);

  const hoveredCapacityGuide = useMemo(
    () =>
      hoveredCapacityMarkerKey
        ? (capacityGuideByMarkerKey.get(hoveredCapacityMarkerKey) ?? null)
        : null,
    [capacityGuideByMarkerKey, hoveredCapacityMarkerKey]
  );

  const hasSeriesData = useMemo(
    () =>
      chartData.some((datum) =>
        Object.entries(datum).some(
          ([key, value]) => key !== "timeDelta" && typeof value === "number"
        )
      ),
    [chartData]
  );

  const dataMax = useMemo(() => {
    const maxValue = chartData.reduce((acc, datum) => {
      const localMax = Object.entries(datum).reduce(
        (innerAcc, [key, value]) => {
          if (key === "timeDelta" || typeof value !== "number") return innerAcc;
          return Math.max(innerAcc, value);
        },
        0
      );
      return Math.max(acc, localMax);
    }, 0);

    if (showRawNumbers) {
      const paddedMax = maxValue * 1.1;
      const step = maxValue >= 400 ? 50 : maxValue >= 150 ? 25 : 10;
      return Math.max(step, Math.ceil(paddedMax / step) * step);
    }

    const paddedPercentMax = maxValue * PERCENT_AXIS_HEADROOM_MULTIPLIER;
    return Math.max(100, Math.ceil(paddedPercentMax / 10) * 10);
  }, [chartData, showRawNumbers]);

  const hasOutputs = outputs.length > 0;
  const allOutputsSameSemester = useMemo(
    () => areOutputsFromSameSemester(outputs),
    [outputs]
  );

  useEffect(() => {
    if (allOutputsSameSemester || !showRawNumbers) return;
    setShowRawNumbers(false);
  }, [allOutputsSameSemester, showRawNumbers]);

  const phaseLinesConfig = useMemo(() => {
    if (!hasOutputs || !showPhases || !allOutputsSameSemester) return null;

    const firstOutput = outputs[0];

    return {
      year: firstOutput.input.year,
      semester: firstOutput.input.semester,
    };
  }, [allOutputsSameSemester, hasOutputs, outputs, showPhases]);

  const { data: enrollmentTimeframes } = useReadEnrollmentTimeframes(
    phaseLinesConfig?.year,
    phaseLinesConfig?.semester,
    { skip: !phaseLinesConfig }
  );

  const phaseLines = useMemo((): PhaseLine[] => {
    if (
      !phaseLinesConfig ||
      !enrollmentTimeframes.length ||
      !chartData.length
    ) {
      return [];
    }

    const matchingOutput = outputs.find(
      (output) =>
        output.input.year === phaseLinesConfig.year &&
        output.input.semester === phaseLinesConfig.semester
    );
    if (!matchingOutput || matchingOutput.data.history.length === 0) return [];

    const firstTime = moment(matchingOutput.data.history[0].startTime);
    const lastTimeDelta = chartData[chartData.length - 1]?.timeDelta ?? 0;
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
  }, [chartData, enrollmentTimeframes, outputs, phaseLinesConfig]);

  const chartHeightRatio = isRotated
    ? ROTATED_CHART_HEIGHT_RATIO
    : CHART_HEIGHT_RATIO;
  const chartHeight = Math.max(
    360,
    Math.round(viewportHeight * chartHeightRatio)
  );
  const emptyGraphHeight = chartHeight + 32;
  const isStudentCountDisabled = !allOutputsSameSemester;
  const studentCountToggle = (
    <label
      className={`${styles.toggleRow} ${
        isStudentCountDisabled ? styles.toggleRowDisabled : ""
      }`}
    >
      <span className={styles.toggleLabel}>Show as student count</span>
      <Switch
        checked={showRawNumbers}
        onCheckedChange={setShowRawNumbers}
        aria-label="Show as student count"
        disabled={isStudentCountDisabled}
      />
    </label>
  );
  const graphControls = (
    <div className={styles.graphHeader}>
      <label className={styles.toggleRow}>
        <span className={styles.toggleLabel}>Show phases</span>
        <Switch
          checked={showPhases}
          onCheckedChange={setShowPhases}
          aria-label="Show phases"
        />
      </label>
      {isStudentCountDisabled ? (
        <ThemeTooltip
          title={MULTI_SEMESTER_STUDENT_COUNT_TOOLTIP}
          trigger={
            <span className={styles.toggleTooltipTrigger}>
              {studentCountToggle}
            </span>
          }
        />
      ) : (
        studentCountToggle
      )}
    </div>
  );

  return (
    <div className={styles.root} ref={rootRef}>
      {hasOutputs ? (
        <CourseAnalyticsGraphBox>
          {graphControls}
          {hasSeriesData ? (
            <div className={styles.chart}>
              <ResponsiveContainer width="100%" height={chartHeight}>
                <LineChart
                  data={chartData}
                  margin={{ top: 8, right: 16, bottom: 0, left: 0 }}
                  layout={isRotated ? "vertical" : "horizontal"}
                  onMouseLeave={() => setHoveredCapacityMarkerKey(null)}
                >
                  <defs>
                    {outputs.map((output) => {
                      const gradientId = getGradientId(output.id);
                      return (
                        <linearGradient
                          key={gradientId}
                          id={gradientId}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor={output.color}
                            stopOpacity={1}
                          />
                          <stop
                            offset="100%"
                            stopColor={output.color}
                            stopOpacity={0.68}
                          />
                        </linearGradient>
                      );
                    })}
                  </defs>
                  <CartesianGrid
                    vertical={isRotated}
                    horizontal={!isRotated}
                    stroke="var(--border-color)"
                  />
                  {isRotated ? (
                    <>
                      <YAxis
                        dataKey="timeDelta"
                        type="number"
                        domain={["dataMin", "dataMax"]}
                        width={56}
                        tickMargin={10}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) =>
                          `Day ${Math.floor(moment.duration(value, "minutes").asDays()) + 1}`
                        }
                        tick={{
                          fill: "var(--paragraph-color)",
                          fontSize: "var(--text-12)",
                        }}
                      />
                      <XAxis
                        type="number"
                        domain={[0, dataMax]}
                        tickFormatter={(value) =>
                          showRawNumbers
                            ? formatters.number(Math.round(value))
                            : formatters.percentRound(value)
                        }
                        tickLine={false}
                        axisLine={false}
                        tick={{
                          fill: "var(--paragraph-color)",
                          fontSize: "var(--text-12)",
                        }}
                      />
                    </>
                  ) : (
                    <>
                      <XAxis
                        dataKey="timeDelta"
                        type="number"
                        domain={["dataMin", "dataMax"]}
                        tickFormatter={(value) =>
                          `Day ${Math.floor(moment.duration(value, "minutes").asDays()) + 1}`
                        }
                        tickMargin={8}
                        tickLine={false}
                        axisLine={false}
                        tick={{
                          fill: "var(--paragraph-color)",
                          fontSize: "var(--text-12)",
                        }}
                      />
                      <YAxis
                        width={46}
                        domain={[0, dataMax]}
                        tickFormatter={(value) =>
                          showRawNumbers
                            ? formatters.number(Math.round(value))
                            : formatters.percentRound(value)
                        }
                        tickLine={false}
                        axisLine={false}
                        tick={{
                          fill: "var(--paragraph-color)",
                          fontSize: "var(--text-12)",
                        }}
                      />
                    </>
                  )}
                  <Tooltip
                    cursor={{ stroke: "var(--border-color)", strokeWidth: 1 }}
                    content={({ active, payload, label }) => {
                      if (!active && !hoveredCapacityGuide) {
                        return null;
                      }

                      const labelMinutes =
                        typeof label === "number"
                          ? label
                          : typeof payload?.[0]?.payload?.timeDelta === "number"
                            ? payload[0].payload.timeDelta
                            : (hoveredCapacityGuide?.timeDelta ?? null);

                      if (labelMinutes === null) {
                        return null;
                      }

                      const duration = moment.duration(labelMinutes, "minutes");
                      const day = Math.floor(duration.asDays()) + 1;
                      const timeLabel = TOOLTIP_TIME_FORMATTER.format(
                        moment.utc(0).add(duration).toDate()
                      );

                      if (hoveredCapacityGuide) {
                        const formattedSeatDelta = `${
                          hoveredCapacityGuide.seatDelta > 0 ? "+" : ""
                        }${formatters.number(hoveredCapacityGuide.seatDelta)}`;
                        const seatWord =
                          Math.abs(hoveredCapacityGuide.seatDelta) === 1
                            ? "seat"
                            : "seats";
                        const percentDirectionLabel =
                          hoveredCapacityGuide.isIncrease
                            ? "increase"
                            : "decrease";

                        return (
                          <div
                            className={`${styles.tooltipCard} ${styles.capacityTooltipCard}`}
                          >
                            <div
                              className={`${styles.tooltipLabel} ${styles.capacityTooltipLabel}`}
                            >
                              Seating capacity changed
                            </div>
                            <div
                              className={`${styles.tooltipItems} ${styles.capacityTooltipItems}`}
                            >
                              <span
                                className={`${styles.capacityChangeTooltipDelta} ${
                                  hoveredCapacityGuide.isIncrease
                                    ? styles.capacityChangeTooltipDeltaIncrease
                                    : styles.capacityChangeTooltipDeltaDecrease
                                }`}
                              >
                                {hoveredCapacityGuide.isIncrease ? (
                                  <StatUp
                                    className={styles.capacityChangeTooltipIcon}
                                    width={14}
                                    height={14}
                                  />
                                ) : (
                                  <StatDown
                                    className={styles.capacityChangeTooltipIcon}
                                    width={14}
                                    height={14}
                                  />
                                )}
                                <span>
                                  {formatters.percent(
                                    hoveredCapacityGuide.percentChange,
                                    0
                                  )}{" "}
                                  {percentDirectionLabel} ({formattedSeatDelta}{" "}
                                  {seatWord})
                                </span>
                              </span>
                            </div>
                          </div>
                        );
                      }

                      if (!payload?.length) return null;

                      const labelTimeDeltaKey = getTimeDeltaKey(labelMinutes);
                      const capacityChangeLabels = outputs.reduce<string[]>(
                        (labels, output, outputIndex) => {
                          const markerEvents =
                            capacityChangeEventsByOutput[outputIndex] ??
                            EMPTY_CAPACITY_CHANGE_EVENTS;
                          if (markerEvents.has(labelTimeDeltaKey)) {
                            labels.push(getDisplayLabel(output));
                          }
                          return labels;
                        },
                        []
                      );

                      const payloadValuesBySeriesKey = new Map<
                        string,
                        number
                      >();
                      payload.forEach((entry) => {
                        if (
                          typeof entry.dataKey === "string" &&
                          typeof entry.value === "number"
                        ) {
                          payloadValuesBySeriesKey.set(
                            entry.dataKey,
                            entry.value
                          );
                        }
                      });

                      const rows = outputs
                        .map((output, outputIndex) => {
                          const seriesKey = getSeriesKey(outputIndex);
                          const exactValue =
                            payloadValuesBySeriesKey.get(seriesKey);
                          const interpolatedValue =
                            typeof exactValue === "number"
                              ? exactValue
                              : estimateSeriesValueAtTime(
                                  seriesPointsByOutput[outputIndex] ?? [],
                                  labelMinutes
                                );

                          if (typeof interpolatedValue !== "number")
                            return null;

                          return {
                            key: `${seriesKey}-${output.id}`,
                            label: getDisplayLabel(output),
                            value: interpolatedValue,
                            color: output.color,
                          };
                        })
                        .filter(
                          (
                            row
                          ): row is {
                            key: string;
                            label: string;
                            value: number;
                            color: string;
                          } => row !== null
                        );

                      const hasCapacityChange = capacityChangeLabels.length > 0;
                      if (rows.length === 0 && !hasCapacityChange) return null;

                      return (
                        <div className={styles.tooltipCard}>
                          <div className={styles.tooltipLabel}>
                            Day {day} {timeLabel}
                          </div>
                          <div className={styles.tooltipItems}>
                            {rows.map((row) => (
                              <div key={row.key} className={styles.tooltipItem}>
                                <span className={styles.tooltipItemLabel}>
                                  <ColoredSquare
                                    size="sm"
                                    color={row.color}
                                    variant="square"
                                    className={styles.tooltipIndicator}
                                  />
                                  {row.label}
                                </span>
                                <span className={styles.tooltipItemValue}>
                                  {showRawNumbers
                                    ? formatters.number(Math.round(row.value))
                                    : formatters.percent(row.value, 1)}
                                </span>
                              </div>
                            ))}
                          </div>
                          {hasCapacityChange ? (
                            <div className={styles.tooltipMeta}>
                              <span className={styles.tooltipMetaIcon}>▲</span>
                              <span className={styles.tooltipMetaText}>
                                Seating capacity changed
                                {capacityChangeLabels.length === 1
                                  ? ` for ${capacityChangeLabels[0]}`
                                  : ""}
                              </span>
                            </div>
                          ) : null}
                        </div>
                      );
                    }}
                  />
                  {phaseLines.map((phaseLine) => (
                    <ReferenceLine
                      key={phaseLine.key}
                      x={isRotated ? undefined : phaseLine.timeDelta}
                      y={isRotated ? phaseLine.timeDelta : undefined}
                      stroke="var(--paragraph-color)"
                      strokeDasharray="6 4"
                      strokeOpacity={0.8}
                      strokeWidth={1}
                      label={
                        isRotated
                          ? {
                              value: phaseLine.label,
                              position: "insideLeft",
                              fill: "var(--paragraph-color)",
                              fontSize: 10,
                              dx: 8,
                            }
                          : {
                              value: phaseLine.label,
                              position: "insideBottomLeft",
                              fill: "var(--paragraph-color)",
                              fontSize: 10,
                              angle: -90,
                              dx: 12,
                              dy: -8,
                            }
                      }
                    />
                  ))}
                  {outputs.map((output, outputIndex) => {
                    const isDimmed =
                      hoveredIndex !== null &&
                      outputs.length > 1 &&
                      hoveredIndex !== outputIndex;
                    const capacityChangeEventsByTimeDelta =
                      capacityChangeEventsByOutput[outputIndex] ??
                      EMPTY_CAPACITY_CHANGE_EVENTS;
                    const lineStroke = isDimmed
                      ? "var(--border-color)"
                      : `url(#${getGradientId(output.id)})`;
                    const dotColor = isDimmed
                      ? "var(--border-color)"
                      : output.color;

                    return (
                      <Fragment key={output.id}>
                        <Line
                          dataKey={getSeriesKey(outputIndex)}
                          stroke={lineStroke}
                          strokeWidth={isDimmed ? 1.75 : 2.75}
                          dot={(dotProps) => {
                            if (
                              typeof dotProps.cx !== "number" ||
                              typeof dotProps.cy !== "number" ||
                              typeof dotProps.payload?.timeDelta !== "number"
                            ) {
                              return null;
                            }

                            const markerTimeDeltaKey = getTimeDeltaKey(
                              dotProps.payload.timeDelta
                            );
                            const capacityChangeEvent =
                              capacityChangeEventsByTimeDelta.get(
                                markerTimeDeltaKey
                              );
                            if (!capacityChangeEvent) return null;
                            const markerKey = `${output.id}-${markerTimeDeltaKey}`;
                            const markerTipY =
                              dotProps.cy +
                              CAPACITY_CHANGE_MARKER_VERTICAL_OFFSET;
                            const markerBaseY =
                              dotProps.cy +
                              CAPACITY_CHANGE_MARKER_SIZE * 1.6 +
                              CAPACITY_CHANGE_MARKER_VERTICAL_OFFSET;
                            const isMarkerHovered =
                              hoveredCapacityMarkerKey === markerKey;
                            const markerScale = isMarkerHovered
                              ? CAPACITY_CHANGE_MARKER_HOVER_SCALE
                              : 1;
                            const markerTransform =
                              markerScale === 1
                                ? undefined
                                : `translate(${dotProps.cx} ${markerTipY}) scale(${markerScale}) translate(${-dotProps.cx} ${-markerTipY})`;

                            return (
                              <g
                                style={{ cursor: "pointer" }}
                                onMouseEnter={() =>
                                  setHoveredCapacityMarkerKey(markerKey)
                                }
                                onMouseLeave={() =>
                                  setHoveredCapacityMarkerKey((current) =>
                                    current === markerKey ? null : current
                                  )
                                }
                              >
                                <circle
                                  cx={dotProps.cx}
                                  cy={(markerTipY + markerBaseY) / 2}
                                  r={CAPACITY_CHANGE_MARKER_HIT_RADIUS}
                                  fill="transparent"
                                />
                                <path
                                  d={`M ${dotProps.cx} ${markerTipY} L ${dotProps.cx - CAPACITY_CHANGE_MARKER_SIZE} ${markerBaseY} L ${dotProps.cx + CAPACITY_CHANGE_MARKER_SIZE} ${markerBaseY} Z`}
                                  fill="var(--heading-color)"
                                  stroke="var(--heading-color)"
                                  fillOpacity={isMarkerHovered ? 1 : 0.88}
                                  strokeWidth={isMarkerHovered ? 1.4 : 1}
                                  transform={markerTransform}
                                />
                              </g>
                            );
                          }}
                          activeDot={{
                            r: 3,
                            fill: dotColor,
                            stroke: "var(--foreground-color)",
                            strokeWidth: 1,
                          }}
                          type="monotone"
                          connectNulls
                          isAnimationActive
                          animationBegin={0}
                          animationDuration={SERIES_ANIMATION_DURATION_MS}
                          animationEasing="ease-out"
                        />
                      </Fragment>
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className={styles.emptyGraphMessage}>
              No enrollment history available for the selected class.
            </div>
          )}
        </CourseAnalyticsGraphBox>
      ) : (
        <div
          className={styles.emptyGraphPrompt}
          style={{ height: emptyGraphHeight }}
        >
          {graphControls}
          <div className={styles.emptyGraphMessage}>
            Add a class from the sidebar to view enrollment trends.
          </div>
        </div>
      )}
    </div>
  );
}
