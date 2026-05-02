import { ComponentPropsWithRef } from "react";
import { Bookmark } from "iconoir-react";

import { AverageGrade } from "@/components/AverageGrade";

import styles from "./CatalogCard.module.scss";

// Placeholder images for course cards
const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop",
];

interface CatalogCardProps extends Omit<ComponentPropsWithRef<"div">, "className"> {
  subject: string;
  courseNumber: string;
  number?: string;
  title?: string;
  gradeDistribution?: {
    average?: number | null;
    distribution?: Array<{ letter: string; count: number }>;
  } | null;
  imageUrl?: string;
  imageIndex?: number;
  bookmarked?: boolean;
  onBookmarkToggle?: () => void;
  hasOpenSeats?: boolean;
}

export default function CatalogCard({
  subject,
  courseNumber,
  number,
  title,
  gradeDistribution,
  imageUrl,
  imageIndex = 0,
  bookmarked = false,
  onBookmarkToggle,
  hasOpenSeats = false,
  ...props
}: CatalogCardProps) {
  const backgroundImage = imageUrl || PLACEHOLDER_IMAGES[imageIndex % PLACEHOLDER_IMAGES.length];
  const formattedNumber = number ? `#${number.padStart(3, "0")}` : "";

  return (
    <div className={styles.card} {...props}>
      <div 
        className={styles.imageContainer}
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        {hasOpenSeats && (
          <div className={styles.openSeatsBadge}>
            <span className={styles.thumbsUp}>👍</span>
          </div>
        )}
      </div>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <span className={styles.courseName}>
              {subject} {courseNumber} {formattedNumber}
            </span>
            <div className={styles.actions}>
              {gradeDistribution && (
                <AverageGrade
                  gradeDistribution={gradeDistribution}
                  style={{ fontSize: 14, whiteSpace: "nowrap" }}
                />
              )}
              <button
                className={`${styles.bookmarkButton} ${bookmarked ? styles.bookmarked : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onBookmarkToggle?.();
                }}
                aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
              >
                <Bookmark width={16} height={16} />
              </button>
            </div>
          </div>
          <p className={styles.description}>{title || "Untitled Course"}</p>
        </div>
      </div>
    </div>
  );
}
