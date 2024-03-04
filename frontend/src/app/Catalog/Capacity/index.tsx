import { useMemo } from "react";

import * as Tooltip from "@radix-ui/react-tooltip";

import styles from "./Capacity.module.scss";

const getColor = (count: number, capacity: number) => {
  const percentage = count / capacity;

  return percentage >= 0.75
    ? "var(--red-500)"
    : percentage > 0.5
      ? "var(--yellow-500)"
      : "var(--green-500)";
};

interface CapacityProps {
  count: number;
  capacity: number;
  waitlistCount: number;
  waitlistCapacity: number;
}

export default function Capacity({
  count,
  capacity,
  waitlistCount,
  waitlistCapacity,
}: CapacityProps) {
  const color = useMemo(() => getColor(count, capacity), [count, capacity]);

  const waitlistColor = useMemo(
    () => getColor(waitlistCount, waitlistCapacity),
    [waitlistCount, waitlistCapacity]
  );

  return (
    <Tooltip.Root disableHoverableContent>
      <Tooltip.Trigger asChild>
        <p className={styles.trigger}>
          <span style={{ color }}>{count.toLocaleString()}</span>
          &nbsp;/&nbsp;
          {capacity.toLocaleString()}
        </p>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content asChild side="bottom" sideOffset={8}>
          <div className={styles.content}>
            <Tooltip.Arrow className={styles.arrow} />
            <div className={styles.row}>
              <p className={styles.key}>Enrolled</p>
              <p>
                <span style={{ color }}>{count.toLocaleString()}</span>
                &nbsp;/&nbsp;
                <span className={styles.value}>
                  {capacity.toLocaleString()}
                </span>
                &nbsp;(
                <span style={{ color }}>
                  {Math.round((count / capacity) * 100).toLocaleString()}%
                </span>
                )
              </p>
            </div>
            <div className={styles.divider} />
            <div className={styles.row}>
              <p className={styles.key}>Waitlisted</p>
              <p>
                <span style={{ color: waitlistColor }}>
                  {waitlistCount?.toLocaleString() ?? 0}
                </span>
                &nbsp;/&nbsp;
                {waitlistCapacity?.toLocaleString() ?? 0}
                &nbsp;(
                <span style={{ color: waitlistColor }}>
                  {Math.round(
                    (waitlistCount / waitlistCapacity) * 100
                  ).toLocaleString()}
                  %
                </span>
                )
              </p>
            </div>
          </div>
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
