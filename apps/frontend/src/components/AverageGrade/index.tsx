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
  gradeDistribution: { average },
  style,
  tooltip = "across all semesters this course has been offered",
}: AverageGradeProps) {
  const text = useMemo(() => {
    if (!average) {
      return "";
    }
    return getLetterGradeFromGPA(average);
  }, [average]);

  const color = useMemo(() => getGradeColor(text), [text]);

  if (!average) {
    return null;
  }

  return (
    <Tooltip.Root disableHoverableContent>
      <Tooltip.Trigger asChild>
        <div className={styles.trigger} style={{ color, ...style }}>
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
            <p className={styles.description}>
              Students have received{" "}
              {["A", "F"].includes(text[0]) ? "an " : "a "}
              <span style={{ color }}>
                {text} ({average.toLocaleString()})
              </span>{" "}
              in this course on average {tooltip}.
            </p>
          </div>
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
