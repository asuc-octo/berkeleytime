import { useMemo } from "react";

import { Tooltip } from "@repo/theme";

import { IGradeDistribution } from "@/lib/api";
import { LETTER_GRADES } from "@/lib/grades";

import styles from "./MiniGradeBarChart.module.scss";

interface MiniGradeBarChartProps {
  gradeDistribution?: IGradeDistribution | null;
}

const GRADE_BINS = [
  { letter: "A+", color: "var(--orange-950)" },
  { letter: "A", color: "var(--orange-900)" },
  { letter: "A-", color: "var(--orange-800)" },
  { letter: "B+", color: "var(--orange-700)" },
  { letter: "B", color: "var(--orange-600)" },
  { letter: "B-", color: "var(--orange-500)" },
  { letter: "C+", color: "var(--orange-400)" },
  { letter: "C", color: "var(--orange-300)" },
  { letter: "C-", color: "var(--orange-200)" },
  { letter: "D+", color: "var(--orange-100)" },
  { letter: "D", color: "var(--orange-100)" },
  { letter: "D-", color: "var(--orange-50)" },
  { letter: "F", color: "var(--orange-50)" },
] as const;

interface Segment {
  letter: string;
  color: string;
  percentage: number;
  count: number;
  cumStart: number;
  cumEnd: number;
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

    let cumulative = 0;
    const result: Segment[] = [];

    for (const bin of GRADE_BINS) {
      const count = countsByLetter.get(bin.letter) ?? 0;
      if (count === 0) continue;

      const percentage = (count / total) * 100;
      const cumStart = cumulative;
      cumulative += percentage;

      result.push({
        letter: bin.letter,
        color: bin.color,
        percentage,
        count,
        cumStart,
        cumEnd: cumulative,
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
              className={styles.segment}
              style={{
                width: `${seg.percentage}%`,
                backgroundColor: seg.color,
              }}
            />
          }
          title={seg.letter}
          description={`${seg.percentage.toFixed(1)}% — percentile ${seg.cumStart.toFixed(0)}%–${seg.cumEnd.toFixed(0)}%`}
        />
      ))}
    </div>
  );
}
