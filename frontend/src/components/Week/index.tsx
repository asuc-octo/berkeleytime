import { MouseEvent, useMemo, useRef, useState } from "react";

import { ISection } from "@/lib/api";
import { getY } from "@/lib/schedule";

import Event from "./Event";
import styles from "./Week.module.scss";

const getId = (section: ISection) =>
  `${section.course.subject} ${section.course.number} ${section.class.number} ${section.number}`;

// You have to trust me on this math
const adjustAttachedEvents = (
  relevantSections: ISection[],
  attachedSections: string[],
  minutes: string[][],
  positions: Record<string, [number, number]>
) => {
  const adjustedSections: string[] = [];

  const adjustSection = (id: string) => {
    if (adjustedSections.includes(id)) return;

    adjustedSections.push(id);

    positions[id][1]++;

    const section = relevantSections.find((section) => id === getId(section));
    if (!section) return;

    const top = getY(section.meetings[0].startTime);
    const height = getY(section.meetings[0].endTime) - top;

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
  y?: number | null;
  updateY?: (y: number | null) => void;
}

export default function Week({
  selectedSections,
  currentSection,
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

        const relevantSections = sections
          // Filter sections for the current day which have a time specified
          .filter(
            (section) =>
              section.meetings[0].days[day] &&
              section.meetings[0].startTime &&
              getY(section.meetings[0].startTime) > 0
          )
          // Sort sections by when they start
          .sort(
            (a, b) =>
              getY(a.meetings[0].startTime) - getY(b.meetings[0].startTime)
          );

        // Maintain an array of sections that are attached to each minute
        for (const section of relevantSections) {
          const top = getY(section.meetings[0].startTime);
          const height = getY(section.meetings[0].endTime) - top;

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
              relevantSections,
              attachedSections,
              minutes,
              positions
            );
          }

          const id = getId(section);

          positions[id] = [
            position,
            attachedSections.length === 0
              ? 1
              : positions[attachedSections[0]][1],
          ];

          for (let i = top; i < top + height; i++) {
            minutes[i].push(id);
          }
        }

        return relevantSections.map((section) => {
          const [position, columns] = positions[getId(section)];

          return {
            ...section,
            position,
            active: section.ccn !== currentSection?.ccn,
            columns,
          };
        });
      }),
    [sections, currentSection]
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
          {days.map((events, day) => (
            <div key={day} className={styles.day}>
              {[...Array(18)].map((_, hour) => (
                <div key={hour} className={styles.hour}></div>
              ))}
              {events.map((event) => (
                <Event key={getId(event)} {...event} />
              ))}
              {y && <div className={styles.line} style={{ top: `${y}px` }} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
