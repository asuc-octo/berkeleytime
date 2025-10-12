import { useMemo } from "react";

import { Tooltip } from "radix-ui";

import { GradeDistribution } from "@/lib/api";
import { getLetterGradeFromGPA } from "@/lib/grades";

import styles from "./AverageGrade.module.scss";

interface ColoredGradeProps {
  grade: string;
  style?: React.CSSProperties;
}

interface AverageGradeProps {
  gradeDistribution: GradeDistribution;
  style?: React.CSSProperties;
  tooltip?: string;
}

const LETTER_GRADES = new Set([
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
]);

const PASS_GRADES = new Set(["P", "S"]);


function getGradeColor(grade: string): string {
  if (grade === "N/A" || grade.includes("% P")) {
    return "var(--paragraph-color)";
  }

  const firstLetter = grade[0];
  if (firstLetter === "A") return "var(--emerald-500)";
  if (firstLetter === "B") return "var(--amber-500)";
  return "var(--rose-500)";
}

export function ColoredGrade({ grade, style }: ColoredGradeProps) {
  const color = useMemo(() => getGradeColor(grade), [grade]);

  return (
    <div className={styles.trigger} style={{ color, ...style }}>
      {grade}
    </div>
  );
}

export function AverageGrade({
  gradeDistribution,
  style,
  tooltip = "across all semesters this course has been offered",
}: AverageGradeProps) {
  const average = gradeDistribution?.average ?? null;
  const distribution = gradeDistribution?.distribution ?? [];

  const hasLetterGrades = useMemo(
    () =>
      distribution.some(
        (grade) => LETTER_GRADES.has(grade.letter) && (grade.count ?? 0) > 0
      ),
    [distribution]
  );

  const passFailPercent = useMemo(() => {
    if (hasLetterGrades) return null;

    const totals = distribution.reduce(
      (acc, grade) => {
        const count = grade.count ?? 0;
        if (PASS_GRADES.has(grade.letter)) {
          acc.passCount += count;
          acc.passPercentage += grade.percentage ?? 0;
        } else if (grade.letter === "NP" || grade.letter === "U") {
          acc.failCount += count;
        } else {
          acc.otherCount += count;
        }
        acc.totalCount += count;
        return acc;
      },
      {
        passCount: 0,
        failCount: 0,
        otherCount: 0,
        totalCount: 0,
        passPercentage: 0,
      }
    );

    if (
      totals.passCount === 0 &&
      totals.passPercentage === 0 &&
      totals.totalCount === 0
    ) {
      return null;
    }

    if (totals.totalCount > 0) {
      const percentage = Math.round(
        (totals.passCount / totals.totalCount) * 100
      );
      if (Number.isFinite(percentage)) {
        return Math.min(100, Math.max(0, percentage));
      }
    }

    if (totals.passPercentage > 0) {
      const percentage = Math.round(totals.passPercentage * 100);
      if (Number.isFinite(percentage)) {
        return Math.min(100, Math.max(0, percentage));
      }
    }

    return null;
  }, [distribution, hasLetterGrades]);

  const text = useMemo(() => {
    if (passFailPercent !== null) {
      return `${passFailPercent}% P`;
    }
    if (!average) {
      return "";
    }
    return getLetterGradeFromGPA(average);
  }, [average, passFailPercent]);

  const color = useMemo(() => getGradeColor(text), [text]);

  return (
    <Tooltip.Root disableHoverableContent>
      <Tooltip.Trigger asChild>
        <ColoredGrade style={style} grade={text} />
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          asChild
          side="bottom"
          sideOffset={8}
          collisionPadding={8}
        >
          <div className={styles.content}>
            <Tooltip.Arrow className={styles.arrow} />
            <p className={styles.title}>Average grade</p>
            {passFailPercent !== null ? (
              <p className={styles.description}>
                Students received{" "}
                <span style={{ color }}>{passFailPercent}% P</span> {tooltip}.
              </p>
            ) : average ? (
              <p className={styles.description}>
                Students have received{" "}
                {["A", "F"].includes(text[0]) ? "an " : "a "}
                <span style={{ color }}>
                  {text} ({average.toLocaleString()})
                </span>{" "}
                in this course on average {tooltip}.
              </p>
            ) : (
              <p className={styles.description}>
                Either this course has not been previously offered, or the
                average grade is not available.
              </p>
            )}
          </div>
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
