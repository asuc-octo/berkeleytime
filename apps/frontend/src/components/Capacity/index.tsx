import { useMemo } from "react";

import { User } from "iconoir-react";
import { Tooltip } from "radix-ui";

import styles from "./Capacity.module.scss";

export const getEnrollmentColor = (count?: number, capacity?: number) => {
  if (typeof count !== "number" || typeof capacity !== "number")
    return "var(--paragraph-color)";

  const percentage = count / capacity;

  return percentage >= 0.75
    ? "var(--rose-500)"
    : percentage > 0.5
      ? "var(--amber-500)"
      : "var(--emerald-500)";
};

interface CapacityProps {
  enrolledCount?: number;
  maxEnroll?: number;
  waitlistedCount?: number;
  maxWaitlist?: number;
}

export default function Capacity({
  enrolledCount,
  maxEnroll,
  waitlistedCount,
  maxWaitlist,
}: CapacityProps) {
  const color = useMemo(
    () => getEnrollmentColor(enrolledCount, maxEnroll),
    [enrolledCount, maxEnroll]
  );

  const waitlistColor = useMemo(
    () => getEnrollmentColor(waitlistedCount, maxWaitlist),
    [waitlistedCount, maxWaitlist]
  );

  return (
    <Tooltip.Root disableHoverableContent>
      <Tooltip.Trigger asChild>
        <div className={styles.trigger}>
          <User />
          <p className={styles.text}>
            <span style={{ color }}>
              {enrolledCount?.toLocaleString() ?? " - "}
            </span>
            &nbsp;/&nbsp;
            {maxEnroll?.toLocaleString() ?? " - "}
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
                <span style={{ color }}>
                  {enrolledCount?.toLocaleString() ?? " - "}
                </span>
                &nbsp;/&nbsp;
                <span className={styles.value}>
                  {maxEnroll?.toLocaleString() ?? " - "}
                </span>
                &nbsp;(
                <span style={{ color }}>
                  {enrolledCount === undefined || maxEnroll === undefined
                    ? "N/A"
                    : maxEnroll === 0
                      ? 0
                      : Math.round(
                          (enrolledCount / maxEnroll) * 100
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
                  {waitlistedCount?.toLocaleString() ?? " - "}
                </span>
                &nbsp;/&nbsp;
                {maxWaitlist?.toLocaleString() ?? " - "}
                &nbsp;(
                <span style={{ color: waitlistColor }}>
                  {waitlistedCount === undefined || maxWaitlist === undefined
                    ? "N/A"
                    : maxWaitlist === 0
                      ? 0
                      : Math.round(
                          (waitlistedCount / maxWaitlist) * 100
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
