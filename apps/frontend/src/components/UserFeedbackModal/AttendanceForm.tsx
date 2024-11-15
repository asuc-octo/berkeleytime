import { useState } from "react";

import styles from "./UserFeedbackModal.module.scss";

interface BooleanInputProps {
  name: string;
  value: number | null;
  onChange: (value: number | null) => void;
  yesLabel?: string;
  noLabel?: string;
}

export function BooleanOptions({
  name,
  value,
  onChange,
  yesLabel = "Yes",
  noLabel = "No",
}: BooleanInputProps) {
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
}

export function AttendanceForm() {
  const [attendance, setAttendance] = useState<number | null>(null);
  const [recording, setRecording] = useState<number | null>(null);

  return (
    <div className={styles.attendanceSection}>

      {/* Question 5 */}
      <div className={styles.formGroup}>
        <p>5. Is lecture attendance required?</p>
        <BooleanOptions
          name="lectureAttendance"
          value={attendance}
          onChange={setAttendance}
          yesLabel="Yes, lecture attendance was required."
          noLabel="No, lecture attendance was not required."
        />
      </div>

      {/* Question 6 */}
      <div className={styles.formGroup}>
        <p>6. Were lectures recorded?</p>
        <BooleanOptions
          name="lecturesRecorded"
          value={recording}
          onChange={setRecording}
          yesLabel="Yes, lectures were recorded."
          noLabel="No, lectures were not recorded."
        />
      </div>
    </div>
  );
}
