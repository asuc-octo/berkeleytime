import { Fragment, useEffect, useMemo, useRef, useState } from "react";

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

import { ColoredSquare, Switch } from "@repo/theme";

import { formatters } from "@/components/Chart";
import { CourseAnalyticsGraphBox } from "@/components/CourseAnalytics/CourseAnalyticsLayout";
import { useReadEnrollmentTimeframes } from "@/hooks/api/enrollment";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import type { IEnrollment } from "@/lib/api/enrollment";
import { Semester } from "@/lib/generated/graphql";

import {
  estimateSeriesValueAtTime,
  type SeriesPoint,
} from "./EnrollmentGraph.utils";
import styles from "./EnrollmentGraph.module.scss";

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
const ROTATE_ENTER_WIDTH = 600;
const ROTATE_EXIT_WIDTH = 640;
const SERIES_ANIMATION_DURATION_MS = 320;
const GROUP_LABELS: Record<string, string> = {
  continuing: "Continuing Students",
  new_transfer: "New Transfer Students",
  new_freshman: "New Freshman Students",
  new_graduate: "New Graduate Students",
  new_student: "New Students",
  all: "All Students",
};

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

export default function EnrollmentGraph({
  outputs,
  hoveredIndex = null,
}: EnrollmentGraphProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [showRawNumbers, setShowRawNumbers] = useState(false);
  const [isRotated, setIsRotated] = useState(false);
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
            ? point?.enrolledCount ?? null
            : point?.enrolledPercent ?? null;
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
      const localMax = Object.entries(datum).reduce((innerAcc, [key, value]) => {
        if (key === "timeDelta" || typeof value !== "number") return innerAcc;
        return Math.max(innerAcc, value);
      }, 0);
      return Math.max(acc, localMax);
    }, 0);

    if (showRawNumbers) {
      const paddedMax = maxValue * 1.1;
      const step = maxValue >= 400 ? 50 : maxValue >= 150 ? 25 : 10;
      return Math.max(step, Math.ceil(paddedMax / step) * step);
    }

    return Math.max(100, Math.ceil(maxValue / 10) * 10);
  }, [chartData, showRawNumbers]);

  const hasOutputs = outputs.length > 0;
  const phaseLinesConfig = useMemo(() => {
    if (!hasOutputs) return null;

    const firstOutput = outputs[0];
    const allSameSemester = outputs.every(
      (output) =>
        output.input.year === firstOutput.input.year &&
        output.input.semester === firstOutput.input.semester
    );

    if (!allSameSemester) return null;

    return {
      year: firstOutput.input.year,
      semester: firstOutput.input.semester,
    };
  }, [hasOutputs, outputs]);

  const { data: enrollmentTimeframes } = useReadEnrollmentTimeframes(
    phaseLinesConfig?.year,
    phaseLinesConfig?.semester
  );

  const phaseLines = useMemo((): PhaseLine[] => {
    if (!phaseLinesConfig || !enrollmentTimeframes.length || !chartData.length) {
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
        const timeDelta = moment.duration(phaseStart.diff(firstTime)).asMinutes();

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
  const graphControls = (
    <div className={styles.graphHeader}>
      <label className={styles.toggleRow}>
        <span className={styles.toggleLabel}>Show as student count</span>
        <Switch
          checked={showRawNumbers}
          onCheckedChange={setShowRawNumbers}
          aria-label="Show as student count"
        />
      </label>
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
                      if (!active || !payload?.length) {
                        return null;
                      }

                      const labelMinutes =
                        typeof label === "number"
                          ? label
                          : typeof payload[0]?.payload?.timeDelta === "number"
                            ? payload[0].payload.timeDelta
                            : null;

                      if (labelMinutes === null) {
                        return null;
                      }

                      const duration = moment.duration(labelMinutes, "minutes");
                      const day = Math.floor(duration.asDays()) + 1;
                      const timeLabel = TOOLTIP_TIME_FORMATTER.format(
                        moment.utc(0).add(duration).toDate()
                      );

                      const payloadValuesBySeriesKey = new Map<string, number>();
                      payload.forEach((entry) => {
                        if (
                          typeof entry.dataKey === "string" &&
                          typeof entry.value === "number"
                        ) {
                          payloadValuesBySeriesKey.set(entry.dataKey, entry.value);
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

                          if (typeof interpolatedValue !== "number") return null;

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

                      if (rows.length === 0) return null;

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
                          dot={false}
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
