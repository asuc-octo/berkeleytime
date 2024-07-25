import { useMemo } from "react";

import * as Tooltip from "@radix-ui/react-tooltip";
import { User } from "iconoir-react";

import styles from "./Capacity.module.scss";

const getColor = (count: number, capacity: number) => {
  const percentage = count / capacity;

  return percentage >= 0.75
    ? "var(--rose-500)"
    : percentage > 0.5
      ? "var(--amber-500)"
      : "var(--emerald-500)";
};

interface CapacityProps {
  enrollCount: number;
  enrollMax: number;
  waitlistCount: number;
  waitlistMax: number;
}

export default function Capacity({
  enrollCount,
  enrollMax,
  waitlistCount,
  waitlistMax,
}: CapacityProps) {
  const color = useMemo(
    () => getColor(enrollCount, enrollMax),
    [enrollCount, enrollMax]
  );

  const waitlistColor = useMemo(
    () => getColor(waitlistCount, waitlistMax),
    [waitlistCount, waitlistMax]
  );

  return (
    <Tooltip.Root disableHoverableContent>
      <Tooltip.Trigger asChild>
        <div className={styles.trigger}>
          <User />
          <p className={styles.text}>
            <span style={{ color }}>{enrollCount.toLocaleString()}</span>
            &nbsp;/&nbsp;
            {enrollMax.toLocaleString()}
          </p>
        </div>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          asChild
          side="bottom"
          sideOffset={8}
          collisionPadding={8}
        >
          <div className={styles.content}>
            <Tooltip.Arrow className={styles.arrow} />
            <div className={styles.row}>
              <p className={styles.key}>Enrolled</p>
              <p>
                <span style={{ color }}>{enrollCount.toLocaleString()}</span>
                &nbsp;/&nbsp;
                <span className={styles.value}>
                  {enrollMax.toLocaleString()}
                </span>
                &nbsp;(
                <span style={{ color }}>
                  {enrollMax === 0
                    ? 0
                    : Math.round(
                        (enrollCount / enrollMax) * 100
                      ).toLocaleString()}
                  %
                </span>
                )
              </p>
            </div>
            <div className={styles.divider} />
            <div className={styles.row}>
              <p className={styles.key}>Waitlisted</p>
              <p>
                <span style={{ color: waitlistColor }}>
                  {waitlistCount.toLocaleString()}
                </span>
                &nbsp;/&nbsp;
                {waitlistMax.toLocaleString()}
                &nbsp;(
                <span style={{ color: waitlistColor }}>
                  {waitlistMax === 0
                    ? 0
                    : Math.round(
                        (waitlistCount / waitlistMax) * 100
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
