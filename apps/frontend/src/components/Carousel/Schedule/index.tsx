import { IScheduleClass, ScheduleIdentifier } from "@/lib/api";

import styles from "./Schedule.module.scss";
import { Link } from "react-router-dom";
import { ArrowRight } from "iconoir-react";

interface ScheduleProps {
  _id: ScheduleIdentifier,
  name: String,
  classes: IScheduleClass[],
  semester?: String
}

export default function Schedule({_id, name, classes, semester } : ScheduleProps) {
  return (
    <Link to={`/schedules/${_id}`}>
      <div className={styles.root}>
        <div className={styles.text}>
          <p className={styles.heading}>{name}</p>
          { semester && (<p className={styles.description}>
            { semester }
          </p>) }
          <div className={styles.row}>
            { classes.length > 0 ? classes.reduce((acc, c) => {
              return acc = `${acc} • ${c.class.subject} ${c.class.courseNumber}`
            }, "").substring(3) : "Empty schedule"}
          </div> 
        </div>
        <div className={styles.column}>
          <div className={styles.icon}>
            <ArrowRight />
          </div>
        </div>
      </div>
    </Link>
  )
}