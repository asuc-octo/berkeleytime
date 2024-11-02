import styles from "./UserFeedbackModal.module.scss";

export function AttendanceForm() {
  return (
    <div className={styles.attendanceSection}>
      <h2 className={styles.sectionTitle}>Attendance & Recording</h2>
      <div className={styles.formGroup}>
        <p>1. Is lecture attendance required?</p>
        <div className={styles.radioOptions}>
          <label>
            <input type="radio" name="lectureAttendance" value="yes" />
            Yes, lecture attendance was required.
          </label>
          <label>
            <input type="radio" name="lectureAttendance" value="no" />
            No, lecture attendance was not required.
          </label>
        </div>
      </div>

      <div className={styles.formGroup}>
        <p>2. (If applicable) Was discussion attendance required?</p>
        <div className={styles.radioOptions}>
          <label>
            <input type="radio" name="discussionAttendance" value="yes" />
            Yes, discussion attendance was required.
          </label>
          <label>
            <input type="radio" name="discussionAttendance" value="no" />
            No, discussion attendance was not required.
          </label>
        </div>
      </div>

      <div className={styles.formGroup}>
        <p>3. Were lectures recorded?</p>
        <div className={styles.radioOptions}>
          <label>
            <input type="radio" name="lecturesRecorded" value="yes" />
            Yes, lectures were recorded to bCourses.
          </label>
          <label>
            <input type="radio" name="lecturesRecorded" value="no" />
            No, lectures were not recorded to bCourses.
          </label>
        </div>
      </div>
    </div>
  );
}
