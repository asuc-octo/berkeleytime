import { CSSProperties } from "react";

import classNames from "classnames";

import { IDay } from "../../calendar";
import styles from "./Day.module.scss";

const parseTime = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);

  let _time = `${hours % 12 || 12}`;
  if (minutes > 0) _time += `:${minutes.toString().padStart(2, "0")}`;
  _time += hours < 12 ? " AM" : " PM";

  return _time;
};

interface DayProps extends IDay {
  active: boolean;
}

export default function Day({ date, events, active }: DayProps) {
  return (
    <div key={date.format("YYYY-MM-DD")} className={styles.root}>
      {active && (
        <div className={styles.date}>
          <p className={styles.number}>{date.format("D")}</p>
        </div>
      )}
      {events.map((event, index) => {
        const color = event.color!;

        return (
          <div
            className={classNames(styles.event, {
              [styles.active]: event.active,
              [styles.exam]: event.date,
            })}
            key={index}
            style={{ "--color": `var(--${color}-500)` } as CSSProperties}
          >
            <div className={styles.time}>{parseTime(event.startTime)}</div>
            <div className={styles.course}>
              {event.subject} {event.number}
            </div>
          </div>
        );
      })}
    </div>
  );
}
