import classNames from "classnames";
import { EditPencil, Eye, EyeClosed, Trash } from "iconoir-react";

import ClassCard from "@/components/ClassCard";
import { useReadCourseTitle } from "@/hooks/api/courses/useReadCourse";

import styles from "./CourseSelectionCard.module.scss";

interface CourseSelectionCardProps {
  color: string;
  subject: string;
  number: string;
  title?: string;
  metadata: string;
  onClick?: () => void;
  onClickDelete?: () => void;
  onClickEdit?: () => void;
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
  onClick,
  onClickDelete,
  onClickEdit,
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

  const displayTitle = title ?? titleData?.title ?? "N/A";
  const hasActions = onClickHide || onClickEdit || onClickDelete;
  const topRightContent = hasActions ? (
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
      {onClickEdit && (
        <button
          type="button"
          aria-label="Edit course"
          className={styles.iconButton}
          onClick={(event) => {
            event.stopPropagation();
            event.preventDefault();
            onClickEdit();
          }}
        >
          <EditPencil />
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
