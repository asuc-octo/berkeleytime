import classNames from "classnames";
import { ArrowDown } from "iconoir-react";
import moment from "moment";

import { IDay } from "../calendar";
import Day from "./Day";
import styles from "./Week.module.scss";

interface WeekProps {
  days: IDay[];
  finals: boolean;
  dead: boolean;
  first: moment.Moment;
  last: moment.Moment;
}

export default function Week({ days, finals, dead, first, last }: WeekProps) {
  return (
    <div
      className={classNames(styles.root, {
        [styles.finals]: finals,
        [styles.dead]: dead,
      })}
    >
      {(dead || finals) && (
        <div className={styles.header}>
          <ArrowDown width={12} height={12} />
          {dead ? "Reading, Review, and Recitation (RRR)" : "Finals"} week
        </div>
      )}
      <div className={styles.body}>
        {days.map(({ date, events }) => (
          <Day
            key={date.format("YYYY-MM-DD")}
            date={date}
            events={dead ? [] : events}
            active={date.isBetween(first, last, "day", "[]")}
          />
        ))}
      </div>
    </div>
  );
}
