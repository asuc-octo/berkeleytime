import { useMemo } from "react";

import { Reports } from "iconoir-react";
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
import ClassChartBox from "@/components/Class/ClassChartBox";
import { useGetClassGrades } from "@/hooks/api/classes/useGetClass";
import useClass from "@/hooks/useClass";
import { GRADES } from "@/lib/grades";

import styles from "./Grades.module.scss";

const chartConfig = createChartConfig(["course"], {
  labels: { course: "All semesters" },
  colors: { course: "var(--blue-500)" },
});

export default function Grades() {
  const {
    class: { subject, courseNumber, number, semester, year, sessionId },
  } = useClass();
  const { data, loading } = useGetClassGrades(
    year,
    semester,
    sessionId,
    subject,
    courseNumber,
    number
  );
  const courseGradeDistribution = data?.course?.gradeDistribution;

  const hasNoGradeData = useMemo(() => {
    if (!courseGradeDistribution) return true;
    type GradeEntry = NonNullable<
      NonNullable<typeof courseGradeDistribution>["distribution"]
    >[number];
    const distribution: GradeEntry[] =
      (courseGradeDistribution.distribution?.filter(
        (grade): grade is GradeEntry => Boolean(grade)
      ) as GradeEntry[]) ?? [];
    const courseTotal = distribution.reduce<number>((acc, grade) => {
      return acc + (grade.count ?? 0);
    }, 0);

    return courseTotal === 0 && !courseGradeDistribution.average;
  }, [courseGradeDistribution]);

  const { data: chartData, courseTotal } = useMemo(() => {
    if (!courseGradeDistribution) {
      return {
        data: [],
        courseTotal: 0,
      };
    }

    type GradeEntry = NonNullable<
      NonNullable<typeof courseGradeDistribution>["distribution"]
    >[number];
    const distribution: GradeEntry[] =
      (courseGradeDistribution.distribution?.filter(
        (grade): grade is GradeEntry => Boolean(grade)
      ) as GradeEntry[]) ?? [];
    const courseTotalCount = distribution.reduce<number>((acc, grade) => {
      return acc + (grade.count ?? 0);
    }, 0);

    const mapped = GRADES.map((letter) => {
      const courseGrade = distribution.find(
        (grade: GradeEntry) => grade.letter === letter
      );

      const coursePercent =
        courseTotalCount > 0 && courseGrade
          ? Math.round(((courseGrade.count ?? 0) / courseTotalCount) * 1000) /
            10
          : 0;

      return {
        letter,
        course: coursePercent,
      };
    });

    return {
      data: mapped,
      courseTotal: courseTotalCount,
    };
  }, [courseGradeDistribution]);

  const gradeExplorerUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set("input", `${subject};${courseNumber}`);

    if (typeof window !== "undefined") {
      try {
        const url = new URL(window.location.origin);
        url.pathname = "/grades";
        url.search = params.toString();
        return url.toString();
      } catch {
        // ignore and fall back
      }
    }

    return `/grades?${params.toString()}`;
  }, [subject, courseNumber]);

  const subtitle = useMemo(() => {
    if (!courseTotal || courseTotal <= 0) return null;
    const gradesLabel = courseTotal === 1 ? "grade" : "grades";
    return `From ${courseTotal.toLocaleString()} course ${gradesLabel}`;
  }, [courseTotal]);

  const emptyState = hasNoGradeData
    ? {
        icon: <Reports width={32} height={32} />,
        heading: "No Grade Data Available",
        paragraph: (
          <>
            This course doesn&apos;t have any historical grade data yet.
            <br />
            Grade distributions will appear here once students complete the
            course.
          </>
        ),
      }
    : undefined;

  return (
    <ClassChartBox
      title="Historical Grade Distribution"
      subtitle={subtitle}
      actionLabel="Open in Grades"
      actionHref={gradeExplorerUrl}
      loading={loading && !data}
      emptyState={emptyState}
    >
      <ChartContainer config={chartConfig} className={styles.chart}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart width={730} height={450} data={chartData}>
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
              tickFormatter={(v) => formatters.percent(v, 1)}
              tick={{
                fill: "var(--paragraph-color)",
                fontSize: "var(--text-14)",
              }}
            />
            <ChartTooltip
              tooltipConfig={{
                labelFormatter: (label) => `Grade: ${label}`,
                valueFormatter: (value) => formatters.percent(value, 1),
                indicator: "square",
              }}
            />
            <Bar
              dataKey="course"
              fill="var(--blue-500)"
              radius={[5, 5, 0, 0]}
              name="All semesters"
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </ClassChartBox>
  );
}
