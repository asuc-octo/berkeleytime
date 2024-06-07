import { useMemo, useState } from "react";

import moment from "moment";

import { ISection } from "@/lib/api";

import styles from "./Semester.module.scss";
import Week from "./Week";
import { IDay } from "./semester";

interface CalendarProps {
  selectedSections: ISection[];
  currentSection: ISection | null;
}

export default function Calendar({
  selectedSections,
  currentSection,
}: CalendarProps) {
  const sections = useMemo(
    () =>
      currentSection ? [...selectedSections, currentSection] : selectedSections,
    [selectedSections, currentSection]
  );

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

  const weeks = useMemo(() => {
    const weeks: IDay[][] = [];

    const current = moment(start);

    while (current.isSameOrBefore(stop)) {
      const week = [];

      for (let i = 0; i < 7; i++) {
        const day = {
          date: moment(current),
          events: sections
            .filter(
              ({ startDate, endDate, meetings }) =>
                current.isSameOrAfter(startDate) &&
                current.isSameOrBefore(endDate) &&
                meetings[0]?.days[current.day()]
            )
            .sort((a, b) =>
              a.meetings[0].startTime.localeCompare(b.meetings[0].startTime)
            )
            .map((section) => ({
              ...section,
              active: section.ccn === currentSection?.ccn,
            })),
        };

        week.push(day);

        current.add(1, "days");
      }

      weeks.push(week);
    }

    return weeks;
  }, [sections, currentSection, start, stop]);

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
