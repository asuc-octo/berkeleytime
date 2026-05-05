import { ComponentPropsWithRef } from "react";

import { AverageGrade } from "@/components/AverageGrade";

import styles from "./CatalogCard.module.scss";

const FALLBACK_IMAGE_URL = "/course-card-images/interdisciplinary.jpg";

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
  imageIndex?: number;
}

export default function CatalogCard({
  subject,
  courseNumber,
  title,
  gradeDistribution,
  imageUrl,
  imageIndex = 0,
  ...props
}: CatalogCardProps) {
  void imageIndex;
  const backgroundImage = imageUrl || FALLBACK_IMAGE_URL;

  return (
    <div className={styles.card} {...props}>
      <div
        className={styles.imageContainer}
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
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
