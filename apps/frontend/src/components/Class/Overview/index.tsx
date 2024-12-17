import { User, UserXmark, VideoCamera, VideoCameraOff } from "iconoir-react";
import _ from "lodash";
import { Link } from "react-router-dom";

import { MINIMUM_RESPONSES_THRESHOLD } from "@repo/shared";

import Details from "@/components/Details";
import { useReadUser } from "@/hooks/api";
import useClass from "@/hooks/useClass";
import { signIn } from "@/lib/api";

import styles from "./Overview.module.scss";

export default function Overview() {
  const { class: _class } = useClass();
  return (
    <div className={styles.root}>
      <Details {..._class.primarySection.meetings[0]} />
      <p className={styles.attendanceLabel}>Description</p>
      <p className={styles.attendanceDescription}>
        {_class.description ?? _class.course.description}
      </p>
      <AttendanceRequirements
        attendanceRequired={_class.primarySection.attendanceRequired}
        lecturesRecorded={_class.primarySection.lecturesRecorded}
      />
    </div>
  );
}

interface Props {
  attendanceRequired?: boolean;
  lecturesRecorded?: boolean;
  submissionAmount?: number;
}

// TODO: attendanceLogic
function AttendanceRequirements({
  attendanceRequired = true,
  lecturesRecorded = true,
  submissionAmount = 0,
}: Props) {
  const { data: user } = useReadUser();

  const handleFeedbackClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      const currentPath = window.location.pathname;
      const redirectPath = `${currentPath}/ratings?feedbackModal=true`;
      signIn(redirectPath);
    }
  };

  // TODO: Submission should check for CONSENSUS_THRESHOLD - logic for decision on the frontend based on yes/no count
  if (submissionAmount < MINIMUM_RESPONSES_THRESHOLD) {
    return (
      <div className={styles.attendanceRequirements}>
        <p className={styles.attendanceLabel}>
          User-Submitted Class Requirements
        </p>
        <p className={styles.attendanceDescription}>
          No user-submitted information is available for this course yet.
        </p>
        <Link
          to="ratings?feedbackModal=true"
          className={styles.suggestEdit}
          onClick={handleFeedbackClick}
        >
          Taken this course? Help others by adding what you know →
        </Link>
      </div>
    );
  }
  return (
    <div className={styles.attendanceRequirements}>
      <p className={styles.attendanceLabel}>
        User-Submitted Class Requirements
      </p>
      <div>
        {attendanceRequired ? (
          <User className={styles.icon} />
        ) : (
          <UserXmark className={styles.icon} />
        )}
        <span className={styles.attendanceDescription}>
          {attendanceRequired
            ? "Attendance Required"
            : "Attendance Not Required"}
        </span>
      </div>

      <div className={styles.attendanceDescription}>
        {lecturesRecorded ? (
          <VideoCamera className={styles.icon} />
        ) : (
          <VideoCameraOff className={styles.icon} />
        )}
        <span>
          {lecturesRecorded ? "Lectures Recorded" : "Lectures Not Recorded"}
        </span>
      </div>
      <Link
        to="ratings?feedbackModal=true"
        className={styles.suggestEdit}
        onClick={handleFeedbackClick}
      >
        Look inaccurate? Suggest an edit →{" "}
      </Link>
    </div>
  );
}
