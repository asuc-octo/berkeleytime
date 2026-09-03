import { useMemo } from "react";

import { User } from "iconoir-react";

import { Tooltip } from "@repo/theme";

import { getEnrollmentColor } from "@/lib/enrollment";

import styles from "./Capacity.module.scss";

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
    <Tooltip
      trigger={
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
      }
      hasArrow
      cardClassName={styles.card}
      content={
        <>
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
        </>
      }
    />
  );
}
