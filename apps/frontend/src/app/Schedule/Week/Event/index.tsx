import { useMemo } from "react";

import classNames from "classnames";

import { ISection, componentMap } from "@/lib/api";
import { getColor } from "@/lib/section";

import { getY } from "../../schedule";
import styles from "./Event.module.scss";

interface EventProps {
  columns: number;
  position: number;
  active: boolean;
}

// TODO: Hover card
export default function Event({
  columns,
  position,
  meetings: [{ startTime, endTime }],
  subject,
  courseNumber,
  component,
  number,
  active,
}: EventProps & ISection) {
  const top = useMemo(() => getY(startTime!), [startTime]);

  const height = useMemo(() => getY(endTime!) - top + 1, [top, endTime]);

  return (
    <div
      className={classNames(styles.root, { [styles.active]: active })}
      style={{
        top: `${top + 1}px`,
        backgroundColor: getColor(subject, courseNumber),
        height: `${height - 2}px`,
        width: `calc((100% - 4px - ${columns - 1} * 2px) / ${columns})`,
        left: `calc(2px + calc((100% - 4px - ${columns - 1} * 2px) / ${columns}) * ${position} + 2px * ${position})`,
      }}
    >
      <div className={styles.heading}>
        {subject} {courseNumber}
      </div>
      <div className={styles.description}>
        {componentMap[component]} {number}
      </div>
    </div>
  );
}
