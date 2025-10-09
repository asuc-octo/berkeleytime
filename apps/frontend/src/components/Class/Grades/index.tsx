import { useMemo } from "react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Box, Container, HoverCard } from "@repo/theme";

import useClass from "@/hooks/useClass";

import styles from "./Grades.module.scss";

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
  "D+",
  "D",
  "D-",
  "F",
  "P",
  "NP",
];

const toPercent = (decimal: number) => {
  return `${decimal.toFixed(1)}%`;
};

export default function Grades() {
  const {
    class: {
      gradeDistribution,
      course: { gradeDistribution: courseGradeDistribution },
    },
  } = useClass();

  const data = useMemo(() => {
    const getTotal = (distribution: typeof gradeDistribution.distribution) =>
      distribution.reduce((acc, grade) => acc + (grade.count ?? 0), 0);

    const classTotal = getTotal(gradeDistribution.distribution);
    const courseTotal = getTotal(courseGradeDistribution.distribution);

    return letters.map((letter) => {
      const classGrade = gradeDistribution.distribution.find(
        (grade) => grade.letter === letter
      );
      const courseGrade = courseGradeDistribution.distribution.find(
        (grade) => grade.letter === letter
      );

      const classPercent =
        classTotal > 0 && classGrade
          ? Math.round(((classGrade.count ?? 0) / classTotal) * 1000) / 10
          : classGrade?.percentage
            ? Math.round(classGrade.percentage * 1000) / 10
            : 0;
      const coursePercent =
        courseTotal > 0 && courseGrade
          ? Math.round(((courseGrade.count ?? 0) / courseTotal) * 1000) / 10
          : courseGrade?.percentage
            ? Math.round(courseGrade.percentage * 1000) / 10
            : 0;

      return {
        letter,
        class: classPercent,
        course: coursePercent,
      };
    });
  }, [gradeDistribution, courseGradeDistribution]);

  return (
    <Box className={styles.root}>
      <Container size="3">
        <ResponsiveContainer width="100%" height={450}>
          <BarChart width={730} height={450} data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--border-color)"
            />
            <XAxis
              dataKey="letter"
              tickMargin={8}
              tick={{ fill: "var(--paragraph-color)", fontSize: 12 }}
              stroke="var(--label-color)"
            />
            <YAxis tickFormatter={toPercent} />
            <Tooltip
              cursor={{
                fill: "var(--border-color)",
                fillOpacity: 0.5,
              }}
              content={(props) => {
                return (
                  <HoverCard
                    content={props.label}
                    data={props.payload?.map((v, index) => {
                      const name = v.name?.valueOf();
                      return {
                        key: `${name}-${index}`,
                        label: "All Semesters",
                        value:
                          typeof v.value === "number"
                            ? toPercent(v.value)
                            : "N/A",
                        color: v.fill,
                      };
                    })}
                  />
                );
              }}
            />
            {gradeDistribution.average && (
              <Bar
                dataKey="class"
                fill="var(--blue-500)"
                name="class"
                radius={[5, 5, 0, 0]}
              />
            )}
            <Bar
              dataKey="course"
              fill="var(--amber-500)"
              name="course"
              radius={[5, 5, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Container>
    </Box>
  );
}
