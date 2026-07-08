import { useCallback, useState } from "react";

import { Trash } from "iconoir-react";

import { IconButton, Text } from "@repo/theme";

import ClassCard from "@/components/ClassCard";
import { useReadUser } from "@/hooks/api";
import { useUpdateUser } from "@/hooks/api/users/useUpdateUser";

import styles from "./Notifications.module.scss";

export default function Notifications() {
  const { data: user } = useReadUser();
  const [updateUser] = useUpdateUser();

  const [addDropDeadline, setAddDropDeadline] = useState(false);
  const [lateChangeSchedule, setLateChangeSchedule] = useState(false);
  const [receiveEmails, setReceiveEmails] = useState(
    user?.notificationsOn ?? true
  );

  const monitoredClasses = user?.monitoredClasses ?? [];

  const handleRemoveClass = useCallback(
    async (classIndex: number) => {
      const updated = monitoredClasses.filter((_, i) => i !== classIndex);
      await updateUser({
        notificationsOn: user?.notificationsOn ?? false,
        monitoredClasses: updated.map((mc) => ({
          class: {
            year: mc!.class!.year!,
            semester: mc!.class!.semester!,
            sessionId: mc?.class?.sessionId,
            subject: mc!.class!.subject!,
            courseNumber: mc!.class!.courseNumber!,
            number: mc!.class!.number!,
          },
        })),
      });
    },
    [monitoredClasses, updateUser, user]
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Course Enrollment Notifications</h1>
        <p className={styles.subtitle}>
          Notifications will be delivered to your registered @berkeley.edu email
          address when enrollment drops in a class you're tracking.
        </p>
      </div>

      <div className={styles.section}>
        <div className={styles.toggleOptions}>
          <label className={styles.toggleOption}>
            <input
              type="checkbox"
              checked={receiveEmails}
              onChange={(e) => setReceiveEmails(e.target.checked)}
              className={styles.toggleOption}
            />
            <h2 className={styles.noMarginHeading}>Receive Emails</h2>
          </label>
        </div>
      </div>

      <div className={styles.section}>
        <h2>Classes You're Tracking</h2>

        {monitoredClasses.length === 0 ? (
          <Text>No classes tracked yet. Click the bell icon on any class to start tracking.</Text>
        ) : (
          <div className={styles.classGrid}>
            {monitoredClasses.map((monitoredClass, index) => (
              <div key={index} className={styles.classCardWrapper}>
                <ClassCard class={monitoredClass!.class} showGrades={false} />
                <div className={styles.notificationButtonOverlay}>
                  <IconButton
                    aria-label="Stop tracking"
                    onClick={() => handleRemoveClass(index)}
                  >
                    <Trash width={16} height={16} />
                  </IconButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.section}>
        <h2>Add/Drop Deadline Notifications</h2>
        <Text className={styles.sectionDescription}>
          Get notified about key academic deadlines, including add/drop and late
          change of class schedule for the semester.
        </Text>

        <div className={styles.toggleOptions}>
          <label className={styles.toggleOption}>
            <input
              type="checkbox"
              checked={addDropDeadline}
              onChange={(e) => setAddDropDeadline(e.target.checked)}
              className={styles.toggleOption}
            />
            <span>Add/drop deadline</span>
          </label>
          <label className={styles.toggleOption}>
            <input
              type="checkbox"
              checked={lateChangeSchedule}
              onChange={(e) => setLateChangeSchedule(e.target.checked)}
              className={styles.toggleOption}
            />
            <span>Late change of class schedule</span>
          </label>
        </div>
      </div>
    </div>
  );
}
