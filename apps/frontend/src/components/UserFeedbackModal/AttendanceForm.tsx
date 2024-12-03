import { MetricName } from "@repo/shared";
import { MetricData } from "../Class/Ratings/helper/metricsUtil";
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

interface AttendanceFormProps {
  metricData: MetricData;
  setMetricData: React.Dispatch<React.SetStateAction<MetricData>>;
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
        <p style={{ marginBottom: "30px" }}
        >5. Is lecture attendance required?</p>
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
        <p style={{ marginBottom: "30px" }}>6. Were lectures recorded?</p>
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
