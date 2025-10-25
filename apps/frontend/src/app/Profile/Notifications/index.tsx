import { useState, useCallback } from "react";

import { useReadUser, useUpdateUser } from "@/hooks/api";
import { IMonitoredClass } from "@/lib/api/users";

import NotificationClassCard from "./NotificationClassCard";
import styles from "./Notifications.module.scss";

// Test data for development
const TEST_DATA: IMonitoredClass[] = [
  {
    class: {
      title: "Foundations of the U.S. Air Force",
      subject: "AEROSPC",
      number: "1A",
      courseNumber: "1A",
      year: 2024,
      semester: "Spring",
      sessionId: null,
      unitsMin: 1,
      unitsMax: 1,
      course: {
        title: "Foundations of the U.S. Air Force",
        subject: "AEROSPC",
        number: "1A",
        gradeDistribution: {
          average: "A+"
        }
      },
      primarySection: {
        enrollment: {
          latest: {
            enrolledCount: 0,
            maxEnroll: 60,
            waitlistedCount: 0,
            maxWaitlist: 0
          }
        }
      },
      gradeDistribution: {
        average: "A+"
      }
    } as any,
    thresholds: [100]
  },
  {
    class: {
      title: "Introduction to Computer Science",
      subject: "COMPSCI",
      number: "61A",
      courseNumber: "61A",
      year: 2024,
      semester: "Fall",
      sessionId: null,
      unitsMin: 4,
      unitsMax: 4,
      course: {
        title: "Introduction to Computer Science",
        subject: "COMPSCI",
        number: "61A",
        gradeDistribution: {
          average: "B+"
        }
      },
      primarySection: {
        enrollment: {
          latest: {
            enrolledCount: 450,
            maxEnroll: 500,
            waitlistedCount: 25,
            maxWaitlist: 50
          }
        }
      },
      gradeDistribution: {
        average: "B+"
      }
    } as any,
    thresholds: [50, 75, 90]
  },
  {
    class: {
      title: "Calculus",
      subject: "MATH",
      number: "1A",
      courseNumber: "1A",
      year: 2024,
      semester: "Spring",
      sessionId: null,
      unitsMin: 4,
      unitsMax: 4,
      course: {
        title: "Calculus",
        subject: "MATH",
        number: "1A",
        gradeDistribution: {
          average: "B"
        }
      },
      primarySection: {
        enrollment: {
          latest: {
            enrolledCount: 200,
            maxEnroll: 250,
            waitlistedCount: 10,
            maxWaitlist: 30
          }
        }
      },
      gradeDistribution: {
        average: "B"
      }
    } as any,
    thresholds: [75, 100]
  }
];

