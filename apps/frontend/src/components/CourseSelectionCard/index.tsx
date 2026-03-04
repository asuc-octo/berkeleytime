import classNames from "classnames";
import { EditPencil, Eye, EyeClosed, Trash } from "iconoir-react";

import ClassCard from "@/components/ClassCard";
import { useGetClass } from "@/hooks/api/classes/useGetClass";
import { useReadCourseTitle } from "@/hooks/api/courses/useReadCourse";
import { Semester } from "@/lib/generated/graphql";

import styles from "./CourseSelectionCard.module.scss";

interface CourseSelectionCardProps {
  color: string;
  subject: string;
  number: string;
  title?: string;
  subtitle: string;
  year?: number;
  semester?: Semester;
  sectionNumber?: string;
  sessionId?: string;
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
  subtitle,
  year,
  semester,
  sectionNumber,
  sessionId,
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

  const hasClassIdentity = !!(year && semester && sectionNumber);
  const { data: classData } = useGetClass(
    year ?? 0,
    semester ?? Semester.Fall,
    sessionId ?? "",
    subject,
    number,
    sectionNumber ?? "",
    { skip: !hasClassIdentity }
  );

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
        unitsMin: classData?.unitsMin,
        unitsMax: classData?.unitsMax,
        course: classData?.course,
        primarySection: classData?.primarySection,
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
      subtitle={subtitle}
      gradeInFooter
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
