import { useMemo } from "react";

import styles from "./AverageGrade.module.scss";

interface AverageGradeProps {
  averageGrade?: number;
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
        ? "var(--gray-500)"
        : averageGrade > 3.5
          ? "var(--green-500)"
          : averageGrade > 2.5
            ? "var(--yellow-500)"
            : "var(--red-500)",
    [averageGrade]
  );

  return (
    <div className={styles.root} style={{ color }}>
      {text}
    </div>
  );
}
