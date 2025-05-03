import { MouseEvent, useMemo, useRef, useState } from "react";

import { IScheduleEvent, ISection } from "@/lib/api";

import { ScheduleEvent, getY } from "../schedule";
import Event from "./Event";
import styles from "./Week.module.scss";

// You have to trust me on this math
const adjustAttachedEvents = (
  relevantEventsAndSections: ScheduleEvent[],
  attachedSections: string[],
  minutes: string[][],
  positions: Record<string, [number, number]>
) => {
  const adjustedSections: string[] = [];

  const adjustSection = (id: string) => {
    if (adjustedSections.includes(id)) return;

    adjustedSections.push(id);

    positions[id][1]++;

    const event = relevantEventsAndSections.find((event) => id === event.id);

    if (!event) return;

    const top = getY(event.startTime);
    const height = getY(event.endTime) - top;

    for (let i = top; i < top + height; i++) {
      for (const id of minutes[i]) {
        adjustSection(id);
      }
    }
  };

  for (const id of attachedSections) {
    adjustSection(id);
  }
};

interface WeekProps {
  selectedSections: ISection[];
  currentSection?: ISection | null;
  events: IScheduleEvent[];
  y?: number | null;
  updateY?: (y: number | null) => void;
}

function rotateRight<T>(arr: T[]): T[] {
  if (arr.length === 0) return arr;
  return [arr[arr.length - 1], ...arr.slice(0, arr.length - 1)];
}

// Need to add alarm when users dont choose days
export default function Week({
  selectedSections,
  currentSection,
  events,
  y: remoteY,
  updateY: updateRemoteY,
}: WeekProps) {
  const viewRef = useRef<HTMLDivElement>(null);
  const [localY, setLocalY] = useState<number | null>(null);

  const y = useMemo(() => localY ?? remoteY, [localY, remoteY]);

  const updateLocalY = (y: number | null) => {
    setLocalY(y);
    updateRemoteY?.(y);
  };

  const sections = useMemo(
    () =>
      currentSection ? [...selectedSections, currentSection] : selectedSections,
    [selectedSections, currentSection]
  );

  const days = useMemo(
    () =>
      [...Array(7)].map((_, day) => {
        const positions: Record<string, [number, number]> = {};
        const minutes: string[][] = [...Array(60 * 18)].map(() => []);

        const relevantEvents = (events ?? [])
          // Filter events for the current day
          .filter((event) => {
            if (!Array.isArray(event.days)) {
              console.warn("Invalid event.days:", event);
              return false;
            }
            return event.days[day];
          })
          .map(
            (event) =>
              ({
                event,
                startTime: event.startTime,
                endTime: event.endTime,
                days: event.days,
                id: event._id,
                type: "custom",
              }) as ScheduleEvent
          );

        const relevantSections = sections
          // Filter sections for the current day which have a time specified
          .filter(
            (section) =>
              section.meetings[0].days[day] &&
              section.meetings[0].startTime &&
              getY(section.meetings[0].startTime) > 0
          )
          .map(
            (section) =>
              ({
                section,
                startTime: section.meetings[0].startTime,
                endTime: section.meetings[0].endTime,
                days: section.meetings[0].days,
                id: section.sectionId,
                type: "section",
              }) as ScheduleEvent
          );

        const relevantEventsAndSections = [
          ...relevantEvents,
          ...relevantSections,
        ].sort(
          (a, b) =>
            getY(a.startTime) - getY(b.startTime) ||
            getY(a.endTime) - getY(b.endTime)
        );

        // Maintain an array of sections that are attached to each minute
        for (const event of relevantEventsAndSections) {
          const top = getY(event.startTime);
          const height = getY(event.endTime) - top;

          const attachedSections = minutes[top];

          let position = 0;

          while (
            attachedSections.findIndex(
              (eventId) => positions[eventId][0] === position
            ) !== -1
          ) {
            position++;
          }

          if (
            attachedSections.length > 0 &&
            Math.max(
              position,
              ...attachedSections.map((eventId) => positions[eventId][0])
            ) === position
          ) {
            adjustAttachedEvents(
              relevantEventsAndSections,
              attachedSections,
              minutes,
              positions
            );
          }

          positions[event.id] = [
            position,
            attachedSections.length === 0
              ? 1
              : positions[attachedSections[0]][1],
          ];

          for (let i = top; i < top + height; i++) {
            minutes[i].push(event.id);
          }
        }

        return relevantEventsAndSections.map((event) => {
          const [position, columns] = positions[event.id];

          return {
            ...event,
            position,
            active: event.id !== currentSection?.sectionId,
            columns,
          };
        });
      }),
    [sections, currentSection, events]
  );

  const currentTime = useMemo(() => {
    if (!viewRef.current || !y) return;

    const hour = (Math.floor(y / 60) + 6) % 12 || 12;
    const minute = Math.floor(y % 60);

    return `${hour}:${minute < 10 ? `0${minute}` : minute}`;
  }, [y]);

  const updateY = (event: MouseEvent<HTMLDivElement>) => {
    if (!viewRef.current) return;

    const y = Math.max(
      15,
      Math.min(
        event.clientY - viewRef.current.getBoundingClientRect().top,
        viewRef.current.clientHeight - 15
      )
    );

    updateLocalY(y);
  };

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.timeZone}>PST</div>
        <div className={styles.week}>
          <div className={styles.day}>Sunday</div>
          <div className={styles.day}>Monday</div>
          <div className={styles.day}>Tuesday</div>
          <div className={styles.day}>Wednesday</div>
          <div className={styles.day}>Thursday</div>
          <div className={styles.day}>Friday</div>
          <div className={styles.day}>Saturday</div>
        </div>
      </div>
      <div
        className={styles.view}
        ref={viewRef}
        onMouseMove={updateY}
        onMouseOver={updateY}
        onMouseOut={() => updateLocalY(null)}
      >
        <div className={styles.sideBar}>
          {currentTime && y && (
            <div className={styles.time} style={{ top: `${y - 11.5}px` }}>
              {currentTime}
            </div>
          )}
          {[...Array(17)].map((_, hour) => (
            <div key={hour} className={styles.hour}>
              {hour + 7 < 12
                ? `${hour + 7} AM`
                : `${hour + 7 === 12 ? 12 : hour - 5} PM`}
            </div>
          ))}
        </div>
        <div className={styles.week}>
          {rotateRight(days).map((events, day) => (
            <div key={day} className={styles.day}>
              {[...Array(18)].map((_, hour) => (
                <div key={hour} className={styles.hour}></div>
              ))}
              {events.map((event) => (
                <Event key={event.id} {...event} />
              ))}
              {y && <div className={styles.line} style={{ top: `${y}px` }} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
