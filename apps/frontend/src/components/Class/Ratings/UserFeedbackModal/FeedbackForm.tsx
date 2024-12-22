import { Dispatch, SetStateAction } from "react";

import { MetricName } from "@repo/shared";

import { MetricData } from "../helper/metricsUtil";
import styles from "./UserFeedbackModal.module.scss";

interface BooleanInputProps {
  name: string;
  value: number | null;
  onChange: (value: number | null) => void;
  yesLabel?: string;
  noLabel?: string;
}

interface AttendanceFormProps {
  metricData: MetricData;
  setMetricData: Dispatch<SetStateAction<MetricData>>;
}

interface RatingsFormProps {
  metricData: MetricData;
  setMetricData: Dispatch<SetStateAction<MetricData>>;
}

interface RatingScaleProps {
  type: MetricName;
  question: string;
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

  return (
    <div className={styles.attendanceSection}>
      {/* Question 5 */}
      <div className={styles.formGroup}>
        <h3>5. Is lecture attendance required?</h3>
        <BooleanOptions
          name="lectureAttendance"
          value={metricData["Attendance"] ?? null}
          onChange={(v) => handleAttendanceClickClick(MetricName.Attendance, v)}
          yesLabel="Yes, lecture attendance was required."
          noLabel="No, lecture attendance was not required."
        />
      </div>

      {/* Question 6 */}
      <div className={styles.formGroup}>
        <h3>6. Were lectures recorded?</h3>
        <BooleanOptions
          name="lecturesRecorded"
          value={metricData["Recording"] ?? null}
          onChange={(v) => handleAttendanceClickClick(MetricName.Recording, v)}
          yesLabel="Yes, lectures were recorded."
          noLabel="No, lectures were not recorded."
        />
      </div>
    </div>
  );
}

export function RatingsForm({ metricData, setMetricData }: RatingsFormProps) {
  const handleRatingClick = (type: MetricName, value: number) => {
    setMetricData((prev) => ({
      ...prev,
      [type]: prev[type] === value ? undefined : value,
    }));
  };

  return (
    <div className={styles.ratingSection}>
      <RatingScale
        type={MetricName.Usefulness}
        question="2. How would you rate the usefulness of this course?"
        leftLabel="Not useful"
        rightLabel="Very useful"
        metricData={metricData}
        onRatingClick={handleRatingClick}
      />

      <RatingScale
        type={MetricName.Difficulty}
        question="3. How would you rate the difficulty of this course?"
        leftLabel="Very easy"
        rightLabel="Very difficult"
        metricData={metricData}
        onRatingClick={handleRatingClick}
      />

      <RatingScale
        type={MetricName.Workload}
        question="4. How would you rate the workload of this course?"
        leftLabel="Very light"
        rightLabel="Very heavy"
        metricData={metricData}
        onRatingClick={handleRatingClick}
      />
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
);

const BooleanOptions = ({
  name,
  value,
  onChange,
  yesLabel = "Yes",
  noLabel = "No",
}: BooleanInputProps) => {
  const handleClick = (selectedValue: number) =>
    onChange(value === selectedValue ? null : selectedValue);

  return (
    <div className={styles.radioOptions}>
      {[
        { label: yesLabel, value: 1 },
        { label: noLabel, value: 0 },
      ].map(({ label, value: optionValue }) => (
        <label key={optionValue}>
          <input
            type="radio"
            name={name}
            value={optionValue}
            checked={value === optionValue}
            onChange={() => {}} // Required to avoid React warning
            onClick={(e) => {
              if ((e.target as HTMLInputElement).checked) {
                handleClick(optionValue);
              } else {
                onChange(null);
              }
            }}
          />
          {label}
        </label>
      ))}
    </div>
  );
};
