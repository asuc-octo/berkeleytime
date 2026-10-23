import { BellOff } from "iconoir-react";

import {
  Button,
  Text,
  ToastProvider,
  ToastViewport,
  useToast,
} from "@repo/theme";

import ClassCard from "@/components/ClassCard";
import { useMonitoredClasses } from "@/hooks/api/users/useMonitoredClasses";

// eslint-disable-next-line css-modules/no-unused-class
import profileStyles from "../Profile.module.scss";
import styles from "./Notifications.module.scss";

function TrackedClasses() {
  const { monitoredClasses, unsubscribe, saving } = useMonitoredClasses();
  const showToast = useToast();

  const handleUnsubscribe = async (
    monitoredClass: (typeof monitoredClasses)[number]["class"]
  ) => {
    try {
      await unsubscribe(monitoredClass);
      showToast({
        message: `You'll no longer be notified about ${monitoredClass.subject} ${monitoredClass.courseNumber}.`,
      });
    } catch {
      showToast({
        message: "Couldn't update your notifications. Please try again.",
        variant: "error",
      });
    }
  };

  if (monitoredClasses.length === 0) {
    return (
      <Text>
        No classes tracked yet. Click the bell icon on any class to start
        tracking.
      </Text>
    );
  }

  return (
    <div className={styles.classGrid}>
      {monitoredClasses.map(({ class: monitoredClass }) => (
        <div
          key={`${monitoredClass.year}-${monitoredClass.semester}-${monitoredClass.subject}-${monitoredClass.courseNumber}-${monitoredClass.number}`}
          className={styles.classCardWrapper}
        >
          <ClassCard class={monitoredClass} />
          <Button
            variant="secondary"
            disabled={saving}
            onClick={() => handleUnsubscribe(monitoredClass)}
          >
            <BellOff />
            Unsubscribe
          </Button>
        </div>
      ))}
    </div>
  );
}

export default function Notifications() {
  return (
    <ToastProvider>
      <div className={profileStyles.contentInner}>
        <h1 className={profileStyles.pageTitle}>Notifications</h1>
        <TrackedClasses />
      </div>
      <ToastViewport />
    </ToastProvider>
  );
}
