import { useMemo } from "react";

import * as Tooltip from "@radix-ui/react-tooltip";

import { GradeDistribution } from "@/lib/api";

import styles from "./AverageGrade.module.scss";

interface AverageGradeProps {
  gradeDistribution: GradeDistribution;
}

export default function AverageGrade({
  gradeDistribution: { average },
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
        <div className={styles.trigger} style={{ color }}>
          {text}
        </div>
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
                in this course on average across all semesters this course has
                been offered.
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
