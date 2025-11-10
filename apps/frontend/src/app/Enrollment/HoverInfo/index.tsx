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

    const firstTime = moment(enrollmentHistory.history[0].startTime).startOf(
      "minute"
    );
    const targetTime = firstTime.clone().add(hoveredDuration);
    const targetDate = targetTime.toDate();

    // Find the entry where the target time falls within its time range
    // For step-after charts, we need to check if targetTime is within [startTime, endTime]
    let entry = enrollmentHistory.history.findLast(
      (es) =>
        targetTime.isSameOrAfter(moment(es.startTime).startOf("minute")) &&
        targetTime.isSameOrBefore(moment(es.endTime).startOf("minute"))
    );

    // If no entry found and we're at or near the start, use the first entry
    if (!entry && hoveredDuration.asMinutes() <= 0) {
      entry = enrollmentHistory.history[0];
    }

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
