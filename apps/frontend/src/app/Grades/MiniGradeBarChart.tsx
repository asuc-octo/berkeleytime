import { useMemo } from "react";

import { Tooltip } from "@repo/theme";

import { IGradeDistribution } from "@/lib/api";
import { LETTER_GRADES } from "@/lib/grades";

import styles from "./MiniGradeBarChart.module.scss";

interface MiniGradeBarChartProps {
  gradeDistribution?: IGradeDistribution | null;
}

const GRADE_COLOR_MAP = {
  gradeA: styles.gradeA,
  gradeB: styles.gradeB,
  gradeC: styles.gradeC,
  gradeLow: styles.gradeLow,
} as const;

type GradeColor = keyof typeof GRADE_COLOR_MAP;

const GRADE_BINS: { letter: string; colorClass: GradeColor }[] = [
  { letter: "A+", colorClass: "gradeA" },
  { letter: "A", colorClass: "gradeA" },
  { letter: "A-", colorClass: "gradeA" },
  { letter: "B+", colorClass: "gradeB" },
  { letter: "B", colorClass: "gradeB" },
  { letter: "B-", colorClass: "gradeB" },
  { letter: "C+", colorClass: "gradeC" },
  { letter: "C", colorClass: "gradeC" },
  { letter: "C-", colorClass: "gradeC" },
  { letter: "D+", colorClass: "gradeLow" },
  { letter: "D", colorClass: "gradeLow" },
  { letter: "D-", colorClass: "gradeLow" },
  { letter: "F", colorClass: "gradeLow" },
];

interface Segment {
  letter: string;
  colorClass: GradeColor;
  percentage: number;
}

export default function MiniGradeBarChart({
  gradeDistribution,
}: MiniGradeBarChartProps) {
  const segments = useMemo<Segment[] | null>(() => {
    if (!gradeDistribution?.distribution) return null;

    const countsByLetter = new Map(
      gradeDistribution.distribution.map((grade) => [grade.letter, grade.count])
    );

    const total = LETTER_GRADES.reduce(
      (acc, letter) => acc + (countsByLetter.get(letter) ?? 0),
      0
    );

    if (total === 0) return null;

    const result: Segment[] = [];

    for (const bin of GRADE_BINS) {
      const count = countsByLetter.get(bin.letter) ?? 0;
      if (count === 0) continue;

      result.push({
        letter: bin.letter,
        colorClass: bin.colorClass,
        percentage: (count / total) * 100,
      });
    }

    return result.length > 0 ? result : null;
  }, [gradeDistribution]);

  if (!segments) {
    return <div className={styles.emptyBar} />;
  }

  return (
    <div className={styles.bar}>
      {segments.map((seg) => (
        <Tooltip
          key={seg.letter}
          trigger={
            <div
              className={`${styles.segment} ${GRADE_COLOR_MAP[seg.colorClass]}`}
              style={{ width: `${seg.percentage}%` }}
            />
          }
          title={seg.letter}
          description={`${seg.percentage.toFixed(1)}%`}
        />
      ))}
    </div>
  );
}
