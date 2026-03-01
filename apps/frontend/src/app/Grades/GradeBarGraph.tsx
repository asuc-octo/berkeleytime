import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ColoredSquare, Slider } from "@repo/theme";

import {
  ChartContainer,
  createChartConfig,
  formatters,
} from "@/components/Chart";
import tooltipStyles from "@/components/Chart/Chart.module.scss";
import type { Input } from "@/components/CourseAnalytics/types";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import type { IGradeDistribution } from "@/lib/api";
import { LETTER_GRADES } from "@/lib/grades";

import styles from "./GradeBarGraph.module.scss";

const CHART_HEIGHT_RATIO = 0.6;
const HORIZONTAL_ENTER_WIDTH = 600;
const HORIZONTAL_EXIT_WIDTH = 640;
const RANGE_UPDATE_THROTTLE_MS = 60;

const ordinal = (n: number): string => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const isGradeInRange = (
  pctlLo: number,
  pctlHi: number,
  sliderL: number,
  sliderR: number
): boolean => {
  const topLo = 100 - pctlHi;
  const topHi = 100 - pctlLo;
  return topLo < sliderR && topHi > sliderL;
};

const isSameRange = (
  a: readonly [number, number],
  b: readonly [number, number]
) => a[0] === b[0] && a[1] === b[1];

interface GradeBarGraphOutput {
  input: Input;
  color: string;
  data: IGradeDistribution;
}

interface GradeBarGraphProps {
  outputs: GradeBarGraphOutput[];
  hoveredIndex?: number | null;
}

