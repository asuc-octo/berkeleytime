import { useMemo } from "react";

import classNames from "classnames";

import { componentMap } from "@/lib/api";
import { getColor } from "@/lib/section";

import { ScheduleEvent, getY } from "../../schedule";
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
  startTime,
  endTime,
  active,
  ...props
}: EventProps & ScheduleEvent) {
  const top = useMemo(() => getY(startTime!), [startTime]);

  const height = useMemo(() => getY(endTime!) - top + 1, [top, endTime]);

  const style = useMemo(() => {
    const style: Record<string, string> = {
      top: `${top + 1}px`,
      height: `${height - 2}px`,
      width: `calc((100% - 4px - ${columns - 1} * 2px) / ${columns})`,
      left: `calc(2px + calc((100% - 4px - ${columns - 1} * 2px) / ${columns}) * ${position} + 2px * ${position})`,
    };

    if (props.type === "section") {
      style.backgroundColor = getColor(
        props.section.subject,
        props.section.courseNumber
      );
    }

    return style;
  }, [columns, position, top, height, props]);

  return (
    <div
      className={classNames(styles.root, { [styles.active]: active })}
      style={style}
    >
      <div className={styles.heading}>
        {props.type === "section"
          ? `${props.section.subject} ${props.section.courseNumber}`
          : props.event.title}
      </div>
      <div className={styles.description}>
        {props.type === "section"
          ? `${componentMap[props.section.component]} ${props.section.number}`
          : "Custom event"}
      </div>
    </div>
  );
}
