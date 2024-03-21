import { MouseEvent, useMemo, useRef, useState } from "react";

import { IEvent } from "../types";
import styles from "./Calendar.module.scss";
import Event from "./Event";
import { getY } from "./calendar";

const adjustAttachedEvents = (
  relevantEvents: IEvent[],
  attachedEvents: number[],
  minutes: number[][],
  positions: Record<number, [number, number]>
) => {
  const adjustedEvents: number[] = [];

  const adjustEvent = (eventId: number) => {
    if (adjustedEvents.includes(eventId)) return;

    adjustedEvents.push(eventId);

    positions[eventId][1]++;

    const event = relevantEvents.find(({ id }) => id === eventId);
    if (!event) return;

    const top = getY(event.startTime);
    const height = getY(event.endTime) - top;

    for (let i = top; i < top + height; i++) {
      for (const eventId of minutes[i]) {
        adjustEvent(eventId);
      }
    }
  };

  for (const eventId of attachedEvents) {
    adjustEvent(eventId);
  }
};

interface CalendarProps {
  events: IEvent[];
  boundary: Element | null;
}

export default function Calendar({ events, boundary }: CalendarProps) {
  const viewRef = useRef<HTMLDivElement>(null);
  const [y, setY] = useState<number | null>(null);

  const days = useMemo(
    () =>
      [...Array(7)].map((_, day) => {
        const positions: Record<number, [number, number]> = {};
        const minutes: number[][] = [...Array(60 * 18)].map(() => []);

        const relevantEvents = events
          // Filter events for the current day
          .filter((event) => event.days[day])
          // Sort events by start time
          .sort((a, b) => getY(a.startTime) - getY(b.startTime));

        for (const event of relevantEvents) {
          const top = getY(event.startTime);
          const height = getY(event.endTime) - top;

          const attachedEvents = minutes[top];

          let position = 0;

          while (
            attachedEvents.findIndex(
              (eventId) => positions[eventId][0] === position
            ) !== -1
          ) {
            position++;
          }

          if (
            attachedEvents.length > 0 &&
            Math.max(
              position,
              ...attachedEvents.map((eventId) => positions[eventId][0])
            ) === position
          ) {
            adjustAttachedEvents(
              relevantEvents,
              attachedEvents,
              minutes,
              positions
            );
          }

          positions[event.id] = [
            position,
            attachedEvents.length === 0 ? 1 : positions[attachedEvents[0]][1],
          ];

          for (let i = top; i < top + height; i++) {
            minutes[i].push(event.id);
          }
        }

        return relevantEvents.map((event) => {
          const [position, columns] = positions[event.id];

          return {
            ...event,
            position,
            columns,
          };
        });
      }),
    [events]
  );

  const currentTime = useMemo(() => {
    if (!viewRef.current || !y) return;

    const hour = (Math.floor(y / 60) + 6) % 12 || 12;
    const minute = Math.floor(y % 60);

    return `${hour}:${minute < 10 ? `0${minute}` : minute}`;
  }, [y]);

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!viewRef.current) return;

    const y = Math.max(
      15,
      Math.min(
        event.clientY - viewRef.current.getBoundingClientRect().top,
        viewRef.current.clientHeight - 15
      )
    );

    setY(y);
  };

  const handleMouseLeave = () => {
    setY(null);
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
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
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
                <Event key={event.id} {...event} boundary={boundary} />
              ))}
              {y && <div className={styles.line} style={{ top: `${y}px` }} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
