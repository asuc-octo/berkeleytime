import { useMemo } from "react";

import moment from "moment";

import { ColoredSquare } from "@repo/theme";

import { getEnrollmentColor } from "@/components/Capacity";
import { IEnrollment, Semester } from "@/lib/api";

import styles from "./HoverInfo.module.scss";

interface HoverInfoProps {
  color: string;
  subject: string;
  courseNumber: string;
  enrollmentHistory?: IEnrollment;
  semester?: Semester;
  year?: number;
  hoveredDuration: moment.Duration | null;
}

const DisplayCount = (count: number, capacity: number) => {
  return (
    <span style={{ color: getEnrollmentColor(count, capacity) }}>
      {count}/{capacity} ({`${Math.round((count / capacity) * 100)}%`})
    </span>
  );
};

export default function HoverInfo({
  color,
  subject,
  courseNumber,
  enrollmentHistory,
  semester,
  year,
  hoveredDuration,
}: HoverInfoProps) {
  const { enrollmentSingular, timeString } = useMemo(() => {
    if (!enrollmentHistory || !hoveredDuration) {
      return {
        enrollmentSingular: undefined,
        timeString: "Select a time",
      };
    }

    const firstTime = moment(enrollmentHistory.history[0].time);
    const targetTime = firstTime.clone().add(hoveredDuration);
    const targetDate = targetTime.toDate();

    // Find the last entry at or before the target time
    const entry = enrollmentHistory.history.findLast((es) =>
      moment(es.time).isSameOrBefore(targetTime)
    );

    const formatted = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "America/Los_Angeles",
    }).format(targetDate);

    return {
      enrollmentSingular: entry,
      timeString: formatted,
    };
  }, [hoveredDuration, enrollmentHistory]);

  return (
    <div className={styles.info}>
      <div className={styles.heading}>
        <span className={styles.course}>
          <ColoredSquare
            color={color}
            size="md"
            style={{ marginRight: 6, position: "relative", top: 2 }}
          />
          {subject} {courseNumber}
        </span>
      </div>
      {enrollmentHistory ? (
        <div className={styles.distType}>
          {semester && year ? ` ${semester} ${year}` : " All Semesters"} •
          {` LEC ${enrollmentHistory?.sectionNumber}`}
        </div>
      ) : (
        <div className={styles.distType}>No data</div>
      )}
      <div className={styles.label}>{timeString}</div>
      {enrollmentSingular ? (
        <div className={styles.value}>
          Enrolled:{" "}
          {DisplayCount(
            enrollmentSingular.enrolledCount,
            enrollmentSingular.maxEnroll
          )}
          <br />
          Waitlisted:{" "}
          {DisplayCount(
            enrollmentSingular.waitlistedCount,
            enrollmentSingular.maxWaitlist
          )}
          <br />
        </div>
      ) : (
        <div className={styles.value}>No data</div>
      )}
    </div>
  );
}
