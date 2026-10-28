import { useEffect, useMemo, useRef, useState } from "react";

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

import { ColoredSquare, Switch } from "@repo/theme";

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
import { buildGradeChartData, isLetterGrade } from "./GradeBarGraph.utils";

const CHART_HEIGHT_RATIO = 0.55;
const HORIZONTAL_CHART_HEIGHT_RATIO = 0.72;
const HORIZONTAL_ENTER_WIDTH = 600;
const HORIZONTAL_EXIT_WIDTH = 640;

const ordinal = (n: number): string => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

interface GradeBarGraphOutput {
  input: Input;
  color: string;
  darkColor: string;
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
  const [showPassNoPass, setShowPassNoPass] = useState(true);

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

  const displayedGrades = useMemo(
    () => (showPassNoPass ? [...LETTER_GRADES, ...PASS_FAIL] : LETTER_GRADES),
    [showPassNoPass]
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

    const chartData = buildGradeChartData(
      outputs.map((output) => output.data?.distribution),
      dataKeys,
      displayedGrades
    );

    return { chartData, chartConfig, dataKeys };
  }, [outputs, displayedGrades]);

  const hasOutputs = outputs.length > 0;
  const shouldAnimateBars = hoveredIndex === null && outputs.length <= 2;

  const cellFills = useMemo(() => {
    return dataKeys.map((key, keyIndex) =>
      chartData.map(() => {
        const isHoveredCourse =
          hoveredIndex === null ||
          outputs.length <= 1 ||
          hoveredIndex === keyIndex;

        if (isHoveredCourse) return `var(--color-${key})`;
        return outputs[keyIndex]?.darkColor ?? "var(--border-color)";
      })
    );
  }, [chartData, dataKeys, hoveredIndex, outputs]);

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
                  cursor={{
                    fill: "var(--border-color)",
                    opacity: 0.5,
                    radius: 4,
                  }}
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
                            const hasPercentile = isLetterGrade(
                              String(row.letter)
                            );
                            const pctlLo = row[`${key}_pctlLo`] as number;
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
                                {/* Lower bound: the percentile this grade starts at. */}
                                {hasPercentile && (
                                  <span className={styles.tooltipItemValue}>
                                    From {ordinal(Math.round(pctlLo))}{" "}
                                    percentile
                                  </span>
                                )}
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
    </div>
  );
}
