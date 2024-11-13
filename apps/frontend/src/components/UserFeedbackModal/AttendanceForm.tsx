import React, { useState } from 'react';
import styles from "./UserFeedbackModal.module.scss";

export function AttendanceForm() {
  const [lectureAttendance, setLectureAttendance] = useState<number | null>(null);
  const [discussionAttendance, setDiscussionAttendance] = useState<number | null>(null);
  const [lecturesRecorded, setLecturesRecorded] = useState<number | null>(null);

  return (
    <div className={styles.attendanceSection}>
      <h2 className={styles.sectionTitle}>Attendance & Recording</h2>

      {/* Question 1 */}
      <div className={styles.formGroup}>
        <p>1. Is lecture attendance required?</p>
        <div className={styles.radioOptions}>
          <label>
            <input
              type="radio"
              name="lectureAttendance"
              value="1"
              checked={lectureAttendance === 1}
              onClick={() => {
                if (lectureAttendance === 1) {
                  setLectureAttendance(null);
                } else {
                  setLectureAttendance(1);
                }
              }}
            />
            Yes, lecture attendance was required.
          </label>
          <label>
            <input
              type="radio"
              name="lectureAttendance"
              value="0"
              checked={lectureAttendance === 0}
              onClick={() => {
                if (lectureAttendance === 0) {
                  setLectureAttendance(null);
                } else {
                  setLectureAttendance(0);
                }
              }}
            />
            No, lecture attendance was not required.
          </label>
        </div>
      </div>

      {/* Question 2 */}
      <div className={styles.formGroup}>
        <p>2. (If applicable) Was discussion attendance required?</p>
        <div className={styles.radioOptions}>
          <label>
            <input
              type="radio"
              name="discussionAttendance"
              value="1"
              checked={discussionAttendance === 1}
              onClick={() => {
                if (discussionAttendance === 1) {
                  setDiscussionAttendance(null);
                } else {
                  setDiscussionAttendance(1);
                }
              }}
            />
            Yes, discussion attendance was required.
          </label>
          <label>
            <input
              type="radio"
              name="discussionAttendance"
              value="0"
              checked={discussionAttendance === 0}
              onClick={() => {
                if (discussionAttendance === 0) {
                  setDiscussionAttendance(null);
                } else {
                  setDiscussionAttendance(0);
                }
              }}
            />
            No, discussion attendance was not required.
          </label>
        </div>
      </div>

      {/* Question 3 */}
      <div className={styles.formGroup}>
        <p>3. Were lectures recorded?</p>
        <div className={styles.radioOptions}>
          <label>
            <input
              type="radio"
              name="lecturesRecorded"
              value="1"
              checked={lecturesRecorded === 1}
              onClick={() => {
                if (lecturesRecorded === 1) {
                  setLecturesRecorded(null);
                } else {
                  setLecturesRecorded(1);
                }
              }}
            />
            Yes, lectures were recorded to bCourses.
          </label>
          <label>
            <input
              type="radio"
              name="lecturesRecorded"
              value="0"
              checked={lecturesRecorded === 0}
              onClick={() => {
                if (lecturesRecorded === 0) {
                  setLecturesRecorded(null);
                } else {
                  setLecturesRecorded(0);
                }
              }}
            />
            No, lectures were not recorded to bCourses.
          </label>
        </div>
      </div>
    </div>
  );
}