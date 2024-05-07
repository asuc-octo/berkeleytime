import { useMemo } from "react";

import * as Tooltip from "@radix-ui/react-tooltip";

import styles from "./AverageGrade.module.scss";

interface AverageGradeProps {
  gradeAverage: number | null;
}

export default function AverageGrade({ gradeAverage }: AverageGradeProps) {
  const text = useMemo(
    () =>
      !gradeAverage
        ? "N/A"
        : gradeAverage > 4
          ? "A+"
          : gradeAverage > 3.7
            ? "A"
            : gradeAverage > 3.5
              ? "A-"
              : gradeAverage > 3
                ? "B+"
                : gradeAverage > 2.7
                  ? "B"
                  : gradeAverage > 2.5
                    ? "B-"
                    : gradeAverage > 2
                      ? "C+"
                      : gradeAverage > 1.7
                        ? "C"
                        : gradeAverage > 1.5
                          ? "C-"
                          : gradeAverage > 1
                            ? "D+"
                            : gradeAverage > 0.7
                              ? "D"
                              : gradeAverage
                                ? "D-"
                                : "F",
    [gradeAverage]
  );

  const color = useMemo(
    () =>
      !gradeAverage
        ? "var(--paragraph-color)"
        : gradeAverage > 3.5
          ? "var(--emerald-500)"
          : gradeAverage > 2.5
            ? "var(--amber-500)"
            : "var(--rose-500)",
    [gradeAverage]
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
            {gradeAverage ? (
              <p className={styles.description}>
                Students have received{" "}
                {["A", "F"].includes(text[0]) ? "an " : "a "}
                <span style={{ color }}>
                  {text} ({gradeAverage.toLocaleString()})
                </span>{" "}
                in this course on average based on performance across all
                semesters this course has been offered.
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
