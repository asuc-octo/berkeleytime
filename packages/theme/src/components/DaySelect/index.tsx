import styles from "./DaySelect.module.scss";

export interface DaySelectProps {
  days: boolean[];
  updateDays: (value: boolean[]) => void;
  size?: "sm" | "lg";
}

export function DaySelect({ days, updateDays, size = "lg" }: DaySelectProps) {
  return (
    <div data-size={size} className={styles.root}>
      <label>
        <input
          type="checkbox"
          onChange={(e) => {
            days[6] = e.target.checked;
            updateDays(days);
          }}
        />
        <span>Su</span>
      </label>
      <label>
        <input
          type="checkbox"
          onChange={(e) => {
            days[0] = e.target.checked;
            updateDays(days);
          }}
        />
        <span>M</span>
      </label>
      <label>
        <input
          type="checkbox"
          onChange={(e) => {
            days[1] = e.target.checked;
            updateDays(days);
          }}
        />
        <span>Tu</span>
      </label>
      <label>
        <input
          type="checkbox"
          onChange={(e) => {
            days[2] = e.target.checked;
            updateDays(days);
          }}
        />
        <span>W</span>
      </label>
      <label>
        <input
          type="checkbox"
          onChange={(e) => {
            days[3] = e.target.checked;
            updateDays(days);
          }}
        />
        <span>Th</span>
      </label>
      <label>
        <input
          type="checkbox"
          onChange={(e) => {
            days[4] = e.target.checked;
            updateDays(days);
          }}
        />
        <span>F</span>
      </label>
      <label>
        <input
          type="checkbox"
          onChange={(e) => {
            days[5] = e.target.checked;
            updateDays(days);
          }}
        />
        <span>Sa</span>
      </label>
    </div>
  );
}
