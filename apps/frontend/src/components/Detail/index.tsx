import { useState } from "react";

import { Camera, UserCircle } from "iconoir-react";

import UserFeedbackModal from "@/components/UserFeedbackModal";
import useClass from "@/hooks/useClass";

import styles from "./Detail.module.scss";

interface AttendanceRequirementsProps {
  attendanceRequired: boolean | null;
  lecturesRecorded: boolean | null;
}

export default function AttendanceRequirements({
  attendanceRequired,
  lecturesRecorded,
}: AttendanceRequirementsProps) {
  const [isModalOpen, setModalOpen] = useState(false);
  const { class: currentClass } = useClass();

  return (
    <div className={styles.attendanceRequirements}>
      <p className={styles.label}>Attendance Requirements</p>
      <div>
        <UserCircle className={styles.icon} />
        <span className={styles.description}>
          {attendanceRequired
            ? "Attendance Required"
            : "Attendance Not Required"}
        </span>
      </div>
      <div className={styles.description}>
        <Camera className={styles.icon} />
        <span>
          {lecturesRecorded ? "Lectures Recorded" : "Lectures Not Recorded"}
        </span>
      </div>
      <a
        href="#"
        className={styles.suggestEdit}
        onClick={(e) => {
          e.preventDefault();
          setModalOpen(true);
        }}
      >
        Look inaccurate? Suggest an edit
      </a>

      <UserFeedbackModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        title="Suggest an edit"
        subtitle={`${currentClass.subject} ${currentClass.courseNumber} • ${currentClass.semester} ${currentClass.year}`}
        currentClass={currentClass}
      />
    </div>
  );
}
