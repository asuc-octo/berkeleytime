import classNames from "classnames";
import { Eye, EyeClosed, Trash } from "iconoir-react";

import ClassCard from "@/components/ClassCard";
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
  onClick?: () => void;
  onClickDelete?: () => void;
  onClickHide?: () => void;
  active?: boolean;
  hidden?: boolean;
  dimmed?: boolean;
  fluid?: boolean;
  onMouseEnter?: React.MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLDivElement>;
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
  dimmed,
  fluid = false,
  onMouseEnter,
  onMouseLeave,
}: CourseSelectionCardProps) {
  const { data: titleData } = useReadCourseTitle(subject, number, {
    skip: !!title,
  });
  const { data: courseGradeData } = useReadCourseGradeDist(subject, number, {
    skip: !!gradeDistribution || !loadGradeDistribution,
  });

  const displayTitle = title ?? titleData?.title ?? "N/A";
  const displayGradeDistribution =
    gradeDistribution ?? courseGradeData?.gradeDistribution;
  const topRightContent =
    onClickHide || onClickDelete ? (
      <>
        {onClickHide && (
          <button
            type="button"
            aria-label={hidden ? "Show course" : "Hide course"}
            className={styles.iconButton}
            onClick={(event) => {
              event.stopPropagation();
              event.preventDefault();
              onClickHide();
            }}
          >
            {!hidden ? <Eye /> : <EyeClosed />}
          </button>
        )}
        {onClickDelete && (
          <button
            type="button"
            aria-label="Delete course"
            className={styles.deleteIconButton}
            onClick={(event) => {
              event.stopPropagation();
              event.preventDefault();
              onClickDelete();
            }}
          >
            <Trash />
          </button>
        )}
      </>
    ) : undefined;

  return (
    <ClassCard
      className={classNames(styles.card, {
        [styles.dimmed]: dimmed,
        [styles.fluid]: fluid,
      })}
      class={{
        subject,
        courseNumber: number,
        title: displayTitle,
        gradeDistribution: displayGradeDistribution,
      }}
      headingPrefix={
        <span
          className={styles.colorBlock}
          style={{ backgroundColor: color }}
          aria-hidden
        />
      }
      active={active}
      disabled={hidden}
      replaceInfoContent
      infoContent={<span className={styles.metadata}>{metadata}</span>}
      topRightContent={topRightContent}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={() => {
        if (hidden) return;
        onClick?.();
      }}
    />
  );
}
