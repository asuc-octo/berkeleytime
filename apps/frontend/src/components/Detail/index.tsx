
import { Link } from "react-router-dom";
import { Camera, UserCircle } from "iconoir-react";
import _ from "lodash";

import { MINIMUM_RESPONSES_THRESHOLD } from "@repo/shared";

import styles from "./Detail.module.scss";
import MyIcon2 from "./attended.svg";
import MyIcon1 from "./recorded.svg";

interface Props {
  attendanceRequired?: boolean;
  lecturesRecorded?: boolean;
  submissionAmount?: number;
}

// TODO: attendanceLogic
export default function AttendanceRequirements({
  attendanceRequired = true,
  lecturesRecorded = true,
  submissionAmount = 0,
}: Props) {
  // TODO: Submission should check for CONSENSUS_THRESHOLD - logic for decision on the frontend based on yes/no count
  if (submissionAmount < MINIMUM_RESPONSES_THRESHOLD) {
    return (
      <div className={styles.attendanceRequirements}>
        <p className={styles.label}>User-Submitted Class Requirements</p>
        <p className={styles.description}>
          No user-submitted information is available for this course yet.
        </p>
        <Link
          to="ratings"
          className={styles.suggestEdit}
        >
          Taken this course? Help others by adding what you know →
        </Link>
      </div>
    );
  }
  return (
    <div className={styles.attendanceRequirements}>
      <p className={styles.label}>Attendance Requirements</p>
      <div>
        {attendanceRequired ? (
          <UserCircle className={styles.icon} />
        ) : (
          <img className={styles.icon} src={MyIcon2} />
        )}
        <span className={styles.description}>
          {attendanceRequired ? "Attendance Required" : "Attendance Not Required"}
        </span>
      </div>

      <div className={styles.description}>
        {lecturesRecorded ? (
          <Camera className={styles.icon} />
        ) : (
          <img className={styles.icon} src={MyIcon1} />
        )}
        <span>
          {lecturesRecorded ? "Lectures Recorded" : "Lectures Not Recorded"}
        </span>
      </div>
      <Link
        to="ratings"
        className={styles.suggestEdit}
      >
        Look inaccurate? Suggest an edit →{" "}
      </Link>
    </div>
  );
}
