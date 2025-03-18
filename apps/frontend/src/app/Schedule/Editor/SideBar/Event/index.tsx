import { ArrowSeparateVertical, Xmark } from "iconoir-react";

import { IconButton } from "@repo/theme";

import { IScheduleEvent } from "@/lib/api";

import styles from "./Event.module.scss";

interface EventProps {
  event: IScheduleEvent;
  onDelete: (event: IScheduleEvent) => void;
}

export default function Event({ event, onDelete }: EventProps) {
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
          <IconButton className={styles.delete} onClick={() => { onDelete(event) }}>
            <Xmark />
          </IconButton>
        </div>
      </div>
    </div>
  );
}
