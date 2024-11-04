import { useState } from "react";
import { Camera, UserCircle } from "iconoir-react";
import UserFeedbackModal from "@/components/UserFeedbackModal";
import useClass from "@/hooks/useClass";


import MyIcon1 from './recorded.svg';
import MyIcon2 from './attended.svg';
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
                {attendanceRequired ? (
                    <UserCircle className={styles.icon} />
                ) : (
                    <img className={styles.icon} src={MyIcon2}/>
                )}
                <span className={styles.description}>
          {attendanceRequired ? "Attendance Required" : "Attendance Not Required"}
        </span>
            </div>

            <div className={styles.description}>
                {lecturesRecorded ? (
                    <Camera className={styles.icon} />
                ) : (
                    <img className={styles.icon} src={MyIcon1}/>
                )}
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

