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
      grade === "N/A"
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
  gradeDistribution: { average },
  style,
  tooltip = "across all semesters this course has been offered",
}: AverageGradeProps) {
  const text = useMemo(
    () =>
      !average
        ? "N/A"
        : average > 4
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
                                : "F",
    [average]
  );

  const color = useMemo(
    () =>
      !average
        ? "var(--paragraph-color)"
        : average > 3.5
          ? "var(--emerald-500)"
          : average > 2.5
            ? "var(--amber-500)"
            : "var(--rose-500)",
    [average]
  );

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
            {average ? (
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
