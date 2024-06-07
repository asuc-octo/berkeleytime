import classNames from "classnames";

import { getColor } from "@/lib/section";

import { IDay } from "../../semester";
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
          {date.format("D") === "1" && (
            <p className={styles.month}>{date.format("MMMM")}</p>
          )}
          <p className={styles.number}>{date.format("D")}</p>
        </div>
      )}
      {events.map((event) => (
        <div
          className={classNames(styles.event, {
            [styles.active]: event.active,
          })}
          style={{
            backgroundColor: getColor(
              event.course.subject,
              event.course.number
            ),
          }}
        >
          <div className={styles.time}>
            {parseTime(event.meetings[0].startTime)}
          </div>
          <div className={styles.course}>
            {event.course.subject} {event.course.number}
          </div>
        </div>
      ))}
    </div>
  );
}
