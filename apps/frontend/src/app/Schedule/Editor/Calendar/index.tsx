import { useMemo, useState } from "react";

import { MinusSquareDashed, MinusSquareSolid } from "iconoir-react";
import moment from "moment";

import { ISection, ITerm } from "@/lib/api";

import styles from "./Calendar.module.scss";
import Week from "./Week";
import { IDay, IEvent } from "./calendar";

interface CalendarProps {
  selectedSections: ISection[];
  currentSection: ISection | null;
  term: ITerm;
}

export default function Calendar({
  selectedSections,
  currentSection,
  term,
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
          subject,
          courseNumber: number,
          ccn,
        } = section;

        for (const meeting of meetings) {
          const { days, startTime, endTime } = meeting;

          events.push({
            startDate,
            endDate,
            subject,
            number,
            active: currentSection?.ccn === ccn,
            days,
            startTime,
            endTime,
          });
        }

        const filteredExams = exams.filter(function (exam, index) {
          return (
            exams.findIndex(
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
            active: currentSection?.ccn === ccn,
            startTime,
            endTime,
            startDate,
            endDate,
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
