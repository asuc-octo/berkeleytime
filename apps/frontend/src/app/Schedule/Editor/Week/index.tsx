import { MouseEvent, useEffect, useMemo, useRef, useState } from "react";

import { Color } from "@repo/theme";

import { IScheduleEvent } from "@/lib/api";

import { ScheduleEvent, SectionColor } from "../../schedule";
import Event from "./Event";
import styles from "./Week.module.scss";

import { getY } from "./helpers.ts";

// You have to trust me on this math
const adjustAttachedEvents = (
  relevantEventsAndSections: ScheduleEvent[],
  attachedSections: string[],
  minutes: string[][],
  positions: Record<string, [number, number]>
) => {
  const adjustedSections: string[] = [];
  const MAX_MINUTES = minutes.length;

  const adjustSection = (id: string) => {
    if (adjustedSections.includes(id)) return;

    adjustedSections.push(id);

    if (positions[id]) {
      positions[id][1]++;
    }

    const event = relevantEventsAndSections.find((event) => id === event.id);

    if (!event) return;

    const top = getY(event.startTime);
    const height = getY(event.endTime) - top;

    // Clamp to valid bounds to prevent out-of-bounds access
    const start = Math.max(0, Math.min(top, MAX_MINUTES - 1));
    const end = Math.max(0, Math.min(top + height, MAX_MINUTES));

    for (let i = start; i < end; i++) {
      const minuteArray = minutes[i];
      if (minuteArray) {
        for (const id of minuteArray) {
          adjustSection(id);
        }
      }
    }
  };

  for (const id of attachedSections) {
    adjustSection(id);
  }
};

interface WeekProps {
  selectedSections: SectionColor[];
  currentSection?: SectionColor | null;
  events: IScheduleEvent[];
  y?: number | null;
  updateY?: (y: number | null) => void;
}

function rotateRight<T>(arr: T[]): T[] {
  if (arr.length === 0) return arr;
  return [arr[arr.length - 1], ...arr.slice(0, arr.length - 1)];
}

