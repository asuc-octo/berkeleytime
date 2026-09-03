import { ComponentPropsWithRef } from "react";

import { AverageGrade } from "@/components/AverageGrade";
import { DEFAULT_COURSE_CARD_IMAGE } from "@/lib/courseCardImage";

import styles from "./CatalogCard.module.scss";

interface CatalogCardProps
  extends Omit<ComponentPropsWithRef<"div">, "className"> {
  subject: string;
  courseNumber: string;
  title?: string;
  gradeDistribution?: {
    average?: number | null;
    distribution?: Array<{ letter: string; count: number }>;
  } | null;
  imageUrl?: string;
  seatScore?: number;
}

export default function CatalogCard({
  subject,
  courseNumber,
  title,
  gradeDistribution,
  imageUrl,
  seatScore,
  ...props
}: CatalogCardProps) {
  const backgroundImage = imageUrl || DEFAULT_COURSE_CARD_IMAGE;

  return (
    <div className={styles.card} {...props}>
      <div
        className={styles.imageContainer}
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        {seatScore === 0 && <span className={styles.seatBadge}>Full</span>}
      </div>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <span className={styles.courseName}>
              {subject} {courseNumber}
            </span>
            <div className={styles.gradeContainer}>
              {gradeDistribution && (
                <AverageGrade
                  gradeDistribution={gradeDistribution}
                  style={{ fontSize: 14, whiteSpace: "nowrap" }}
                />
              )}
            </div>
          </div>
          <p className={styles.description}>{title || "Untitled Course"}</p>
        </div>
      </div>
    </div>
  );
}
