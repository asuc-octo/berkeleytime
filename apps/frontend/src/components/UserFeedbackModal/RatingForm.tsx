import { useState } from "react";

import styles from "./UserFeedbackModal.module.scss";

export function RatingsForm() {
  const [ratings, setRatings] = useState({
    usefulness: 0,
    difficulty: 0,
    workload: 0,
  });

  const handleRatingClick = (type: keyof typeof ratings, value: number) => {
    setRatings((prev) => ({
      ...prev,
      [type]: prev[type] === value ? 0 : value,
    }));
  };

  const renderRatingScale = (
    type: keyof typeof ratings,
    question: string,
    leftLabel: string,
    rightLabel: string
  ) => (
    <div className={styles.formGroup}>
      <h3>{question}</h3>
      <div className={styles.ratingScale}>
        <span>{leftLabel}</span>
        <div className={styles.ratingButtons}>
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              className={`${styles.ratingButton} ${ratings[type] === value ? styles.selected : ""}`}
              onClick={() => handleRatingClick(type, value)}
              type="button"
            >
              {value}
            </button>
          ))}
        </div>
        <span>{rightLabel}</span>
      </div>
    </div>
  );

  return (
    <div className={styles.ratingSection}>
      <h2 className={styles.sectionTitle}>Course Ratings</h2>

      {renderRatingScale(
        "usefulness",
        "1. How would you rate the usefulness of this course?",
        "Not useful",
        "Very useful"
      )}

      {renderRatingScale(
        "difficulty",
        "2. How would you rate the difficulty of this course?",
        "Very easy",
        "Very difficult"
      )}

      {renderRatingScale(
        "workload",
        "3. How would you rate the workload of this course?",
        "Very light",
        "Very heavy"
      )}
    </div>
  );
}
