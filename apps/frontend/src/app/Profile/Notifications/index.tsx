import { useCallback, useEffect, useRef, useState } from "react";

import classNames from "classnames";

import { Text } from "@repo/theme";

import ClassCard from "@/components/ClassCard";
import NotificationButton from "@/components/NotificationButton";
import { useReadUser } from "@/hooks/api";
import { IClass } from "@/lib/api/classes";
import { IMonitoredClass } from "@/lib/api/users";

import styles from "./Notifications.module.scss";

const TOAST_DURATION_MS = 3000;
const TOAST_TRANSITION_MS = 250;

const getClassKey = (monitoredClass: IMonitoredClass) => {
  const cls = monitoredClass.class;
  return `${cls.subject}-${cls.courseNumber}-${cls.number}-${cls.year}-${cls.semester}`;
};

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
  const [toastMessage, setToastMessage] = useState("");
  const [isToastVisible, setToastVisible] = useState(false);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastHideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const prevThresholdMapRef = useRef<Map<string, number[]>>(new Map());
  const currentToastKeyRef = useRef<string | null>(null);

  const clearToastTimeout = useCallback(() => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }
  }, []);

  const clearToastHideTimeout = useCallback(() => {
    if (toastHideTimeoutRef.current) {
      clearTimeout(toastHideTimeoutRef.current);
      toastHideTimeoutRef.current = null;
    }
  }, []);

  const hideToast = useCallback(
    (onHidden?: () => void) => {
      clearToastTimeout();
      if (!isToastVisible) {
        onHidden?.();
        return;
      }

      setToastVisible(false);
      clearToastHideTimeout();
      toastHideTimeoutRef.current = setTimeout(() => {
        toastHideTimeoutRef.current = null;
        onHidden?.();
      }, TOAST_TRANSITION_MS);
    },
    [clearToastTimeout, clearToastHideTimeout, isToastVisible]
  );

  const showToast = useCallback(
    (toastKey: string, message: string) => {
      const display = () => {
        currentToastKeyRef.current = toastKey;
        setToastMessage(message);
        setToastVisible(true);
        clearToastTimeout();
        toastTimeoutRef.current = setTimeout(() => {
          hideToast(() => {
            if (currentToastKeyRef.current === toastKey) {
              currentToastKeyRef.current = null;
              setToastMessage("");
            }
          });
        }, TOAST_DURATION_MS);
      };

      if (isToastVisible) {
        hideToast(display);
      } else {
        display();
      }
    },
    [clearToastTimeout, hideToast, isToastVisible]
  );

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

  useEffect(() => {
    if (monitoredClasses.length === 0) {
      prevThresholdMapRef.current.clear();
      currentToastKeyRef.current = null;
      hideToast(() => setToastMessage(""));
      return;
    }

    const seenKeys = new Set<string>();

    for (let index = 0; index < monitoredClasses.length; index += 1) {
      const monitoredClass = monitoredClasses[index];
      const key = getClassKey(monitoredClass);
      seenKeys.add(key);

      const sortedThresholds = [...monitoredClass.thresholds].sort(
        (a, b) => a - b
      );
      const prevThresholds = prevThresholdMapRef.current.get(key);

      const hasChanged =
        !prevThresholds ||
        sortedThresholds.length !== prevThresholds.length ||
        sortedThresholds.some(
          (value, thresholdIndex) => value !== prevThresholds[thresholdIndex]
        );

      if (hasChanged) {
        prevThresholdMapRef.current.set(key, sortedThresholds);

        if (sortedThresholds.length > 0) {
          const thresholdsText = sortedThresholds
            .map((threshold) => `${threshold}%`)
            .join(", ");
          const courseLabel = `${monitoredClass.class.subject} ${monitoredClass.class.courseNumber}`;
          showToast(
            key,
            `You'll be notified about ${courseLabel} enrollment milestones (${thresholdsText}).`
          );
        } else if (currentToastKeyRef.current === key) {
          hideToast(() => {
            currentToastKeyRef.current = null;
            setToastMessage("");
          });
        }

        return;
      }

      prevThresholdMapRef.current.set(key, sortedThresholds);
    }

    prevThresholdMapRef.current.forEach((_value, key) => {
      if (!seenKeys.has(key)) {
        prevThresholdMapRef.current.delete(key);
        if (currentToastKeyRef.current === key) {
          hideToast(() => {
            currentToastKeyRef.current = null;
            setToastMessage("");
          });
        }
      }
    });
  }, [monitoredClasses, showToast, hideToast]);

  useEffect(() => {
    return () => {
      clearToastTimeout();
      clearToastHideTimeout();
    };
  }, [clearToastTimeout, clearToastHideTimeout]);

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
      <div
        className={classNames(styles.toast, {
          [styles.toastVisible]: isToastVisible && !!toastMessage,
        })}
        role="status"
        aria-live="polite"
        aria-hidden={!isToastVisible}
      >
        {toastMessage}
      </div>
    </div>
  );
}
