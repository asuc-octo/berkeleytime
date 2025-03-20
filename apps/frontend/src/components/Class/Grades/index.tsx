import { useMemo } from "react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

import useClass from "@/hooks/useClass";
import { Grade } from "@/lib/api";

import styles from "./Grades.module.scss";

// const points: { [key: string]: number } = {
//   A: 4,
//   "A-": 3.7,
//   "A+": 4,
//   B: 3,
//   "B-": 2.7,
//   "B+": 3.3,
//   C: 2,
//   "C-": 1.7,
//   "C+": 2.3,
//   D: 1,
//   "D-": 0.7,
//   "D+": 1.3,
//   F: 0,
// };

const letters = [
  "A+",
  "A",
  "A-",
  "B+",
  "B",
  "B-",
  "C+",
  "C",
  "C-",
  "D",
  "F",
  "P",
  "NP",
];

export default function Grades() {
  const {
    class: {
      gradeDistribution,
      course: { gradeDistribution: courseGradeDistribution },
    },
  } = useClass();

  const data = useMemo(() => {
    const getTotal = (distribution: Grade[]) =>
      distribution.reduce((acc, grade) => acc + grade.count, 0);

    const classTotal = getTotal(gradeDistribution.distribution);
    const courseTotal = getTotal(courseGradeDistribution.distribution);

    return letters.map((letter) => {
      const getCount = (distribution: Grade[]) =>
        distribution.find((grade) => grade.letter === letter)?.count || 0;

      return {
        letter,
        class: getCount(gradeDistribution.distribution) / classTotal,
        course: getCount(courseGradeDistribution.distribution) / courseTotal,
      };
    });
  }, [gradeDistribution, courseGradeDistribution]);

  return (
    <div className={styles.root}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart width={730} height={250} data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="var(--border-color)"
          />
          <Legend />
          <Tooltip cursor={{ fillOpacity: 0.1 }} />
          {gradeDistribution.average && (
            <Bar dataKey="class" fill="var(--blue-500)" name="Fall 2024" />
          )}
          <Bar
            dataKey="course"
            fill="var(--amber-500)"
            name="Fall 2014 - Spring 2024"
          />
          <XAxis
            dataKey="letter"
            tickMargin={8}
            tick={{ fill: "var(--paragraph-color)", fontSize: 12 }}
            stroke="var(--label-color)"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
