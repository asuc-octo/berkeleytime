import { useMemo } from "react";

import { Tooltip } from "@repo/theme";

import { getLetterGradeFromGPA } from "@/lib/grades";

import styles from "./AverageGrade.module.scss";

interface ColoredGradeProps {
  grade: string;
  style?: React.CSSProperties;
}

interface AverageGradeProps {
  gradeDistribution: {
    average?: number | null;
    pnpPercentage?: number | null;
  };
  style?: React.CSSProperties;
  tooltip?: string;
}

function getGradeColor(grade: string): string {
  if (grade === "N/A") {
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
  gradeDistribution: { average, pnpPercentage },
  style,
  tooltip = "across all semesters this course has been offered",
}: AverageGradeProps) {
  const isPnp =
    !average && pnpPercentage !== null && pnpPercentage !== undefined;

  const passRate = useMemo(() => {
    if (pnpPercentage === null || pnpPercentage === undefined) {
      return null;
    }
    return Math.round(pnpPercentage * 100);
  }, [pnpPercentage]);

  const text = useMemo(() => {
    if (average) {
      return getLetterGradeFromGPA(average);
    }
    if (passRate !== null) {
      return `${passRate}% P`;
    }
    return "";
  }, [average, passRate]);

  const color = useMemo(
    () => (isPnp ? "var(--paragraph-color)" : getGradeColor(text)),
    [isPnp, text]
  );

  // Show if either average or pnpPercentage is available
  if (!average && (pnpPercentage === null || pnpPercentage === undefined)) {
    return null;
  }

  return (
    <Tooltip
      trigger={
        <div className={styles.trigger} style={{ color, ...style }}>
          {text}
        </div>
      }
      title={isPnp ? "Pass Rate" : "Average Grade"}
      description={
        isPnp ? (
          <>
            <span>{passRate!}% of students</span> have passed this course{" "}
            {tooltip}.
          </>
        ) : (
          <>
            Students have received {["A", "F"].includes(text[0]) ? "an " : "a "}
            <span style={{ color }}>
              {text} ({average!.toLocaleString()})
            </span>{" "}
            in this course on average {tooltip}.
          </>
        )
      }
    />
  );
}
