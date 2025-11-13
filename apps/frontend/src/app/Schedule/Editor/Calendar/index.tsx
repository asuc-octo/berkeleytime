import { useMemo, useState } from "react";

import { MinusSquareDashed, MinusSquareSolid } from "iconoir-react";
import moment from "moment";

import { ISchedule, IScheduleEvent } from "@/lib/api";
import { Color } from "@/lib/generated/graphql";

import { SectionColor } from "../../schedule";
import styles from "./Calendar.module.scss";
import Week from "./Week";
import { IDay, IEvent } from "./calendar";

interface CalendarProps {
  selectedSections: SectionColor[];
  currentSection: SectionColor | null;
  term: ISchedule["term"];
  customEvents?: IScheduleEvent[];
}

function rotateRight<T>(arr: T[]): T[] {
  if (arr.length === 0) return arr;
  return [arr[arr.length - 1], ...arr.slice(0, arr.length - 1)];
}

export default function Calendar({
  selectedSections,
  currentSection,
  term,
  customEvents = [],
}: CalendarProps) {
  const [first] = useState(() => moment(term.startDate));
  const [last] = useState(() => moment(term.endDate));

  const [start] = useState(() => {
    const current = first;
    current.subtract(current.day(), "days");
    return current;
  });

  const [stop] = useState(() => {
    const stop = last;
    stop.add(6 - stop.day(), "days");
    return stop;
  });

  const events = useMemo(() => {
    const sectionEvents = (
      currentSection ? [...selectedSections, currentSection] : selectedSections
    ).reduce((events, { section, color }) => {
      const {
        startDate,
        endDate,
        meetings,
        exams,
        subject,
        courseNumber: number,
        sectionId,
      } = section;

      for (const meeting of meetings) {
        const { days, startTime, endTime } = meeting;

        events.push({
          startDate,
          endDate,
          subject,
          number,
          active: currentSection?.section.sectionId === sectionId,
          days: days ?? undefined,
          startTime,
          endTime,
          color,
        });
      }

      const filteredExams = exams.filter(function (exam, index) {
        return (
          exams?.findIndex(
            ({ date, startTime, endTime }) =>
              date === exam.date &&
              exam.startTime === startTime &&
              exam.endTime === endTime
          ) == index
        );
      });

      for (const exam of filteredExams) {
        const { date, startTime, endTime } = exam;

        events.push({
          date,
          subject: subject,
          number: number,
          active: currentSection?.section.sectionId === sectionId,
          startTime,
          endTime,
          startDate,
          endDate,
        });
      }

      return events;
    }, [] as IEvent[]);

    // Add custom events
    const customEventItems: IEvent[] = customEvents.map((event) => ({
      startDate: term.startDate || "",
      endDate: term.endDate || "",
      subject: event.title,
      number: "",
      active: false,
      days: event.days,
      startTime: event.startTime,
      endTime: event.endTime,
      color: event.color ?? Color.Gray,
    }));

    return [...sectionEvents, ...customEventItems];
  }, [selectedSections, currentSection, customEvents, term]);

  const weeks = useMemo(() => {
    const weeks: IDay[][] = [];

    const current = moment(start);

    while (current.isSameOrBefore(stop)) {
      const week = [];

      for (let i = 0; i < 7; i++) {
        const day = {
          date: moment(current),
          events: events
            .filter(({ startDate, endDate, date, days }) =>
              date
                ? moment(parseInt(date)).isSame(current, "day")
                : current.isSameOrAfter(startDate) &&
                  current.isSameOrBefore(endDate) &&
                  days?.[current.day()]
            )
            .sort((a, b) => a.startTime.localeCompare(b.startTime)),
        };

        week.push(day);

        current.add(1, "days");
      }

      weeks.push(week);
    }

    return weeks;
  }, [events, start, stop]);

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.legend}>
          <div className={styles.category}>
            <MinusSquareDashed />
            Section
          </div>
          <div className={styles.category}>
            <MinusSquareSolid />
            Exam
          </div>
          <div className={styles.timezone}>
            All times are listed in Pacific Standard Time (PST).
          </div>
        </div>
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
      <div className={styles.view}>
        {weeks.map((days, index) => {
          return (
            <Week
              key={index}
              days={rotateRight(days)}
              finals={index === 18}
              dead={index === 17}
              first={first}
              last={last}
            />
          );
        })}
      </div>
    </div>
  );
}
