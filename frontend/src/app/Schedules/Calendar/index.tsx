import { MouseEvent, useMemo, useRef, useState } from "react";

import { Event } from "../types";
import styles from "./Calendar.module.scss";

const adjustAttachedEvents = (
  relevantEvents: Event[],
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

const getY = (time: string) => {
  const [hour, minute] = time.split(":");
  return (parseInt(hour) - 6) * 60 + parseInt(minute);
};

interface CalendarProps {
  events: Event[];
}

export default function Calendar({ events }: CalendarProps) {
  const ref = useRef<HTMLDivElement>(null);
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
            console.log(minutes[i]);
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
    if (!ref.current || !y) return;

    const hour = (Math.floor(y / 60) + 6) % 12 || 12;
    const minute = Math.floor(y % 60);

    return `${hour}:${minute < 10 ? `0${minute}` : minute}`;
  }, [y]);

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const y = Math.max(
      15,
      Math.min(
        event.clientY - ref.current.getBoundingClientRect().top,
        ref.current.clientHeight - 15
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
        ref={ref}
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
              {events.map(
                (
                  {
                    kind,
                    startTime,
                    columns,
                    position,
                    endTime,
                    color,
                    placeholder,
                  },
                  index
                ) => {
                  const top = getY(startTime);
                  const height = getY(endTime) - top;

                  return (
                    <div
                      key={index}
                      className={styles.event}
                      style={{
                        top: `${top}px`,
                        backgroundColor: color,
                        opacity: placeholder ? 0.25 : 1,
                        height: `${height}px`,
                        width: `calc((100% - 8px) / ${columns})`,
                        left: `calc(4px + (((100% - 8px) / ${columns}) * ${position})`,
                      }}
                    >
                      <div className={styles.heading}>AFRICAM 294</div>
                      <div className={styles.description}>{kind}</div>
                    </div>
                  );
                }
              )}
              {y && <div className={styles.line} style={{ top: `${y}px` }} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
