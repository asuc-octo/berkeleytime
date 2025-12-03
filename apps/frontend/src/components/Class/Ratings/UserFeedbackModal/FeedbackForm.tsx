import { Dispatch, SetStateAction } from "react";

import { MetricName } from "@repo/shared";

import { MetricData } from "../metricsUtil";
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
  startQuestionNumber,
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
    <div>
      {ATTENDANCE_QUESTIONS.map(({ type, question }, index) => (
        <div className={styles.formGroup} key={type}>
          <div className={styles.inlineQuestion}>
            <h3>
              {startQuestionNumber + index}. {question}
            </h3>
            <BooleanOptions
              name={type}
              value={metricData[type] ?? null}
              onChange={(v) => handleAttendanceClickClick(type, v)}
            />
          </div>
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
    <div>
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

// helper functions

const RequiredAsterisk = () => <span style={{ color: "red" }}>*</span>;

const RatingScale = ({
  type,
  question,
  questionNumber,
  leftLabel,
  rightLabel,
  metricData,
  onRatingClick,
}: RatingScaleProps) => (
  <div className={styles.formGroup}>
    <div className={styles.questionPair}>
      <h3>
        {questionNumber}. {question} <RequiredAsterisk />
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
