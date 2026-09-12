import { useCallback } from "react";

import { Trash } from "iconoir-react";

import { IconButton, Text } from "@repo/theme";

import ClassCard from "@/components/ClassCard";
import { useReadUser } from "@/hooks/api";
import { useUpdateUser } from "@/hooks/api/users/useUpdateUser";

// eslint-disable-next-line css-modules/no-unused-class
import profileStyles from "../Profile.module.scss";
import styles from "./Notifications.module.scss";

export default function Notifications() {
  const { data: user } = useReadUser();
  const [updateUser] = useUpdateUser();

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
    <div className={profileStyles.contentInner}>
      <div>
        <h1 className={profileStyles.pageTitle}>
          Course Enrollment Notifications
        </h1>
        <p className={styles.subtitle}>
          Notifications will be delivered to your registered @berkeley.edu email
          address when enrollment drops in a class you're tracking.
        </p>
      </div>

      <div className={profileStyles.pageContent}>
        <div className={profileStyles.section}>
          <h2 className={profileStyles.sectionTitle}>
            Classes You're Tracking
          </h2>

          {monitoredClasses.length === 0 ? (
            <Text>
              No classes tracked yet. Click the bell icon on any class to
              start tracking.
            </Text>
          ) : (
            <div className={styles.classGrid}>
              {monitoredClasses.map((monitoredClass, index) => (
                <div key={index} className={styles.classCardWrapper}>
                  <ClassCard
                    class={monitoredClass!.class}
                    showGrades={false}
                  />
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
      </div>
    </div>
  );
}
