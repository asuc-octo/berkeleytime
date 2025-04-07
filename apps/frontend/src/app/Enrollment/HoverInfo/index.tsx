import { useMemo } from "react";

import { ColorSquare } from "@repo/theme";

import { IEnrollment, Semester } from "@/lib/api";

import styles from "./HoverInfo.module.scss";
import { getEnrollmentColor } from "@/components/Capacity";

interface HoverInfoProps {
  color: string;
  subject: string;
  courseNumber: string;
  enrollmentHistory?: IEnrollment;
  semester?: Semester;
  year?: number;
  hoveredDay: number | null;
}

const DisplayCount = (count: number, capacity: number) => {
  return <span style={{color: getEnrollmentColor(count, capacity)}}>{count}/{capacity} ({`${Math.round(count/capacity*100)}%`})</span>
}

export default function HoverInfo({
  color,
  subject,
  courseNumber,
  enrollmentHistory,
  semester,
  year,
  hoveredDay,
}: HoverInfoProps) {

  const enrollmentSingular = useMemo(() => {
    if (!enrollmentHistory) return undefined;
    const day0 = new Date(enrollmentHistory?.history[0].time).getTime()
    return enrollmentHistory?.history.findLast((es) => {
      return Math.ceil((new Date(es.time).getTime() - day0) / (1000 * 3600 * 24)) == hoveredDay
    })
  }, [hoveredDay, enrollmentHistory])

  return (
    <div className={styles.info}>
      <div className={styles.heading}>
        <span className={styles.course}>
          <ColorSquare color={color} />
          {subject} {courseNumber}
        </span>
      </div>
      <div className={styles.distType}>
      {semester && year ? ` ${semester} ${year}` : " All Semesters"} • 
      {` LEC ${enrollmentHistory?.sectionNumber}`}
      </div>
      <div className={styles.label}>{hoveredDay} Days After Enrollment Start</div>
      {enrollmentSingular ? <div className={styles.value}>
        Enrolled: {DisplayCount(enrollmentSingular.enrolledCount, enrollmentSingular.maxEnroll)}<br/>
        Waitlisted: {DisplayCount(enrollmentSingular.waitlistedCount, enrollmentSingular.maxWaitlist)}<br/>
      </div> : <div className={styles.value}>No data</div>}
      
    </div>
  );
}
