import { useState } from "react";
import { Text } from "@repo/theme";

import { useReadUser } from "@/hooks/api";
import { IMonitoredClass } from "@/lib/api/users";
import { IClass } from "@/lib/api/classes";
import ClassCard from "@/components/ClassCard";
import NotificationButton from "@/components/NotificationButton";

import styles from "./Notifications.module.scss";

// Test data for development
const TEST_DATA: IMonitoredClass[] = [
  {
    class: {
      title: "Foundations of the U.S Air Force",
      subject: "AEROSPC",
      number: "1A",
      courseNumber: "1A",
      year: 2024,
      semester: "Spring",
      sessionId: null,
      unitsMin: 1,
      unitsMax: 1,
      course: {
        title: "Foundations of U.S Air Force",
        subject: "AEROSPC",
        number: "1A",
        gradeDistribution: {
          average: "A+",
        },
      },
      primarySection: {
        enrollment: {
          latest: {
            enrolledCount: 0,
            maxEnroll: 60,
            waitlistedCount: 0,
            maxWaitlist: 0,
          },
        },
      },
      gradeDistribution: {
        average: "A+",
      },
    } as unknown as IClass,
    thresholds: [50],
  },
  {
    class: {
      title: "Intro to Computer Science",
      subject: "COMPSCI",
      number: "61A",
      year: 2024,
      semester: "Fall",
      sessionId: null,
      unitsMin: 4,
      unitsMax: 4,
      course: {
        title: "Intro to Computer Science",
        subject: "COMPSCI",
        number: "61A",
        gradeDistribution: {
          average: "B+",
        },
      },
      primarySection: {
        enrollment: {
          latest: {
            enrolledCount: 450,
            maxEnroll: 500,
            waitlistedCount: 25,
            maxWaitlist: 50,
          },
        },
      },
      gradeDistribution: {
        average: "B+",
      },
    } as unknown as IClass,
    thresholds: [50, 75, 90],
  },
  {
    class: {
      title: "Calculus",
      subject: "MATH",
      number: "1A",
      year: 2024,
      semester: "Spring",
      sessionId: null,
      unitsMin: 4,
      unitsMax: 4,
      course: {
        title: "Calculus",
        subject: "MATH",
        gradeDistribution: {
          average: "B",
        },
      },
      primarySection: {
        enrollment: {
          latest: {
            enrolledCount: 200,
            maxEnroll: 250,
            waitlistedCount: 10,
            maxWaitlist: 30,
          },
        },
      },
      gradeDistribution: {
        average: "B",
      },
    } as unknown as IClass,
    thresholds: [75, 100],
  },
];

export default function Notifications() {
  const { data: user } = useReadUser();
  // TODO: Uncomment when backend mutations are implemented
  // const [updateUser] = useUpdateUser();

  const [monitoredClasses, setMonitoredClasses] = useState<IMonitoredClass[]>(
    user?.monitoredClasses && user.monitoredClasses.length > 0
      ? user.monitoredClasses
      : TEST_DATA
  );

  const [addDropDeadline, setAddDropDeadline] = useState(false);
  const [lateChangeSchedule, setLateChangeSchedule] = useState(false);
  const [receiveEmails, setReceiveEmails] = useState(true);

  const handleThresholdChange = (
    classIndex: number,
    threshold: number,
    checked: boolean
  ) => {
    const updated = [...monitoredClasses];
    const currentThresholds = updated[classIndex].thresholds;

    if (checked) {
      updated[classIndex].thresholds = [...currentThresholds, threshold].sort(
        (a, b) => a - b
      );
    } else {
      updated[classIndex].thresholds = currentThresholds.filter(
        (t) => t !== threshold
      );
    }

    setMonitoredClasses(updated);
    // TODO: Call backend mutation to update user.monitoredClasses
    // await updateUser({ monitoredClasses: updated });
  };

  const handleRemoveClass = async (classIndex: number) => {
    const updated = monitoredClasses.filter((_, index) => index !== classIndex);
    setMonitoredClasses(updated);
    // TODO: Call backend mutation to update user.monitoredClasses
    // await updateUser({ monitoredClasses: updated });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Course Enrollment Notifications</h1>
        <p className={styles.subtitle}>
          Manage the classes you are tracking by setting specific alerts for
          enrollment thresholds. Notifications will be delivered to your
          registered @berkeley.edu email address.
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

        {monitoredClasses.length === 0 ? null : (
          <div className={styles.classGrid}>
            {monitoredClasses.map((monitoredClass, index) => (
              <div key={index} className={styles.classCardWrapper}>
                <ClassCard class={monitoredClass.class} showGrades={false} />
                <div className={styles.notificationButtonOverlay}>
                  <NotificationButton
                    thresholds={monitoredClass.thresholds}
                    onThresholdsChange={(threshold, checked) =>
                      handleThresholdChange(index, threshold, checked)
                    }
                    onRemove={() => handleRemoveClass(index)}
                    uniqueId={`${monitoredClass.class.subject}-${monitoredClass.class.number}-${index}`}
                    variant="iconButton"
                  />
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
