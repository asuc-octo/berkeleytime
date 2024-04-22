import { useMemo } from "react";

import classNames from "classnames";

import { ISection } from "@/lib/api";
import { getY } from "@/lib/schedule";
import { kinds } from "@/lib/section";

import styles from "./Event.module.scss";

interface EventProps {
  columns: number;
  position: number;
  active: boolean;
}

export default function Event({
  columns,
  position,
  timeStart,
  timeEnd,
  course,
  kind,
  number,
  active,
}: EventProps & ISection) {
  const top = useMemo(() => getY(timeStart!), [timeStart]);

  const height = useMemo(() => getY(timeEnd!) - top + 1, [top, timeEnd]);

  return (
    <div
      className={classNames(styles.root, { [styles.active]: active })}
      style={{
        top: `${top}px`,
        backgroundColor: "var(--red-500)",
        height: `${height}px`,
        width: `calc((100% - 8px) / ${columns})`,
        left: `calc(4px + (((100% - 8px) / ${columns}) * ${position})`,
      }}
    >
      <div className={styles.heading}>
        {course.subject} {course.number}
      </div>
      <div className={styles.description}>
        {kinds[kind]?.name ?? kind} {number}
      </div>
    </div>
  );
}
