import { ArrowSeparateVertical } from "iconoir-react";

import { IScheduleEvent } from "@/lib/api";

import styles from "./Event.module.scss";

interface EventProps {
  event: IScheduleEvent;
}

export default function Event({ event }: EventProps) {
  return (
    <div className={styles.root} data-draggable>
      <div className={styles.border} />
      <div className={styles.body}>
        <div className={styles.header}>
          <div className={styles.icon}>
            <ArrowSeparateVertical />
          </div>
          <div className={styles.text}>
            <p className={styles.heading}>{event.title}</p>
            <p className={styles.description}>{event.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
