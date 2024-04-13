import { useMemo } from "react";

import * as Tooltip from "@radix-ui/react-tooltip";

import styles from "./AverageGrade.module.scss";

interface AverageGradeProps {
  averageGrade: number | null;
}

export default function AverageGrade({ averageGrade }: AverageGradeProps) {
  const text = useMemo(
    () =>
      !averageGrade
        ? "N/A"
        : averageGrade > 4
          ? "A+"
          : averageGrade > 3.7
            ? "A"
            : averageGrade > 3.5
              ? "A-"
              : averageGrade > 3
                ? "B+"
                : averageGrade > 2.7
                  ? "B"
                  : averageGrade > 2.5
                    ? "B-"
                    : averageGrade > 2
                      ? "C+"
                      : averageGrade > 1.7
                        ? "C"
                        : averageGrade > 1.5
                          ? "C-"
                          : averageGrade > 1
                            ? "D+"
                            : averageGrade > 0.7
                              ? "D"
                              : averageGrade
                                ? "D-"
                                : "F",
    [averageGrade]
  );

  const color = useMemo(
    () =>
      !averageGrade
        ? "var(--paragraph-color)"
        : averageGrade > 3.5
          ? "var(--green-500)"
          : averageGrade > 2.5
            ? "var(--yellow-500)"
            : "var(--red-500)",
    [averageGrade]
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
            {averageGrade ? (
              <p className={styles.description}>
                Students have received a <span style={{ color }}>{text}</span>{" "}
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
