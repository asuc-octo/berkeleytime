import { useCallback } from "react";

import { IMonitoredClassInput } from "@/lib/api";
import { NotificationEvent, Semester } from "@/lib/generated/graphql";
import { ALL_NOTIFICATION_EVENTS } from "@/lib/notifications";

import { useReadUser } from "./useReadUser";
import { useUpdateUser } from "./useUpdateUser";

export interface MonitoredClassRef {
  year: number;
  semester: Semester;
  sessionId?: string | null;
  subject: string;
  courseNumber: string;
  number: string;
}

const isSameClass = (
  a: Omit<MonitoredClassRef, "sessionId">,
  b: Omit<MonitoredClassRef, "sessionId">
) =>
  a.subject === b.subject &&
  a.courseNumber === b.courseNumber &&
  a.number === b.number &&
  a.year === b.year &&
  a.semester === b.semester;

export const useMonitoredClasses = () => {
  const { data: user } = useReadUser();
  const [updateUser, { loading: saving }] = useUpdateUser();

  const monitoredClasses = user?.monitoredClasses ?? [];

  const getMonitoredClass = (classRef: MonitoredClassRef) =>
    monitoredClasses.find((mc) => isSameClass(mc.class, classRef));

  // The API replaces the whole list, so every change re-sends the other classes
  const save = useCallback(
    async (
      change: (current: IMonitoredClassInput[]) => IMonitoredClassInput[],
      notificationsOn?: boolean
    ) => {
      const current = (user?.monitoredClasses ?? []).map((mc) => ({
        class: {
          year: mc.class.year,
          semester: mc.class.semester,
          subject: mc.class.subject,
          courseNumber: mc.class.courseNumber,
          number: mc.class.number,
        },
        events: mc.events,
      }));

      await updateUser({
        notificationsOn: notificationsOn ?? user?.notificationsOn ?? false,
        monitoredClasses: change(current),
      });
    },
    [user, updateUser]
  );

  const subscribe = useCallback(
    (
      classRef: MonitoredClassRef,
      events: NotificationEvent[] = ALL_NOTIFICATION_EVENTS
    ) =>
      save(
        (current) => [
          ...current.filter((mc) => !isSameClass(mc.class, classRef)),
          { class: classRef, events },
        ],
        true
      ),
    [save]
  );

  const setEvents = useCallback(
    (classRef: MonitoredClassRef, events: NotificationEvent[]) =>
      save(
        (current) =>
          current.map((mc) =>
            isSameClass(mc.class, classRef) ? { ...mc, events } : mc
          ),
        true
      ),
    [save]
  );

  const unsubscribe = useCallback(
    (classRef: MonitoredClassRef) =>
      save((current) =>
        current.filter((mc) => !isSameClass(mc.class, classRef))
      ),
    [save]
  );

  return {
    monitoredClasses,
    getMonitoredClass,
    subscribe,
    setEvents,
    unsubscribe,
    saving,
  };
};
