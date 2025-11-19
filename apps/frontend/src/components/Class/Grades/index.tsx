import { useMemo } from "react";

import { ArrowUpRight, Reports } from "iconoir-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Box, Button, Container, HoverCard } from "@repo/theme";

import useClass from "@/hooks/useClass";
import { GRADES } from "@/lib/grades";
import { decimalToPercentString } from "@/utils/number-formatter";

import styles from "./Grades.module.scss";

const toPercent = (decimal: number) => {
  return decimalToPercentString(decimal, 1).replace(/\.0%$/, "%");
};

export default function Grades() {
  const {
    class: {
      subject,
      courseNumber,
      gradeDistribution,
      course: { gradeDistribution: courseGradeDistribution },
    },
  } = useClass();

  const hasNoGradeData = useMemo(() => {
    const classTotal =
      gradeDistribution.distribution?.reduce(
        (acc, grade) => acc + (grade.count ?? 0),
        0
      ) ?? 0;
    const courseTotal =
      courseGradeDistribution.distribution?.reduce(
        (acc, grade) => acc + (grade.count ?? 0),
        0
      ) ?? 0;

    return (
      classTotal === 0 &&
      courseTotal === 0 &&
      !gradeDistribution.average &&
      !courseGradeDistribution.average
    );
  }, [gradeDistribution, courseGradeDistribution]);

  const { data, courseTotal } = useMemo(() => {
    const getTotal = (distribution: typeof gradeDistribution.distribution) =>
      distribution?.reduce((acc, grade) => acc + (grade.count ?? 0), 0) ?? 0;

    const classTotalCount = getTotal(gradeDistribution.distribution);
    const courseTotalCount = getTotal(
      courseGradeDistribution.distribution ?? []
    );

    const mapped = GRADES.map((letter) => {
      const classGrade = gradeDistribution.distribution?.find(
        (grade) => grade.letter === letter
      );
      const courseGrade = courseGradeDistribution.distribution?.find(
        (grade) => grade.letter === letter
      );

      const classPercent =
        classTotalCount > 0 && classGrade
          ? Math.round(((classGrade.count ?? 0) / classTotalCount) * 1000) / 10
          : 0;
      const coursePercent =
        courseTotalCount > 0 && courseGrade
          ? Math.round(((courseGrade.count ?? 0) / courseTotalCount) * 1000) /
            10
          : 0;

      return {
        letter,
        class: classPercent,
        course: coursePercent,
      };
    });

    return {
      data: mapped,
      courseTotal: courseTotalCount,
    };
  }, [gradeDistribution, courseGradeDistribution]);

  const gradeExplorerUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set("input", `${subject};${courseNumber}`);

    if (typeof window !== "undefined") {
      try {
        const url = new URL(window.location.origin);
        if (url.hostname === "localhost") {
          url.port = "8080";
        }
        url.pathname = "/grades";
        url.search = params.toString();
        return url.toString();
      } catch {
        // ignore and fall back
      }
    }

    return `http://localhost:8080/grades?${params.toString()}`;
  }, [subject, courseNumber]);

  const subtitle = useMemo(() => {
    if (!courseTotal || courseTotal <= 0) return null;
    const gradesLabel = courseTotal === 1 ? "grade" : "grades";
    return `From ${courseTotal.toLocaleString()} course ${gradesLabel}`;
  }, [courseTotal]);

  if (hasNoGradeData) {
    return (
      <div className={styles.placeholder}>
        <Reports width={32} height={32} />
        <p className={styles.heading}>No Grade Data Available</p>
        <p className={styles.paragraph}>
          This course doesn't have any historical grade data yet.
          <br />
          Grade distributions will appear here once students complete the
          course.
        </p>
      </div>
    );
  }

  return (
    <Box p="5" className={styles.root}>
      <Container size="3">
        <div className={styles.wrapper}>
          <div className={styles.header}>
            <div className={styles.titleBlock}>
              <h2 className={styles.title}>Historical Grade Distribution</h2>
              {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            </div>
            <Button
              as="a"
              href={gradeExplorerUrl}
              target="_blank"
              rel="noreferrer noopener"
              variant="secondary"
              className={styles.openButton}
            >
              Open in Grades
              <ArrowUpRight height={16} width={16} />
            </Button>
          </div>
          <div className={styles.chart}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart width={730} height={450} data={data}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border-color)"
                />
                <XAxis
                  dataKey="letter"
                  tickMargin={8}
                  tick={{
                    fill: "var(--paragraph-color)",
                    fontSize: "var(--text-14)",
                  }}
                  stroke="var(--label-color)"
                />
                <YAxis
                  tickFormatter={toPercent}
                  tick={{
                    fill: "var(--paragraph-color)",
                    fontSize: "var(--text-14)",
                  }}
                />
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
                            label:
                              name === "class" ? "This Class" : "All semesters",
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
                <Bar
                  dataKey="course"
                  stackId="grade"
                  fill="var(--blue-500)"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Container>
    </Box>
  );
}
