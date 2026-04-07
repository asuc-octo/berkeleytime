import { useMemo } from "react";

import { AverageGrade, ColoredGrade } from "@/components/AverageGrade";
import CourseSideMetrics, {
  type CourseMetric,
} from "@/components/CourseSideMetrics";
import { useReadCourseGradeDist, useReadCourseTitle } from "@/hooks/api";
import { IGradeDistribution } from "@/lib/api";
import { Semester } from "@/lib/generated/graphql";
import { LETTER_GRADES } from "@/lib/grades";

interface DataBoardProps {
  color: string;
  subject: string;
  courseNumber: string;
  gradeDistribution?: IGradeDistribution;
  givenName?: string;
  familyName?: string;
  semester?: Semester;
  year?: number;
  hoveredLetter: string | null;
}

const GRADE_STYLE = { display: "inline-block", marginRight: "4px" };

function addOrdinalSuffix(n: string) {
  if (n === "11" || n === "12" || n === "13") return n + "th";

  switch (n.charAt(n.length - 1)) {
    case "1":
      return n + "st";
    case "2":
      return n + "nd";
    case "3":
      return n + "rd";
    default:
      return n + "th";
  }
}

export default function DataBoard({
  color,
  subject,
  courseNumber,
  gradeDistribution,
  givenName,
  familyName,
  semester,
  year,
  hoveredLetter,
}: DataBoardProps) {
  const { data: courseData } = useReadCourseGradeDist(subject, courseNumber);
  const { data: courseTitleData } = useReadCourseTitle(subject, courseNumber);

  const courseGradeDist = useMemo(
    () => courseData?.gradeDistribution ?? null,
    [courseData]
  );

  const {
    lower: lowerPercentile,
    upper: upperPercentile,
    count: hoveredCount,
    total: gradeDistTotal,
  } = useMemo(() => {
    const ret: {
      lower: string | null;
      upper: string | null;
      count: number | null;
      total: number;
    } = { lower: null, upper: null, count: null, total: 0 };
    if (!gradeDistribution || !hoveredLetter) return ret;

    // Calculate total excluding P/NP grades
    ret.total =
      gradeDistribution.distribution?.reduce((acc, g) => {
        // Only count letter grades (A+ through F), exclude P and NP
        if (
          LETTER_GRADES.includes(g.letter as (typeof LETTER_GRADES)[number])
        ) {
          return acc + g.count;
        }
        return acc;
      }, 0) ?? 0;

    // Use only letter grades for percentile calculation
    LETTER_GRADES.reduce((acc, grade) => {
      if (grade === hoveredLetter) {
        const upperValue =
          ret.total > 0
            ? (((ret.total - acc) * 100) / ret.total).toFixed(0)
            : "0";
        ret.upper = addOrdinalSuffix(upperValue);
      }
      const count =
        gradeDistribution.distribution?.find((g) => g.letter === grade)
          ?.count ?? 0;
      acc += count;
      if (grade === hoveredLetter) {
        const lowerValue =
          ret.total > 0
            ? (((ret.total - acc) * 100) / ret.total).toFixed(0)
            : "0";
        ret.lower = addOrdinalSuffix(lowerValue);
        ret.count = count;
      }
      return acc;
    }, 0);
    return ret;
  }, [hoveredLetter, gradeDistribution]);

  const title = gradeDistribution
    ? `${subject} ${courseNumber}`
    : "No Class Selected";

  const metadata = gradeDistribution
    ? `${semester && year ? `${semester} ${year}` : "All Semesters"} • ${
        givenName && familyName
          ? `${givenName} ${familyName}`
          : "All Instructors"
      }`
    : "No Semester or Instructor Data";

  const metrics: CourseMetric[] = [
    {
      label: "Course Average",
      value: courseGradeDist ? (
        <span>
          <AverageGrade
            style={GRADE_STYLE}
            gradeDistribution={courseGradeDist}
          />
          ({courseGradeDist.average?.toFixed(3)})
        </span>
      ) : (
        "No data"
      ),
    },
    {
      label: "Section Average",
      value: gradeDistribution ? (
        <>
          <AverageGrade
            style={GRADE_STYLE}
            gradeDistribution={gradeDistribution}
            tooltip="for this instructor/semester combination"
          />
          ({gradeDistribution.average?.toFixed(3)})
        </>
      ) : (
        "No data"
      ),
    },
  ];

  if (hoveredLetter) {
    // Only show percentile for letter grades (not P/NP)
    if (
      LETTER_GRADES.includes(hoveredLetter as (typeof LETTER_GRADES)[number])
    ) {
      metrics.push({
        label: `${lowerPercentile} - ${upperPercentile} Percentile`,
        value: (
          <>
            <ColoredGrade style={GRADE_STYLE} grade={hoveredLetter} />(
            {hoveredCount}/{gradeDistTotal},{" "}
            {(((hoveredCount ?? 0) / gradeDistTotal) * 100).toFixed(1)}%)
          </>
        ),
      });
    } else {
      // For P/NP grades, just show the count without percentile
      const pnpCount =
        gradeDistribution?.distribution?.find((g) => g.letter === hoveredLetter)
          ?.count ?? 0;
      const totalAll =
        gradeDistribution?.distribution?.reduce((acc, g) => acc + g.count, 0) ??
        0;
      metrics.push({
        label: hoveredLetter,
        value: (
          <>
            <ColoredGrade style={GRADE_STYLE} grade={hoveredLetter} />(
            {pnpCount}/{totalAll}, {((pnpCount / totalAll) * 100).toFixed(1)}%)
          </>
        ),
      });
    }
  }

  return (
    <CourseSideMetrics
      color={color}
      courseTitle={title}
      classTitle={courseTitleData?.title ?? undefined}
      metadata={metadata}
      metrics={metrics}
    />
  );
}
