import { MetricData, MetricName } from "../Class/Ratings/helper/metricsUtil";
import styles from "./UserFeedbackModal.module.scss";

interface RatingsFormProps {
  metricData: MetricData;
  setMetricData: React.Dispatch<React.SetStateAction<MetricData>>;
}

const RequiredAsterisk = () => (
  <span style={{ color: "red" }}>*</span>
);

export function RatingsForm({ metricData, setMetricData }: RatingsFormProps) {
  const handleRatingClick = (type: MetricName, value: number) => {
    setMetricData((prev) => ({
      ...prev,
      [type]: prev[type] === value ? undefined : value,
    }));
  };

  const renderRatingScale = (
    type: MetricName,
    question: string,
    leftLabel: string,
    rightLabel: string
  ) => (
    <div className={styles.formGroup}>
      <h3>{question} <RequiredAsterisk /></h3>
      <div className={styles.ratingScale}>
        <span>{leftLabel}</span>
        <div className={styles.ratingButtons}>
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              className={`${styles.ratingButton} ${metricData[type] === value ? styles.selected : ""}`}
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
      {renderRatingScale(
        MetricName.Usefulness,
        "2. How would you rate the usefulness of this course?",
        "Not useful",
        "Very useful"
      )}

      {renderRatingScale(
        MetricName.Difficulty,
        "3. How would you rate the difficulty of this course?",
        "Very easy",
        "Very difficult"
      )}

      {renderRatingScale(
        MetricName.Workload,
        "4. How would you rate the workload of this course?",
        "Very light",
        "Very heavy"
      )}
    </div>
  );
}
