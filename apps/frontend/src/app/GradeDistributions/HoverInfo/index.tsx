import { useMemo } from "react";

import { ColorSquare } from "@repo/theme";

import { AverageGrade, ColoredGrade } from "@/components/AverageGrade";
import { useReadCourseGradeDist } from "@/hooks/api";
import { GradeDistribution, Semester } from "@/lib/api";

import styles from "./HoverInfo.module.scss";

interface HoverInfoProps {
  color: string;
  subject: string;
  courseNumber: string;
  gradeDistribution?: GradeDistribution;
  givenName?: string;
  familyName?: string;
  semester?: Semester;
  year?: number;
  hoveredLetter: string | null;
}

const GRADE_STYLE = { display: "inline-block", marginRight: "4px" };
const GRADE_ORDER = [
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
];

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

export default function HoverInfo({
  color,
  subject,
  courseNumber,
  gradeDistribution,
  givenName,
  familyName,
  semester,
  year,
  hoveredLetter,
}: HoverInfoProps) {
  const { data: courseData } = useReadCourseGradeDist(subject, courseNumber);

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
    ret.total = gradeDistribution.distribution.reduce(
      (acc, g) => acc + g.count,
      0
    );
    if (hoveredLetter === "NP" || hoveredLetter === "P")
      return {
        lower: "N/A",
        upper: "N/A",
        count:
          gradeDistribution.distribution.find((g) => g.letter === hoveredLetter)
            ?.count ?? 0,
        total: ret.total,
      };
    GRADE_ORDER.reduce((acc, grade) => {
      if (grade === hoveredLetter)
        ret.upper = addOrdinalSuffix(
          (((ret.total - acc) * 100) / ret.total).toFixed(0)
        );
      const count =
        gradeDistribution.distribution.find((g) => g.letter === grade)?.count ??
        0;
      acc += count;
      if (grade === hoveredLetter) {
        ret.lower = addOrdinalSuffix(
          (((ret.total - acc) * 100) / ret.total).toFixed(0)
        );
        ret.count = count;
      }
      return acc;
    }, 0);
    return ret;
  }, [hoveredLetter, gradeDistribution]);

  return (
    <div className={styles.info}>
      <div className={styles.heading}>
        <span className={styles.course}>
          <ColorSquare color={color} />
          {subject} {courseNumber}
        </span>
      </div>
      {gradeDistribution && (
        <div className={styles.distType}>
          {givenName && familyName
            ? `${givenName} ${familyName} `
            : "All Instructors "}
          •{semester && year ? ` ${semester} ${year}` : " All Semesters"}
        </div>
      )}
      <div className={styles.label}>Course Average</div>
      <div className={styles.value}>
        {courseGradeDist && gradeDistribution ? (
          <span>
            <AverageGrade
              style={GRADE_STYLE}
              gradeDistribution={courseGradeDist}
            />
            ({gradeDistribution.average?.toFixed(3)})
          </span>
        ) : (
          "No data"
        )}
      </div>
      <div className={styles.label}>Section Average</div>
      <div className={styles.value}>
        {gradeDistribution && (
          <AverageGrade
            style={GRADE_STYLE}
            gradeDistribution={gradeDistribution}
            tooltip="for this instructor/semester combination"
          />
        )}
        {gradeDistribution
          ? `(${gradeDistribution.average?.toFixed(3)}`
          : "No data"}
      </div>
      {hoveredLetter && (
        <div>
          <div className={styles.label}>
            {lowerPercentile} - {upperPercentile} Percentile
          </div>
          <div className={styles.value}>
            <ColoredGrade style={GRADE_STYLE} grade={hoveredLetter} />(
            {hoveredCount}/{gradeDistTotal},{" "}
            {(((hoveredCount ?? 0) / gradeDistTotal) * 100).toFixed(1)}%)
          </div>
        </div>
      )}
    </div>
  );
}
