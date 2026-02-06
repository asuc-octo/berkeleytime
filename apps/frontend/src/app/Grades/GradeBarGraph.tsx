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
import { LETTER_GRADES } from "@/lib/grades";

import styles from "./GradeBarGraph.module.scss";

const WEIGHTS_A: Record<string, number> = {
  "A+": 5, A: 18, "A-": 15, "B+": 14, "B": 12, "B-": 8,
  "C+": 6, C: 5, "C-": 4, "D+": 2, D: 1, "D-": 0.5, F: 2,
};

const WEIGHTS_B: Record<string, number> = {
  "A+": 2, A: 10, "A-": 12, "B+": 16, "B": 18, "B-": 14,
  "C+": 10, C: 7, "C-": 4, "D+": 3, D: 2, "D-": 1, F: 1,
};

const FAKE_DATA = [
  ...LETTER_GRADES.map((letter) => ({
    letter,
    courseA: WEIGHTS_A[letter] ?? 0,
    courseB: WEIGHTS_B[letter] ?? 0,
  })),
  {
    letter: "P/NP",
    courseA: 6,
    courseA_np: 1.5,
    courseB: 0,
    courseB_np: 0,
  },
];

const chartConfig = createChartConfig(
  ["courseA", "courseA_np", "courseB", "courseB_np"],
  {
    labels: {
      courseA: "CS 61A",
      courseA_np: "CS 61A (NP)",
      courseB: "CS 61B",
      courseB_np: "CS 61B (NP)",
    },
    colors: {
      courseA: "#4EA6FA",
      courseA_np: "#4EA6FA",
      courseB: "#6ADF86",
      courseB_np: "#6ADF86",
    },
  }
);

export default function GradeBarGraph() {
  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <h2 className={styles.title}>Grade Distribution</h2>
        <p className={styles.subtitle}>Comparing selected courses</p>
      </div>
      <div className={styles.chartWrapper}>
        <ChartContainer config={chartConfig} className={styles.chart}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={FAKE_DATA}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--border-color)"
              />
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
                tickFormatter={(v) => formatters.percent(v, 0)}
                tick={{
                  fill: "var(--paragraph-color)",
                  fontSize: "var(--text-12)",
                }}
                axisLine={false}
                tickLine={false}
              />
              <ChartTooltip
                tooltipConfig={{
                  labelFormatter: (label) =>
                    label === "P/NP" ? "Pass / No Pass" : `Grade: ${label}`,
                  valueFormatter: (value) => formatters.percent(value, 1),
                  indicator: "square",
                }}
              />
              <Bar
                dataKey="courseA"
                stackId="courseA"
                fill="var(--color-courseA)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="courseA_np"
                stackId="courseA"
                fill="var(--color-courseA_np)"
                fillOpacity={0.4}
                radius={4}
              />
              <Bar
                dataKey="courseB"
                stackId="courseB"
                fill="var(--color-courseB)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="courseB_np"
                stackId="courseB"
                fill="var(--color-courseB_np)"
                fillOpacity={0.4}
                radius={4}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
}
