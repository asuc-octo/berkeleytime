import { ReactNode, useMemo } from "react";

import moment from "moment";

import { getEnrollmentColor } from "@/components/Capacity";
import { CatalogTooltip } from "@/components/CatalogTooltip";

import styles from "./EnrollmentDisplay.module.scss";

interface EnrollmentDisplayProps {
  enrolledCount?: number;
  maxEnroll?: number;
  time?: string;
  children?: (content: ReactNode) => ReactNode;
}

export default function EnrollmentDisplay({
  enrolledCount,
  maxEnroll,
  time,
  children,
}: EnrollmentDisplayProps) {
  const formattedTime = useMemo(() => {
    if (!time) return null;
    const date = moment(time);
    return date.format("h:mm A MMM D, YYYY");
  }, [time]);

  const hasData = enrolledCount !== undefined && maxEnroll !== undefined;

  if (!hasData) return null;

  const percentage =
    maxEnroll === 0 ? 0 : Math.round((enrolledCount / maxEnroll) * 100);
  const color = getEnrollmentColor(enrolledCount, maxEnroll);

  const content = (
    <CatalogTooltip
      trigger={
        <span className={styles.trigger} style={{ color }}>
          {percentage}% enrolled
        </span>
      }
      title="Enrollment"
      description={
        <>
          <span style={{ color }}>
            {enrolledCount}/{maxEnroll}
          </span>{" "}
          students are enrolled in this class for this semester as of{" "}
          {formattedTime}
        </>
      }
    />
  );

  return children ? children(content) : content;
}
