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

import { ColoredSquare, Slider, Switch } from "@repo/theme";

import {
  ChartContainer,
  createChartConfig,
  formatters,
} from "@/components/Chart";
import { CourseAnalyticsGraphBox } from "@/components/CourseAnalytics/CourseAnalyticsLayout";
import type { Input } from "@/components/CourseAnalytics/types";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import type { IGradeDistribution } from "@/lib/api";
import { LETTER_GRADES, PASS_FAIL } from "@/lib/grades";

import styles from "./GradeBarGraph.module.scss";

const CHART_HEIGHT_RATIO = 0.6;
const HORIZONTAL_CHART_HEIGHT_RATIO = 0.72;
const HORIZONTAL_ENTER_WIDTH = 600;
const HORIZONTAL_EXIT_WIDTH = 640;
const RANGE_UPDATE_THROTTLE_MS = 100;

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
  const liveRangeRef = useRef<[number, number]>([0, 100]);
  const thumbLabelLeftRef = useRef<HTMLSpanElement>(null);
  const thumbLabelRightRef = useRef<HTMLSpanElement>(null);
  const [showPassNoPass, setShowPassNoPass] = useState(false);
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

  const updateThumbLabels = useCallback(() => {
    const [lo, hi] = liveRangeRef.current;
    const leftEl = thumbLabelLeftRef.current;
    const rightEl = thumbLabelRightRef.current;
    if (!leftEl || !rightEl) return;

    const collapsed = hi - lo < 15;
    if (collapsed) {
      const mid = (lo + hi) / 2;
      const offsetPx = 11 - (mid / 100) * 22;
      leftEl.textContent = `Top ${lo}% – ${hi}%`;
      leftEl.style.left = `calc(${mid}% + ${offsetPx}px)`;
      leftEl.style.display = "";
      rightEl.style.display = "none";
    } else {
      const loOffset = 11 - (lo / 100) * 22;
      const hiOffset = 11 - (hi / 100) * 22;
      leftEl.textContent = `Top ${lo}%`;
      leftEl.style.left = `calc(${lo}% + ${loOffset}px)`;
      leftEl.style.display = "";
      rightEl.textContent = `Top ${hi}%`;
      rightEl.style.left = `calc(${hi}% + ${hiOffset}px)`;
      rightEl.style.display = "";
    }
  }, []);

  const isFilterActive = sliderRange[0] !== 0 || sliderRange[1] !== 100;
  const displayedGrades = useMemo(
    () =>
      showPassNoPass && !isFilterActive
        ? [...LETTER_GRADES, ...PASS_FAIL]
        : LETTER_GRADES,
    [showPassNoPass, isFilterActive]
  );

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
      return displayedGrades.reduce((acc, letter) => {
        const grade = dist.find((g) => g.letter === letter);
        return acc + (grade?.count ?? 0);
      }, 0);
    });

    // Build percentage for each letter grade per course
    const percentages = displayedGrades.map((letter) => {
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
      { length: displayedGrades.length },
      () => ({})
    );
    dataKeys.forEach((key) => {
      let cum = 0;
      for (let i = displayedGrades.length - 1; i >= 0; i--) {
        cumulative[i][key] = cum;
        cum += percentages[i][key];
      }
    });

    const chartData = displayedGrades.map((letter, i) => {
      const row: Record<string, number | string> = { letter };
      dataKeys.forEach((key) => {
        row[key] = percentages[i][key];
        row[`${key}_pctlLo`] = cumulative[i][key];
        row[`${key}_pctlHi`] = cumulative[i][key] + percentages[i][key];
      });
      return row;
    });

    return { chartData, chartConfig, dataKeys };
  }, [outputs, displayedGrades]);

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

  const handleSliderLiveChange = useCallback(
    (next: [number, number]) => {
      liveRangeRef.current = next;
      updateThumbLabels();
      scheduleSliderRangeUpdate(next);
    },
    [scheduleSliderRangeUpdate, updateThumbLabels]
  );

  const handleSliderCommit = useCallback(
    (next: [number, number]) => {
      if (throttleTimeoutRef.current !== null) {
        window.clearTimeout(throttleTimeoutRef.current);
        throttleTimeoutRef.current = null;
      }
      pendingRangeRef.current = null;
      liveRangeRef.current = next;
      updateThumbLabels();
      commitSliderRange(next);
    },
    [commitSliderRange, updateThumbLabels]
  );
  const hasOutputs = outputs.length > 0;
  const shouldAnimateBars = hoveredIndex === null && outputs.length <= 2;

  useEffect(() => {
    if (hasOutputs) return;
    setSliderRange([0, 100]);
    liveRangeRef.current = [0, 100];
    updateThumbLabels();
  }, [hasOutputs, updateThumbLabels]);

  const cellFills = useMemo(() => {
    return dataKeys.map((key, keyIndex) =>
      chartData.map((row) => {
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
        return isHoveredCourse && inRange
          ? `var(--color-${key})`
          : "var(--border-color)";
      })
    );
  }, [chartData, dataKeys, sliderRange, hoveredIndex, outputs.length]);

  const chartHeightRatio = horizontal
    ? HORIZONTAL_CHART_HEIGHT_RATIO
    : CHART_HEIGHT_RATIO;
  const chartHeight = Math.max(
    360,
    Math.round(viewportHeight * chartHeightRatio)
  );
  const emptyGraphHeight = chartHeight + 32;
  const graphControls = (
    <div className={styles.graphHeader}>
      <label className={styles.switchRow}>
        <span className={styles.switchLabel}>Show P/NP</span>
        <Switch
          checked={showPassNoPass}
          onCheckedChange={setShowPassNoPass}
          aria-label="Show P/NP columns"
        />
      </label>
    </div>
  );

  return (
    <div className={styles.root} ref={rootRef} style={undefined}>
      {hasOutputs ? (
        <CourseAnalyticsGraphBox>
          {graphControls}
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
                      <div className={styles.tooltipCard}>
                        <div className={styles.tooltipLabel}>
                          Grade: {label}
                        </div>
                        <div className={styles.tooltipItems}>
                          {payload.map((item) => {
                            const key = item.dataKey as string;
                            const row = item.payload;
                            const pctlLo = row[`${key}_pctlLo`] as number;
                            const pctlHi = row[`${key}_pctlHi`] as number;
                            return (
                              <div key={key} className={styles.tooltipItem}>
                                <span className={styles.tooltipItemLabel}>
                                  <ColoredSquare
                                    size="sm"
                                    color={
                                      chartConfig[key]?.color ||
                                      item.fill ||
                                      item.color
                                    }
                                    variant="square"
                                    className={styles.tooltipIndicator}
                                  />
                                  {chartConfig[key]?.label ?? item.name}
                                </span>
                                <span className={styles.tooltipItemValue}>
                                  {formatters.percent(item.value, 1)}
                                </span>
                                <span className={styles.tooltipItemValue}>
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
                  <Bar
                    key={key}
                    dataKey={key}
                    radius={4}
                    isAnimationActive={shouldAnimateBars}
                  >
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={cellFills[keyIndex][i]} />
                    ))}
                  </Bar>
                ))}
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CourseAnalyticsGraphBox>
      ) : (
        <div
          className={styles.emptyGraphPrompt}
          style={{ height: emptyGraphHeight }}
        >
          {graphControls}
          <div className={styles.emptyGraphMessage}>
            Add a class from the sidebar to view the graph.
          </div>
        </div>
      )}
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
            <span
              ref={thumbLabelLeftRef}
              className={styles.thumbLabel}
              style={{ left: `calc(0% + 11px)` }}
            >
              Top 0%
            </span>
            <span
              ref={thumbLabelRightRef}
              className={styles.thumbLabel}
              style={{ left: `calc(100% + -11px)` }}
            >
              Top 100%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