export default function Notifications() {
  const { data: user } = useReadUser();
  const [updateUser] = useUpdateUser();

  // Local state for managing notification preferences
  // Use test data if no monitored classes exist
  const [monitoredClasses, setMonitoredClasses] = useState<IMonitoredClass[]>(
    user?.monitoredClasses && user.monitoredClasses.length > 0
      ? user.monitoredClasses
      : TEST_DATA
  );

  const [addDropDeadline, setAddDropDeadline] = useState(false);
  const [lateChangeSchedule, setLateChangeSchedule] = useState(false);
  const [receiveEmails, setReceiveEmails] = useState(true);

  const handleThresholdChange = (classIndex: number, threshold: number, checked: boolean) => {
    const updated = [...monitoredClasses];
    const currentThresholds = updated[classIndex].thresholds;

    if (checked) {
      updated[classIndex].thresholds = [...currentThresholds, threshold].sort((a, b) => a - b);
    } else {
      updated[classIndex].thresholds = currentThresholds.filter((t) => t !== threshold);
    }

    setMonitoredClasses(updated);
    // TODO: Call mutation to update user preferences
    console.log("Update thresholds for class:", classIndex, updated[classIndex].thresholds);
  };

  const handleRemoveClass = async (classIndex: number) => {
    const updated = monitoredClasses.filter((_, index) => index !== classIndex);
    setMonitoredClasses(updated);
    // TODO: Call mutation to update user monitoredClasses
    console.log("Removed class at index:", classIndex);
  };

  const bookmark = useCallback(async (classToBookmark: any) => {
    if (!user || !classToBookmark) return;

    const bookmarked = user.bookmarkedClasses.some(
      (bookmarkedClass) =>
        bookmarkedClass.subject === classToBookmark.subject &&
        bookmarkedClass.courseNumber === classToBookmark.courseNumber &&
        bookmarkedClass.number === classToBookmark.number &&
        bookmarkedClass.year === classToBookmark.year &&
        bookmarkedClass.semester === classToBookmark.semester
    );

    const bookmarkedClasses = bookmarked
      ? user.bookmarkedClasses.filter(
          (bookmarkedClass) =>
            !(
              bookmarkedClass.subject === classToBookmark.subject &&
              bookmarkedClass.courseNumber === classToBookmark.courseNumber &&
              bookmarkedClass.number === classToBookmark.number &&
              bookmarkedClass.year === classToBookmark.year &&
              bookmarkedClass.semester === classToBookmark.semester
            )
        )
      : [...user.bookmarkedClasses, classToBookmark];

    const payload = {
      bookmarkedClasses: bookmarkedClasses.map((bookmarkedClass) => ({
        subject: bookmarkedClass.subject,
        number: bookmarkedClass.number,
        courseNumber: bookmarkedClass.courseNumber,
        year: bookmarkedClass.year,
        semester: bookmarkedClass.semester,
        sessionId: bookmarkedClass.sessionId || "1", // Default to "1" if null
      })),
    };

    await updateUser(payload);
  }, [user, updateUser]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Course Enrollment & Waitlist Notifications</h1>
        <p className={styles.subtitle}>
          Manage the classes you are tracking for enrollment changes. You can set specific alerts for enrollment thresholds, waitlist movement, and open seats for each course. Notifications will be delivered to your registered @berkeley.edu email address.
        </p>
      </div>

      <div className={styles.section}>
        <div className={styles.toggleOptions}>
          <label className={styles.toggleOption}>
            <input
              type="checkbox"
              checked={receiveEmails}
              onChange={(e) => setReceiveEmails(e.target.checked)}
              className={styles.toggle}
            />
            <h2 style={{ margin: 0 }}>Receive Emails</h2>
          </label>
        </div>
      </div>

      <div className={styles.section}>
        <h2>Classes You're Tracking</h2>

        {monitoredClasses.length === 0 ? null : (
          <div className={styles.classGrid}>
            {monitoredClasses.map((monitoredClass, index) => {
              const isBookmarked = user?.bookmarkedClasses.some(
                (bookmarkedClass) =>
                  bookmarkedClass.subject === monitoredClass.class.subject &&
                  bookmarkedClass.courseNumber === monitoredClass.class.courseNumber &&
                  bookmarkedClass.number === monitoredClass.class.number &&
                  bookmarkedClass.year === monitoredClass.class.year &&
                  bookmarkedClass.semester === monitoredClass.class.semester
              );

              return (
                <NotificationClassCard
                  key={index}
                  class={monitoredClass.class}
                  thresholds={monitoredClass.thresholds}
                  onThresholdChange={(threshold, checked) => handleThresholdChange(index, threshold, checked)}
                  onRemoveClass={async () => await handleRemoveClass(index)}
                  bookmarked={isBookmarked}
                  bookmarkToggle={() => bookmark(monitoredClass.class)}
                />
              );
            })}
          </div>
        )}
      </div>

      <div className={styles.section}>
        <h2>Add/Drop Deadline Notifications</h2>
        <p className={styles.sectionDescription}>
          Get notified about key academic deadlines, including add/drop and late change of class schedule for the semester.
        </p>

        <div className={styles.toggleOptions}>
          <label className={styles.toggleOption}>
            <input
              type="checkbox"
              checked={addDropDeadline}
              onChange={(e) => setAddDropDeadline(e.target.checked)}
              className={styles.toggle}
            />
            <span>Add/drop deadline</span>
          </label>
          <label className={styles.toggleOption}>
            <input
              type="checkbox"
              checked={lateChangeSchedule}
              onChange={(e) => setLateChangeSchedule(e.target.checked)}
              className={styles.toggle}
            />
            <span>Late change of class schedule</span>
          </label>
        </div>
      </div>
    </div>
  );
}
