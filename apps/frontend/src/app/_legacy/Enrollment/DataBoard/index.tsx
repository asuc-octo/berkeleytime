import { useMemo } from "react";

import moment from "moment";

import { getEnrollmentColor } from "@/components/Capacity";
import CourseSideMetrics from "@/components/CourseSideMetrics";
import { useReadCourseTitle } from "@/hooks/api";
import { IEnrollment } from "@/lib/api";
import { Semester } from "@/lib/generated/graphql";

interface DataBoardProps {
  color: string;
  subject: string;
  courseNumber: string;
  enrollmentHistory?: IEnrollment;
  semester?: Semester;
  year?: number;
  instructors?: string[];
  hoveredDuration: moment.Duration | null;
}

const DisplayCount = (count: number, capacity: number) => {
  return (
    <span style={{ color: getEnrollmentColor(count, capacity) }}>
      {count}/{capacity} ({`${Math.round((count / capacity) * 100)}%`})
    </span>
  );
};

export default function DataBoard({
  color,
  subject,
  courseNumber,
  enrollmentHistory,
  semester,
  year,
  instructors,
  hoveredDuration,
}: DataBoardProps) {
  const { data: courseTitleData } = useReadCourseTitle(subject, courseNumber);

  const hoverData = useMemo(() => {
    if (!enrollmentHistory || !hoveredDuration) {
      return null;
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

  const metrics = useMemo(() => {
    if (!hoverData || !hoverData.enrollmentSingular) {
      return [];
    }

    const { enrollmentSingular, timeString } = hoverData;

    return [
      {
        label: timeString,
        value: (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div>
              Enrolled:{" "}
              {DisplayCount(
                enrollmentSingular.enrolledCount,
                enrollmentSingular.maxEnroll
              )}
            </div>
            <div>
              Waitlisted:{" "}
              {DisplayCount(
                enrollmentSingular.waitlistedCount,
                enrollmentSingular.maxWaitlist
              )}
            </div>
          </div>
        ),
      },
    ];
  }, [hoverData]);

  return (
    <CourseSideMetrics
      color={color}
      courseTitle={`${subject} ${courseNumber}`}
      classTitle={courseTitleData?.title ?? undefined}
      metadata={
        enrollmentHistory
          ? `${semester && year ? `${semester} ${year}` : "All Semesters"} • ${
              instructors && instructors.length
                ? instructors.join(", ")
                : enrollmentHistory.sectionNumber
                  ? `LEC ${enrollmentHistory.sectionNumber}`
                  : "All Instructors"
            }`
          : "No Semester or Instructor Data"
      }
      metrics={metrics}
    />
  );
}
