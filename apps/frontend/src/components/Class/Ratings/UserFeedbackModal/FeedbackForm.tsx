import { Dispatch, SetStateAction } from "react";

import { MetricName } from "@repo/shared";

import { MetricData } from "../metricsUtil";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./UserFeedbackModal.module.scss";

interface BooleanInputProps {
  name: string;
  value: number | null;
  onChange: (value: number | null) => void;
}

interface AttendanceFormProps {
  metricData: MetricData;
  setMetricData: Dispatch<SetStateAction<MetricData>>;
  startQuestionNumber: number;
}

interface RatingsFormProps {
  metricData: MetricData;
  setMetricData: Dispatch<SetStateAction<MetricData>>;
  startQuestionNumber: number;
}

interface RatingScaleProps {
  type: MetricName;
  question: string;
  questionNumber: number;
  leftLabel: string;
  rightLabel: string;
  metricData: MetricData;
  onRatingClick: (type: MetricName, value: number) => void;
}

export function AttendanceForm({
  metricData,
  setMetricData,
}: AttendanceFormProps) {
  const handleAttendanceClickClick = (
    type: MetricName,
    value: number | null
  ) => {
    setMetricData((prev) => ({
      ...prev,
      [type]: prev[type] === value ? undefined : value,
    }));
  };

  const ATTENDANCE_QUESTIONS = [
    {
      type: MetricName.Attendance,
      question: "Is lecture attendance required?",
    },
    {
      type: MetricName.Recording,
      question: "Were lectures recorded?",
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "32px",
        padding: "24px 32px",
      }}
    >
      {ATTENDANCE_QUESTIONS.map(({ type, question }) => (
        <div className={styles.inlineQuestion} key={type}>
          <h3>{question}</h3>
          <BooleanOptions
            name={type}
            value={metricData[type] ?? null}
            onChange={(v) => handleAttendanceClickClick(type, v)}
          />
        </div>
      ))}
    </div>
  );
}

export function RatingsForm({
  metricData,
  setMetricData,
  startQuestionNumber,
}: RatingsFormProps) {
  const handleRatingClick = (type: MetricName, value: number) => {
    setMetricData((prev) => ({
      ...prev,
      [type]: prev[type] === value ? undefined : value,
    }));
  };

  const RATING_QUESTIONS = [
    {
      type: MetricName.Usefulness,
      question: "How would you rate the usefulness of this course?",
      leftLabel: "Not useful",
      rightLabel: "Very useful",
    },
    {
      type: MetricName.Difficulty,
      question: "How would you rate the difficulty of this course?",
      leftLabel: "Very easy",
      rightLabel: "Very hard",
    },
    {
      type: MetricName.Workload,
      question: "How would you rate the workload of this course?",
      leftLabel: "Very light",
      rightLabel: "Very heavy",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {RATING_QUESTIONS.map(
        ({ type, question, leftLabel, rightLabel }, index) => (
          <RatingScale
            key={type}
            type={type}
            question={question}
            questionNumber={startQuestionNumber + index}
            leftLabel={leftLabel}
            rightLabel={rightLabel}
            metricData={metricData}
            onRatingClick={handleRatingClick}
          />
        )
      )}
    </div>
  );
}

interface ReviewTitleFormProps {
  reviewTitle: string;
  setReviewTitle: (value: string) => void;
  showRequiredAsterisk?: boolean;
}

interface ReviewContentFormProps {
  reviewContent: string;
  setReviewContent: (value: string) => void;
  showRequiredAsterisk?: boolean;
}

export function ReviewTitleForm({
  reviewTitle,
  setReviewTitle,
  showRequiredAsterisk = false,
}: ReviewTitleFormProps) {
  return (
    <div className={styles.formGroup}>
      <div className={styles.questionPair}>
        <h3>
          Title of your review? {showRequiredAsterisk && <RequiredAsterisk />}
        </h3>
        <input
          type="text"
          className={`${styles.reviewTextarea} ${styles.reviewTitleTextarea}`}
          value={reviewTitle}
          onChange={(e) => setReviewTitle(e.target.value)}
          placeholder="Title"
          maxLength={100}
          aria-label="Review title"
        />
      </div>
    </div>
  );
}

export function ReviewContentForm({
  reviewContent,
  setReviewContent,
  showRequiredAsterisk = false,
}: ReviewContentFormProps) {
  return (
    <div className={styles.formGroup}>
      <div className={styles.questionPair}>
        <h3>Write a Review {showRequiredAsterisk && <RequiredAsterisk />}</h3>
        <textarea
          className={styles.reviewTextarea}
          value={reviewContent}
          onChange={(e) => setReviewContent(e.target.value)}
          placeholder="What was your experience like?"
          rows={4}
          aria-label="Review details"
        />
        <p className={styles.reviewDisclaimer}>
          Please be respectful in your reviews.
          {/* Your rating could be removed if you use profanity or derogatory terms. */}
        </p>
      </div>
    </div>
  );
}

// helper functions

const RequiredAsterisk = () => <span style={{ color: "red" }}>*</span>;

const RatingScale = ({
  type,
  question,
  leftLabel,
  rightLabel,
  metricData,
  onRatingClick,
}: RatingScaleProps) => (
  <div className={styles.formGroup}>
    <div className={styles.questionPair}>
      <h3>
        {question} <RequiredAsterisk />
      </h3>
      <div className={styles.ratingScale}>
        <span>{leftLabel}</span>
        <div className={styles.ratingButtons}>
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              className={`${styles.ratingButton} ${metricData[type] === value ? styles.selected : ""}`}
              onClick={() => onRatingClick(type, value)}
              type="button"
            >
              {value}
            </button>
          ))}
        </div>
        <span>{rightLabel}</span>
      </div>
    </div>
  </div>
);

const BooleanOptions = ({ name, value, onChange }: BooleanInputProps) => {
  const handleClick = (selectedValue: number) =>
    onChange(value === selectedValue ? null : selectedValue);

  return (
    <div className={styles.booleanBadges} role="group" aria-label={name}>
      <button
        type="button"
        className={`${styles.booleanBadge} ${value === 1 ? styles.selected : ""}`}
        onClick={() => handleClick(1)}
        aria-pressed={value === 1}
      >
        Yes
      </button>
      <button
        type="button"
        className={`${styles.booleanBadge} ${value === 0 ? styles.selected : ""}`}
        onClick={() => handleClick(0)}
        aria-pressed={value === 0}
      >
        No
      </button>
    </div>
  );
};
