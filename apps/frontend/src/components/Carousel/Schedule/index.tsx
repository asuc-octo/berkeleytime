import { ArrowRight } from "iconoir-react";
import { Link } from "react-router-dom";

import { IScheduleClass } from "@/lib/api";

import styles from "./Schedule.module.scss";

interface ScheduleProps {
  _id: string;
  name: string;
  classes: IScheduleClass[];
  semester?: string;
}

export default function Schedule({
  _id,
  name,
  classes,
  semester,
}: ScheduleProps) {
  return (
    <Link to={`/schedules/${_id}`}>
      <div className={styles.root}>
        <div className={styles.text}>
          <p className={styles.heading}>{name}</p>
          {semester && <p className={styles.description}>{semester}</p>}
          <div className={styles.row}>
            {classes.length > 0
              ? classes
                  .reduce((acc, c) => {
                    return (acc = `${acc} • ${c.class.subject} ${c.class.courseNumber}`);
                  }, "")
                  .substring(3)
              : "Empty schedule"}
          </div>
        </div>
        <div className={styles.column}>
          <div className={styles.icon}>
            <ArrowRight />
          </div>
        </div>
      </div>
    </Link>
  );
}
