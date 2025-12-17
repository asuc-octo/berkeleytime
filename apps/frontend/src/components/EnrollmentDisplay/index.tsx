import { ReactNode, useMemo } from "react";

import moment from "moment";

import { Tooltip } from "@repo/theme";

import { getEnrollmentColor } from "@/components/Capacity";

import styles from "./EnrollmentDisplay.module.scss";

interface EnrollmentDisplayProps {
  enrolledCount?: number;
  maxEnroll?: number;
  waitlistedCount?: number;
  maxWaitlist?: number;
  time?: string;
  children?: (content: ReactNode) => ReactNode;
}

export default function EnrollmentDisplay({
  enrolledCount,
  maxEnroll,
  waitlistedCount,
  maxWaitlist,
  time,
  children,
}: EnrollmentDisplayProps) {
  const formattedTime = useMemo(() => {
    if (!time) return null;
    return moment(time).fromNow();
  }, [time]);

  const hasData = enrolledCount !== undefined && maxEnroll !== undefined;

  if (!hasData) return null;

  const percentage =
    maxEnroll === 0 ? 0 : Math.round((enrolledCount / maxEnroll) * 100);
  const color = getEnrollmentColor(enrolledCount, maxEnroll);

  const hasWaitlist = waitlistedCount !== undefined && waitlistedCount > 0;

  const content = (
    <Tooltip
      trigger={
        <span className={styles.trigger} style={{ color }}>
          {percentage}% enrolled{hasWaitlist && ` (${waitlistedCount} wl.)`}
        </span>
      }
      title="Enrollment"
      description={
        <>
          <span style={{ color }}>
            {enrolledCount}/{maxEnroll}
          </span>{" "}
          students are enrolled in this class for this semester.
          {hasWaitlist && (
            <>
              {" "}
              {waitlistedCount}
              {maxWaitlist !== undefined && `/${maxWaitlist}`} students are on
              the waitlist.
            </>
          )}
          <br />
          <i>Updated {formattedTime}.</i>
        </>
      }
    />
  );

  return children ? children(content) : content;
}
