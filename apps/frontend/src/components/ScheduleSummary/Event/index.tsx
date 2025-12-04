import { useMemo } from "react";

import classNames from "classnames";

import { Tooltip } from "@repo/theme";

import { componentMap } from "@/lib/api";

import { ScheduleEvent } from "@/app/Schedule/schedule";
import styles from "./Event.module.scss";
import { getY } from "..";

interface CompactEventProps {
  columns: number;
  position: number;
  flipPopup: boolean;
  index: number;
  activeEvent: number | null;
  setActiveEvent: (event: number | null) => void;
}

export default function CompactEvent({
  columns,
  position,
  startTime,
  endTime,
  flipPopup,
  color,
  index,
  activeEvent,
  setActiveEvent,
  ...props
}: CompactEventProps & ScheduleEvent) {
  // Scale factor: compact uses 40px/hour instead of 60px/hour
  const SCALE_FACTOR = 10 / 60;
  
  const top = useMemo(() => getY(startTime!) * SCALE_FACTOR, [startTime]);

  const height = useMemo(() => (getY(endTime!) - getY(startTime!) + 1) * SCALE_FACTOR, [startTime, endTime]);

  const title = useMemo(() => {
    if (props.type === "section") {
      return `${props.section.subject} ${props.section.courseNumber}`;
    }
    return props.event.title;
  }, [props]);

  const description = useMemo(() => {
    if (props.type === "section") {
      return `${componentMap[props.section.component]} ${props.section.number}`;
    }
    return props.event.description ?? "Custom event";
  }, [props]);

  const style = useMemo(() => {
    const style: Record<string, string> = {
      top: `${top + 1}px`,
      height: `${height - 2}px`,
      width: `calc((100% - 4px - ${columns - 1} * 2px) / ${columns})`,
      left: `calc(2px + calc((100% - 4px - ${columns - 1} * 2px) / ${columns}) * ${position} + 2px * ${position})`,
    };

    if (color) {
      style.backgroundColor = `var(--${color}-500)`;
    }

    return style;
  }, [columns, position, top, height, color]);

  return (
    <Tooltip trigger={<div
      className={classNames(styles.root, { [styles.active]: activeEvent === index || activeEvent === null })}
      style={style}
      onMouseEnter={() => setActiveEvent(index)}
      onMouseLeave={() => setActiveEvent(null)}
      title={`${title} - ${description}`}
    ></div>} title={title} description={description} />
  );
}

