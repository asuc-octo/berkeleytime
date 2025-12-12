import { useMemo, useState } from "react";

import { Color } from "@repo/theme";

import { ScheduleEvent, getNextClassColor } from "@/app/Schedule/schedule";
import { IScheduleListClass, IScheduleListSchedule } from "@/lib/api";

import CompactEvent from "./Event";
import styles from "./ScheduleSummary.module.scss";

export const getY = (time: string) => {
  const [hour, minute] = time.split(":");
  return (parseInt(hour) - 7) * 60 + parseInt(minute);
};

export type SummaryScheduleEvent = ScheduleEvent & {
  index: number;
};

// You have to trust me on this math
const adjustAttachedEvents = (
  relevantEventsAndSections: SummaryScheduleEvent[],
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

interface ScheduleSummaryProps {
  schedule: IScheduleListSchedule;
}

function rotateRight<T>(arr: T[]): T[] {
  if (arr.length === 0) return arr;
  return [arr[arr.length - 1], ...arr.slice(0, arr.length - 1)];
}

export interface SectionColor {
  color: Color;
  section: NonNullable<IScheduleListClass["class"]>["sections"][number] & {
    subject: string;
    courseNumber: string;
    classNumber: string;
  };
}

const getSelectedSections = (schedule?: IScheduleListSchedule) => {
  return (
    schedule?.classes.flatMap(({ selectedSections, class: _class, color }) =>
      selectedSections.reduce((acc, section) => {
        const _section =
          _class.primarySection?.sectionId === section.sectionId
            ? _class.primarySection
            : _class.sections.find(
                (currentSection) =>
                  currentSection.sectionId === section.sectionId
              );

        return _section
          ? [
              ...acc,
              {
                section: {
                  ..._section,
                  subject: _class.subject,
                  courseNumber: _class.courseNumber,
                  classNumber: _class.number,
                },
                color: color as Color,
              },
            ]
          : acc;
      }, [] as SectionColor[])
    ) ?? []
  );
};

export default function ScheduleSummary({ schedule }: ScheduleSummaryProps) {
  if (!schedule) return <></>;

  const events = useMemo(() => schedule.events, [schedule]);

  const sections = useMemo(() => getSelectedSections(schedule), [schedule]);

  const [activeEvent, setActiveEvent] = useState<{
    index: number;
    type: "section" | "custom";
  } | null>(null);

  const days = useMemo(
    () =>
      [...Array(7)].map((_, day) => {
        const positions: Record<string, [number, number]> = {};
        const minutes: string[][] = [...Array(60 * 18)].map(() => []);

        const relevantEvents = events
          .map(
            (event, index) =>
              ({
                event,
                startTime: event.startTime,
                endTime: event.endTime,
                days: event.days,
                id: event._id,
                type: "custom",
                color: event.color,
                index: index,
              }) as SummaryScheduleEvent
          )
          // Filter events for the current day
          .filter((event) => event.days[day]);

        const relevantSections = sections
          // Filter sections for the current day which have a time specified
          .flatMap(({ section, color }) => {
            const index = schedule.classes.findIndex(
              (c) =>
                c.class.subject === section.subject &&
                c.class.courseNumber === section.courseNumber &&
                c.class.number === section.classNumber
            );
            return section.meetings
              .filter(
                (meeting) =>
                  meeting.days?.[day] &&
                  meeting.startTime &&
                  getY(meeting.startTime) > 0
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
                    color: color ?? getNextClassColor(index),
                    index: index,
                  }) as SummaryScheduleEvent
              );
          });

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
            attachedSections?.findIndex(
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
            columns,
          };
        });
      }),
    [sections, events]
  );

  return (
    <div className={styles.root}>
      <div className={styles.view}>
        <div className={styles.week}>
          {rotateRight(days).map((events, day) => (
            <div key={day} className={styles.day}>
              {[...Array(15)].map((_, hour) => (
                <div key={hour} className={styles.hour}></div>
              ))}
              {events.map((event) => (
                <CompactEvent
                  key={`${event.id}-${event.position}`}
                  {...event}
                  flipPopup={day >= 5}
                  color={event.color as Color}
                  index={event.index}
                  activeEvent={activeEvent}
                  setActiveEvent={setActiveEvent}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
