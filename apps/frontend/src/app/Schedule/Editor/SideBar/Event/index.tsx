import { ArrowSeparateVertical, Xmark } from "iconoir-react";

import { IScheduleEvent } from "@/lib/api";

import styles from "./Event.module.scss";
import { IconButton } from "@repo/theme";

interface EventProps {
  event: IScheduleEvent;
}

export default function Event({ event }: EventProps) {
  return (
    <div className={styles.root} data-draggable>
      <div className={styles.border} />
      <div className={styles.body}>
        <div className={styles.header}>
          <div className={styles.row}>
            <div className={styles.icon}>
              <ArrowSeparateVertical />
            </div>
            <div className={styles.text}>
              <p className={styles.heading}>{event.title}</p>
              <p className={styles.description}>{event.description}</p>
            </div>
          </div>
          <IconButton className={styles.delete}>
            <Xmark/>
          </IconButton>
        </div>
      </div>
    </div>
  );
}
