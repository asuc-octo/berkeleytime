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
import type { IGradeDistribution } from "@/lib/api";
import { LETTER_GRADES } from "@/lib/grades";

import styles from "./GradeBarGraph.module.scss";

const HORIZONTAL_THRESHOLD = 500;

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

interface GradeBarGraphOutput {
  input: Input;
  color: string;
  data: IGradeDistribution;
}

interface GradeBarGraphProps {
  outputs: GradeBarGraphOutput[];
}

export default function GradeBarGraph({ outputs }: GradeBarGraphProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [horizontal, setHorizontal] = useState(false);
  const [sliderRange, setSliderRange] = useState<[number, number]>([0, 100]);
  const [liveRange, setLiveRange] = useState<[number, number]>([0, 100]);
  const sliderRangeRef = useRef(sliderRange);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      const isHorizontal = entry.contentRect.width < HORIZONTAL_THRESHOLD;
      setHorizontal(isHorizontal);
    });
    observer.observe(el);
    return () => observer.disconnect();
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

  const handleSliderChange = useCallback(
    (next: [number, number]) => {
      setLiveRange(next);
      const prev = sliderRangeRef.current;
      const changed = chartData.some((row) =>
        dataKeys.some((key) => {
          const pctlLo = row[`${key}_pctlLo`] as number;
          const pctlHi = row[`${key}_pctlHi`] as number;
          return (
            isGradeInRange(pctlLo, pctlHi, prev[0], prev[1]) !==
            isGradeInRange(pctlLo, pctlHi, next[0], next[1])
          );
        })
      );
      if (changed) {
        sliderRangeRef.current = next;
        setSliderRange(next);
      }
    },
    [chartData, dataKeys]
  );

  if (outputs.length === 0) {
    return <div className={styles.root} ref={rootRef} />;
  }

  return (
    <div className={styles.root} ref={rootRef} style={undefined}>
      <div className={styles.chartArea}>
        <ChartContainer config={chartConfig} className={styles.chart}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout={horizontal ? "vertical" : "horizontal"}
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
              {dataKeys.map((key) => (
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
                    return (
                      <Cell
                        key={i}
                        fill={
                          inRange
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
            value={liveRange}
            onValueChange={handleSliderChange}
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