export default function Week({
  selectedSections,
  currentSection,
  events,
  y: remoteY,
  updateY: updateRemoteY,
}: WeekProps) {
  const viewRef = useRef<HTMLDivElement>(null);
  const [localY, setLocalY] = useState<number | null>(null);
  const [hasScrolled, setHasScrolled] = useState(false);

  const y = useMemo(() => localY ?? remoteY, [localY, remoteY]);

  const updateLocalY = (y: number | null) => {
    setLocalY(y);
    updateRemoteY?.(y);
  };

  // Scroll to 12pm (noon) on initial load
  useEffect(() => {
    if (!hasScrolled && viewRef.current) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        if (!viewRef.current) return;

        // Find the scrollable parent container
        let scrollableParent: HTMLElement | null =
          viewRef.current.parentElement;
        while (scrollableParent) {
          const style = window.getComputedStyle(scrollableParent);
          if (
            style.overflow === "auto" ||
            style.overflowY === "auto" ||
            style.overflow === "scroll" ||
            style.overflowY === "scroll"
          ) {
            // 8am is hour 8, which is 8 * 60 = 720 minutes from midnight
            // Each hour is 60px tall, so 8am is at 8 * 60 = 480px from the top
            const scrollPosition = 8 * 60; // 480px
            scrollableParent.scrollTop = scrollPosition;
            setHasScrolled(true);
            break;
          }
          scrollableParent = scrollableParent.parentElement;
        }
      });
    }
  }, [hasScrolled]);

  const sections = useMemo(
    () =>
      currentSection ? [...selectedSections, currentSection] : selectedSections,
    [selectedSections, currentSection]
  );

  const days = useMemo(
    () =>
      [...Array(7)].map((_, day) => {
        const positions: Record<string, [number, number]> = {};
        const minutes: string[][] = [...Array(60 * 24)].map(() => []);

        const relevantEvents = events
          // Filter events for the current day
          .filter((event) => event.days[day])
          .map(
            (event) =>
              ({
                event,
                startTime: event.startTime,
                endTime: event.endTime,
                days: event.days,
                id: event._id,
                type: "custom",
                color: event.color,
              }) as ScheduleEvent
          );

        const relevantSections = sections
          // Filter sections for the current day which have a time specified
          .flatMap(({ section, color }) =>
            section.meetings
              .filter(
                (meeting) =>
                  meeting.days?.[day] &&
                  meeting.startTime &&
                  getY(meeting.startTime) >= 0
              )
              .map(
                (meeting) =>
                  ({
                    section,
                    startTime: meeting.startTime,
                    endTime: meeting.endTime,
                    days: meeting.days,
                    id: section.sectionId,
                    type: "section",
                    color: color,
                  }) as ScheduleEvent
              )
          );

        const relevantEventsAndSections = [
          ...relevantEvents,
          ...relevantSections,
        ]
          // Filter out events that are completely out of bounds
          .filter((event) => {
            const top = getY(event.startTime);
            const bottom = getY(event.endTime);
            const MAX_MINUTES = minutes.length;
            // Keep events that overlap with the visible range [0, MAX_MINUTES)
            return bottom > 0 && top < MAX_MINUTES;
          })
          .sort(
            (a, b) =>
              getY(a.startTime) - getY(b.startTime) ||
              getY(a.endTime) - getY(b.endTime)
          );

        // Maintain an array of sections that are attached to each minute
        for (const event of relevantEventsAndSections) {
          const top = getY(event.startTime);
          const height = getY(event.endTime) - top;
          const MAX_MINUTES = minutes.length;

          // Clamp to valid bounds
          const clampedTop = Math.max(0, Math.min(top, MAX_MINUTES - 1));
          const clampedBottom = Math.max(
            0,
            Math.min(top + height, MAX_MINUTES)
          );

          const attachedSections = minutes[clampedTop];

          let position = 0;

          while (
            attachedSections?.findIndex(
              (eventId) => positions[eventId]?.[0] === position
            ) !== -1
          ) {
            position++;
          }

          if (
            attachedSections.length > 0 &&
            Math.max(
              position,
              ...attachedSections.map((eventId) => positions[eventId]?.[0] ?? 0)
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
              : (positions[attachedSections[0]]?.[1] ?? 1),
          ];

          // Only add to minutes array within valid bounds
          for (let i = clampedTop; i < clampedBottom; i++) {
            if (i >= 0 && i < MAX_MINUTES) {
              minutes[i].push(event.id);
            }
          }
        }

        return relevantEventsAndSections.map((event) => {
          const [position, columns] = positions[event.id];

          return {
            ...event,
            position,
            active: event.id !== currentSection?.section.sectionId,
            columns,
          };
        });
      }),
    [sections, currentSection, events]
  );

  const timeZoneLabel = useMemo(() => {
    // Check if we're currently in Pacific Daylight Time (PDT) or Pacific Standard Time (PST)
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Los_Angeles",
      timeZoneName: "short",
    });
    const parts = formatter.formatToParts(now);
    const tzName = parts.find((part) => part.type === "timeZoneName")?.value;
    // Return PDT or PST based on the timezone name, default to PST if not found
    return tzName === "PDT" ? "PDT" : "PST";
  }, []);

  const currentTime = useMemo(() => {
    if (!viewRef.current || !y) return;

    // Convert pixel position to minutes (24 hours = 1440 minutes)
    const totalMinutes = Math.floor(
      (y / viewRef.current.clientHeight) * (60 * 24)
    );
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;
    const displayHour = hour % 12 || 12;
    const ampm = hour < 12 ? "AM" : "PM";

    return `${displayHour}:${minute < 10 ? `0${minute}` : minute} ${ampm}`;
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
        <div className={styles.timeZone}>{timeZoneLabel}</div>
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
          {[...Array(24)].map((_, hour) => {
            const displayHour = (hour + 1) % 24;
            return (
              <div key={hour} className={styles.hour}>
                {displayHour === 0
                  ? "12 AM"
                  : displayHour < 12
                    ? `${displayHour} AM`
                    : displayHour === 12
                      ? "12 PM"
                      : `${displayHour - 12} PM`}
              </div>
            );
          })}
        </div>
        <div className={styles.week}>
          {rotateRight(days).map((events, day) => (
            <div key={day} className={styles.day}>
              {[...Array(24)].map((_, hour) => (
                <div key={hour} className={styles.hour}></div>
              ))}
              {events.map((event) => (
                <Event
                  key={`${event.id}-${event.position}-${event.active}`}
                  {...event}
                  flipPopup={day >= 5}
                  color={event.color as Color}
                />
              ))}
              {y && <div className={styles.line} style={{ top: `${y}px` }} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
