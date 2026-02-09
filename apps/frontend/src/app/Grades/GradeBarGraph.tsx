import { useEffect, useMemo, useRef, useState } from "react";

import {
  Bar,
  BarChart,
  CartesianGrid,
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
import type { Input } from "@/components/CourseAnalytics/types";
import type { IGradeDistribution } from "@/lib/api";
import { LETTER_GRADES } from "@/lib/grades";

import styles from "./GradeBarGraph.module.scss";

const HORIZONTAL_THRESHOLD = 500;

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

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      setHorizontal(entry.contentRect.width < HORIZONTAL_THRESHOLD);
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

    // Build one row per letter grade, computing percentages from counts
    const chartData = LETTER_GRADES.map((letter) => {
      const row: Record<string, number | string> = { letter };

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

    return { chartData, chartConfig, dataKeys };
  }, [outputs]);

  if (outputs.length === 0) {
    return <div className={styles.root} ref={rootRef} />;
  }

  return (
    <div
      className={styles.root}
      ref={rootRef}
      style={horizontal ? { minHeight: 480 } : undefined}
    >
      <div className={styles.chartWrapper}>
        <ChartContainer config={chartConfig} className={styles.chart}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout={horizontal ? "vertical" : "horizontal"}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={horizontal}
                horizontal={!horizontal}
                stroke="var(--border-color)"
              />
              {horizontal ? (
                <>
                  <YAxis
                    dataKey="letter"
                    type="category"
                    tickMargin={8}
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
                      (dataMax: number) => Math.ceil(dataMax / 5) * 5 + 5,
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
                    tickMargin={8}
                    tickLine={false}
                    axisLine={false}
                    tick={{
                      fill: "var(--paragraph-color)",
                      fontSize: "var(--text-12)",
                    }}
                  />
                  <YAxis
                    domain={[
                      0,
                      (dataMax: number) => Math.ceil(dataMax / 5) * 5 + 5,
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
              <ChartTooltip
                tooltipConfig={{
                  labelFormatter: (label) => `Grade: ${label}`,
                  valueFormatter: (value) => formatters.percent(value, 1),
                  indicator: "square",
                }}
              />
              {dataKeys.map((key) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={`var(--color-${key})`}
                  radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
}
