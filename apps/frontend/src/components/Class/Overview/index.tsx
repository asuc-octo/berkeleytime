import AttendanceRequirements from "@/components/Detail";
import Details from "@/components/Details";
import useClass from "@/hooks/useClass";

import styles from "./Overview.module.scss";

export default function Overview() {
  const { class: _class } = useClass();
  return (
    <div className={styles.root}>
      <Details {..._class.primarySection.meetings[0]} />
      <p className={styles.label}>Description</p>
      <p className={styles.description}>
        {_class.description ?? _class.course.description}
      </p>
      <AttendanceRequirements
        attendanceRequired={_class.primarySection.attendanceRequired}
        lecturesRecorded={_class.primarySection.lecturesRecorded}
      />
    </div>
  );
}