export default function GradeBarGraph({
  outputs,
  hoveredIndex = null,
}: GradeBarGraphProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const { height: viewportHeight } = useWindowDimensions();
  const [horizontal, setHorizontal] = useState(false);
  const [sliderRange, setSliderRange] = useState<[number, number]>([0, 100]);
  const [liveRange, setLiveRange] = useState<[number, number]>([0, 100]);
  const throttleTimeoutRef = useRef<number | null>(null);
  const pendingRangeRef = useRef<[number, number] | null>(null);
  const lastRangeCommitAtRef = useRef(0);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      setHorizontal((prev) => {
        // Hysteresis prevents flip-flopping near the breakpoint.
        if (prev) {
          return width < HORIZONTAL_EXIT_WIDTH;
        }
        return width < HORIZONTAL_ENTER_WIDTH;
      });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    return () => {
      if (throttleTimeoutRef.current !== null) {
        window.clearTimeout(throttleTimeoutRef.current);
      }
    };
  }, []);

  const { chartData, chartConfig, dataKeys } = useMemo(() => {
    if (outputs.length === 0) {
      return { chartData: [], chartConfig: {}, dataKeys: [] };
    }

    const dataKeys = outputs.map((_, i) => `course${i}`);

    // Build labels and colors for chart config
    const labels: Record<string, string> = {};
    const colors: Record<string, string> = {};
    outputs.forEach((output, i) => {
      const key = dataKeys[i];
      labels[key] = `${output.input.subject} ${output.input.courseNumber}`;
      colors[key] = output.color;
    });

    const chartConfig = createChartConfig(dataKeys, { labels, colors });

    // Pre-compute totals for each output
    const totals = outputs.map((output) => {
      const dist = output.data?.distribution;
      if (!dist) return 0;
      return LETTER_GRADES.reduce((acc, letter) => {
        const grade = dist.find((g) => g.letter === letter);
        return acc + (grade?.count ?? 0);
      }, 0);
    });

    // Build percentage for each letter grade per course
    const percentages = LETTER_GRADES.map((letter) => {
      const row: Record<string, number> = {};
      outputs.forEach((output, i) => {
        const dist = output.data?.distribution;
        if (!dist || totals[i] === 0) {
          row[dataKeys[i]] = 0;
          return;
        }
        const grade = dist.find((g) => g.letter === letter);
        row[dataKeys[i]] = ((grade?.count ?? 0) / totals[i]) * 100;
      });
      return row;
    });

    // Pre-compute cumulative percentiles (from F upward)
    const cumulative: Record<string, number>[] = Array.from(
      { length: LETTER_GRADES.length },
      () => ({})
    );
    dataKeys.forEach((key) => {
      let cum = 0;
      for (let i = LETTER_GRADES.length - 1; i >= 0; i--) {
        cumulative[i][key] = cum;
        cum += percentages[i][key];
      }
    });

    const chartData = LETTER_GRADES.map((letter, i) => {
      const row: Record<string, number | string> = { letter };
      dataKeys.forEach((key) => {
        row[key] = percentages[i][key];
        row[`${key}_pctlLo`] = cumulative[i][key];
        row[`${key}_pctlHi`] = cumulative[i][key] + percentages[i][key];
      });
      return row;
    });

    return { chartData, chartConfig, dataKeys };
  }, [outputs]);

  const commitSliderRange = useCallback((next: [number, number]) => {
    lastRangeCommitAtRef.current = Date.now();
    setSliderRange((prevRange) =>
      isSameRange(prevRange, next) ? prevRange : next
    );
  }, []);

  const scheduleSliderRangeUpdate = useCallback(
    (next: [number, number]) => {
      pendingRangeRef.current = next;

      const flushPendingRange = () => {
        const pending = pendingRangeRef.current;
        pendingRangeRef.current = null;
        throttleTimeoutRef.current = null;
        if (!pending) return;
        commitSliderRange(pending);
      };

      const now = Date.now();
      const elapsedSinceLastCommit = now - lastRangeCommitAtRef.current;

      if (
        throttleTimeoutRef.current === null &&
        elapsedSinceLastCommit >= RANGE_UPDATE_THROTTLE_MS
      ) {
        flushPendingRange();
        return;
      }

      if (throttleTimeoutRef.current !== null) return;

      throttleTimeoutRef.current = window.setTimeout(
        flushPendingRange,
        Math.max(RANGE_UPDATE_THROTTLE_MS - elapsedSinceLastCommit, 0)
      );
    },
    [commitSliderRange]
  );

  const handleSliderLiveChange = useCallback((next: [number, number]) => {
    setLiveRange((prevRange) =>
      isSameRange(prevRange, next) ? prevRange : next
    );
    scheduleSliderRangeUpdate(next);
  }, [scheduleSliderRangeUpdate]);

  const handleSliderCommit = useCallback((next: [number, number]) => {
    if (throttleTimeoutRef.current !== null) {
      window.clearTimeout(throttleTimeoutRef.current);
      throttleTimeoutRef.current = null;
    }
    pendingRangeRef.current = null;
    setLiveRange((prevRange) =>
      isSameRange(prevRange, next) ? prevRange : next
    );
    commitSliderRange(next);
  }, [commitSliderRange]);

  if (outputs.length === 0) {
    return <div className={styles.root} ref={rootRef} />;
  }

  const chartHeight = Math.max(360, Math.round(viewportHeight * CHART_HEIGHT_RATIO));

  return (
    <div className={styles.root} ref={rootRef} style={undefined}>
      <div className={styles.chartArea}>
        <ChartContainer config={chartConfig} className={styles.chart}>
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart
              data={chartData}
              layout={horizontal ? "vertical" : "horizontal"}
              accessibilityLayer={false}
              tabIndex={-1}
            >
              <CartesianGrid
                vertical={horizontal}
                horizontal={!horizontal}
                stroke="var(--border-color)"
              />
              {horizontal ? (
                <>
                  <YAxis
                    dataKey="letter"
                    type="category"
                    width={28}
                    tickMargin={10}
                    tickLine={false}
                    axisLine={false}
                    tick={{
                      fill: "var(--paragraph-color)",
                      fontSize: "var(--text-12)",
                    }}
                  />
                  <XAxis
                    type="number"
                    domain={[
                      0,
                      (dataMax: number) => Math.ceil(dataMax / 5) * 5,
                    ]}
                    tickFormatter={(v) => formatters.percent(v, 0)}
                    tick={{
                      fill: "var(--paragraph-color)",
                      fontSize: "var(--text-12)",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                </>
              ) : (
                <>
                  <XAxis
                    dataKey="letter"
                    tickMargin={10}
                    tickLine={false}
                    axisLine={false}
                    tick={{
                      fill: "var(--paragraph-color)",
                      fontSize: "var(--text-12)",
                    }}
                  />
                  <YAxis
                    width={36}
                    domain={[
                      0,
                      (dataMax: number) => Math.ceil(dataMax / 5) * 5,
                    ]}
                    tickFormatter={(v) => formatters.percent(v, 0)}
                    tick={{
                      fill: "var(--paragraph-color)",
                      fontSize: "var(--text-12)",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                </>
              )}
              <Tooltip
                cursor={false}
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className={tooltipStyles.tooltipCard}>
                      <div className={tooltipStyles.tooltipLabel}>
                        Grade: {label}
                      </div>
                      <div className={tooltipStyles.tooltipItems}>
                        {payload.map((item) => {
                          const key = item.dataKey as string;
                          const row = item.payload;
                          const pctlLo = row[`${key}_pctlLo`] as number;
                          const pctlHi = row[`${key}_pctlHi`] as number;
                          return (
                            <div
                              key={key}
                              className={tooltipStyles.tooltipItem}
                            >
                              <span className={tooltipStyles.tooltipItemLabel}>
                                <ColoredSquare
                                  size="sm"
                                  color={
                                    chartConfig[key]?.color ||
                                    item.fill ||
                                    item.color
                                  }
                                  variant="square"
                                  className={tooltipStyles.tooltipIndicator}
                                />
                                {chartConfig[key]?.label ?? item.name}
                              </span>
                              <span className={tooltipStyles.tooltipItemValue}>
                                {formatters.percent(item.value, 1)}
                              </span>
                              <span className={tooltipStyles.tooltipItemValue}>
                                {ordinal(Math.round(pctlLo))}–
                                {ordinal(Math.round(pctlHi))} pctile
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }}
              />
              {dataKeys.map((key, keyIndex) => (
                <Bar key={key} dataKey={key} radius={4}>
                  {chartData.map((row, i) => {
                    const pctlLo = row[`${key}_pctlLo`] as number;
                    const pctlHi = row[`${key}_pctlHi`] as number;
                    const inRange = isGradeInRange(
                      pctlLo,
                      pctlHi,
                      sliderRange[0],
                      sliderRange[1]
                    );
                    const isHoveredCourse =
                      hoveredIndex === null ||
                      outputs.length <= 1 ||
                      hoveredIndex === keyIndex;
                    return (
                      <Cell
                        key={i}
                        fill={
                          isHoveredCourse && inRange
                            ? `var(--color-${key})`
                            : "var(--border-color)"
                        }
                      />
                    );
                  })}
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
      <div className={styles.sliderArea}>
        <p className={styles.sliderTitle}>Filter by percentile</p>
        <p className={styles.sliderDescription}>
          Drag the slider to highlight grades within a percentile range.
        </p>
        <div className={styles.sliderWrapper}>
          <Slider
            min={0}
            max={100}
            step={1}
            defaultValue={sliderRange}
            onValueChange={handleSliderLiveChange}
            onValueCommit={handleSliderCommit}
          />
          <div className={styles.thumbLabels}>
            {liveRange[1] - liveRange[0] < 15 ? (
              <span
                className={styles.thumbLabel}
                style={{
                  left: `calc(${(liveRange[0] + liveRange[1]) / 2}% + ${11 - ((liveRange[0] + liveRange[1]) / 2 / 100) * 22}px)`,
                }}
              >
                Top {liveRange[0]}% – {liveRange[1]}%
              </span>
            ) : (
              liveRange.map((val, i) => {
                const percent = val;
                const offsetPx = 11 - (percent / 100) * 22;
                return (
                  <span
                    key={i}
                    className={styles.thumbLabel}
                    style={{
                      left: `calc(${percent}% + ${offsetPx}px)`,
                    }}
                  >
                    Top {val}%
                  </span>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
