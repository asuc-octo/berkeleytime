import { useRef } from "react";

import { Eye, EyeClosed, Trash } from "iconoir-react";

import { Card } from "@repo/theme";
import { ColoredSquare } from "@repo/theme";

import { AverageGrade } from "@/components/AverageGrade";
import { useReadCourseTitle } from "@/hooks/api";
import { IGradeDistribution } from "@/lib/api";

import styles from "./GradesCard.module.scss";

interface GradesCardProps {
  color: string;
  subject: string;
  number: string;
  description: string;
  gradeDistribution: IGradeDistribution;
  onClick: () => void;
  onClickDelete: () => void;
  onClickHide: () => void;
  active: boolean;
  hidden: boolean;
}

export default function GradesCard({
  color,
  subject,
  number,
  description,
  gradeDistribution,
  onClick,
  onClickDelete,
  onClickHide,
  active,
  hidden,
}: GradesCardProps) {
  const hideRef = useRef<HTMLDivElement>(null);
  const deleteRef = useRef<HTMLDivElement>(null);

  const { data: data } = useReadCourseTitle(subject, number);

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
        {/* Header: Course code (left) and Actions (right) */}
        <div className={styles.header}>
          {/* Header Title: Colored square and course code */}
          <div className={styles.headerTitle}>
            <ColoredSquare
              color={color}
              size="lg"
            />
            <span className={styles.courseCode}>{subject} {number}</span>
          </div>

          {/* Header Actions: Grade, eye icon, trash icon */}
          <div className={styles.headerActions}>
            <AverageGrade gradeDistribution={gradeDistribution} />
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

        {/* Body: Course title and metadata */}
        <div className={styles.body}>
          {/* Course title */}
          <div className={styles.title}>
            {data?.title ?? "N/A"}
          </div>
          {/* Metadata: Prof and semester */}
          <div className={styles.metadata}>{description}</div>
        </div>
      </div>
    </Card.Root>
  );
}
