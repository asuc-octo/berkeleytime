import { useMemo } from "react";

import { Tooltip } from "radix-ui";

import { GradeDistribution } from "@/lib/api";

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

export function ColoredGrade({ grade, style }: ColoredGradeProps) {
  const color = useMemo(
    () =>
      grade === "N/A" || grade.includes("% P")
        ? "var(--paragraph-color)"
        : grade === "A+" || grade === "A" || grade === "A-"
          ? "var(--emerald-500)"
          : grade === "B+" || grade === "B" || grade === "B-"
            ? "var(--amber-500)"
            : "var(--rose-500)",
    [grade]
  );
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
  const LETTER_GRADE_SET = useMemo(
    () =>
      new Set([
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
      ]),
    []
  );

  const PASS_GRADE_SET = useMemo(() => new Set(["P", "S"]), []);

  const hasLetterGrades = useMemo(
    () =>
      distribution.some(
        (grade) =>
          LETTER_GRADE_SET.has(grade.letter) && (grade.count ?? 0) > 0
      ),
    [distribution, LETTER_GRADE_SET]
  );

  const passFailPercent = useMemo(() => {
    if (hasLetterGrades) return null;

    const totals = distribution.reduce(
      (acc, grade) => {
        const count = grade.count ?? 0;
        if (PASS_GRADE_SET.has(grade.letter)) {
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
      const percentage = Math.round((totals.passCount / totals.totalCount) * 100);
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
  }, [distribution, hasLetterGrades, PASS_GRADE_SET]);
  const text = useMemo(() => {
    if (passFailPercent !== null) return `${passFailPercent}% P`;

    if (!average) return "";

    return average > 4
      ? "A+"
      : average > 3.7
        ? "A"
        : average > 3.5
          ? "A-"
          : average > 3
            ? "B+"
            : average > 2.7
              ? "B"
              : average > 2.5
                ? "B-"
                : average > 2
                  ? "C+"
                  : average > 1.7
                    ? "C"
                    : average > 1.5
                      ? "C-"
                      : average > 1
                        ? "D+"
                        : average > 0.7
                          ? "D"
                          : average
                            ? "D-"
                            : "F";
  }, [average, passFailPercent]);

  const color = useMemo(() => {
    if (passFailPercent !== null) return "var(--paragraph-color)";

    if (!average) return "var(--paragraph-color)";

    return average > 3.5
      ? "var(--emerald-500)"
      : average > 2.5
        ? "var(--amber-500)"
        : "var(--rose-500)";
  }, [average, passFailPercent]);

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
                <span style={{ color }}>
                  {passFailPercent}% P
                </span>{" "}
                {tooltip}.
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
