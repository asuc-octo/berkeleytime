import { ReactNode, useMemo } from "react";

import moment from "moment";
import { Tooltip } from "radix-ui";

import { getEnrollmentColor } from "@/components/Capacity";

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
    <Tooltip.Root disableHoverableContent>
      <Tooltip.Trigger asChild>
        <span className={styles.trigger} style={{ color }}>
          {percentage}% enrolled
        </span>
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
            <p className={styles.title}>Enrollment</p>
            <p className={styles.description}>
              <span style={{ color }}>
                {enrolledCount}/{maxEnroll}
              </span>{" "}
              students are enrolled in this class for this semester as of{" "}
              {formattedTime}
            </p>
          </div>
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );

  return children ? children(content) : content;
}
