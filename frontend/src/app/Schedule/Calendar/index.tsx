import { useMemo, useState } from "react";

import moment from "moment";

import { ISection } from "@/lib/api";

import styles from "./Calendar.module.scss";
import Week from "./Week";
import { IDay, IEvent } from "./calendar";

interface CalendarProps {
  selectedSections: ISection[];
  currentSection: ISection | null;
}

export default function Calendar({
  selectedSections,
  currentSection,
}: CalendarProps) {
  const [first] = useState(() => moment("2024-01-01"));
  const [last] = useState(() => moment("2024-05-31"));

  const [start] = useState(() => {
    const current = moment("2024-01-01");
    current.subtract(current.day(), "days");
    return current;
  });

  const [stop] = useState(() => {
    const stop = moment("2024-05-31");
    stop.add(6 - stop.day(), "days");
    return stop;
  });

  const events = useMemo(
    () =>
      (currentSection
        ? [...selectedSections, currentSection]
        : selectedSections
      ).reduce((events, section) => {
        const {
          startDate,
          endDate,
          meetings,
          exams,
          course: { subject, number },
          ccn,
        } = section;

        for (const exam of exams) {
          const { date, startTime, endTime } = exam;

          events.push({
            date,
            subject: subject,
            number: number,
            active: currentSection?.ccn === ccn,
            startTime,
            endTime,
            startDate,
            endDate,
          });
        }

        for (const meeting of meetings) {
          const { days, startTime, endTime } = meeting;

          events.push({
            startDate,
            endDate,
            subject: subject,
            number: number,
            active: currentSection?.ccn === ccn,
            days,
            startTime,
            endTime,
          });
        }

        return events;
      }, [] as IEvent[]),
    [selectedSections, currentSection]
  );

  const weeks = useMemo(() => {
    const weeks: IDay[][] = [];

    const current = moment(start);

    while (current.isSameOrBefore(stop)) {
      const week = [];

      for (let i = 0; i < 7; i++) {
        const day = {
          date: moment(current),
          events: events
            .filter(
              ({ startDate, endDate, date, days }) =>
                current.isSameOrAfter(startDate) &&
                current.isSameOrBefore(endDate) &&
                (moment(date).isSame(current, "day") || days?.[current.day()])
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
              days={days}
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
