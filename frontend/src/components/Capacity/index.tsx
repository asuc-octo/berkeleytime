import { useMemo } from "react";

import styles from "./Capacity.module.scss";

interface CapacityProps {
  enrolled: number;
  capacity: number;
  waitlisted: number;
}

export default function Capacity({
  enrolled,
  capacity,
  waitlisted,
}: CapacityProps) {
  const color = useMemo(() => {
    const percentage = enrolled / capacity;

    return percentage >= 0.75
      ? "var(--red-500)"
      : percentage > 0.5
        ? "var(--yellow-500)"
        : "var(--green-500)";
  }, [enrolled, capacity]);

  return (
    <div className={styles.root}>
      <span className={styles.value}>{waitlisted}</span> /{" "}
      <span className={styles.value} style={{ color }}>
        {enrolled}
      </span>{" "}
      / <span className={styles.value}>{capacity}</span>
    </div>
  );
}
