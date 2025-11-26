import { useRef } from "react";

import { Eye, EyeClosed, Trash } from "iconoir-react";

import { Card, ColoredSquare } from "@repo/theme";

import { AverageGrade } from "@/components/AverageGrade";
import {
  useReadCourseGradeDist,
  useReadCourseTitle,
} from "@/hooks/api/courses/useReadCourse";
import { IGradeDistribution } from "@/lib/api";

import styles from "./CourseSelectionCard.module.scss";

interface CourseSelectionCardProps {
  color: string;
  subject: string;
  number: string;
  title?: string;
  metadata: string;
  gradeDistribution?: IGradeDistribution;
  loadGradeDistribution?: boolean;
  onClick: () => void;
  onClickDelete: () => void;
  onClickHide: () => void;
  active: boolean;
  hidden: boolean;
}

export default function CourseSelectionCard({
  color,
  subject,
  number,
  title,
  metadata,
  gradeDistribution,
  loadGradeDistribution = true,
  onClick,
  onClickDelete,
  onClickHide,
  active,
  hidden,
}: CourseSelectionCardProps) {
  const hideRef = useRef<HTMLDivElement>(null);
  const deleteRef = useRef<HTMLDivElement>(null);

  const { data: titleData } = useReadCourseTitle(subject, number, {
    skip: !!title,
  });
  const { data: courseGradeData } = useReadCourseGradeDist(subject, number, {
    skip: !!gradeDistribution || !loadGradeDistribution,
  });

  const displayTitle = title ?? titleData?.title ?? "N/A";
  const displayGradeDistribution =
    gradeDistribution ?? courseGradeData?.gradeDistribution;

  return (
    <Card.Root
      className={styles.card}
      active={active}
      disabled={hidden}
      onClick={(event) => {
        if (
          hideRef.current &&
          !hideRef.current.contains(event.target as Node) &&
          deleteRef.current &&
          !deleteRef.current.contains(event.target as Node)
        ) {
          onClick();
        }
      }}
    >
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <ColoredSquare
              color={color}
              size="lg"
            />
            <span className={styles.courseCode}>{subject} {number}</span>
          </div>

          <div className={styles.headerActions}>
            {displayGradeDistribution && (
              <AverageGrade gradeDistribution={displayGradeDistribution} />
            )}
            <div
              onClick={onClickHide}
              ref={hideRef}
              className={styles.icon}
            >
              {!hidden ? <Eye /> : <EyeClosed />}
            </div>
            <div
              onClick={onClickDelete}
              ref={deleteRef}
              className={styles.icon}
            >
              <Trash />
            </div>
          </div>
        </div>

        <div className={styles.body}>
          <div className={styles.title}>
            {displayTitle}
          </div>
          <div className={styles.metadata}>{metadata}</div>
        </div>
      </div>
    </Card.Root>
  );
}
