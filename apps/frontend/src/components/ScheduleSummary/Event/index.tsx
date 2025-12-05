import { useMemo } from "react";

import classNames from "classnames";

import { Tooltip } from "@repo/theme";

import { ScheduleEvent } from "@/app/Schedule/schedule";
import { componentMap } from "@/lib/api";

import { getY } from "..";
import styles from "./Event.module.scss";

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
  // Scale factor: compact uses 10px/hour instead of 60px/hour
  const SCALE_FACTOR = 15 / 60;

  const top = useMemo(() => getY(startTime!) * SCALE_FACTOR, [startTime]);

  const height = useMemo(
    () => (getY(endTime!) - getY(startTime!) + 1) * SCALE_FACTOR,
    [startTime, endTime]
  );

  const title = useMemo(() => {
    if (props.type === "section") {
      return `${props.section.subject} ${props.section.courseNumber}`;
    }
    return props.event.title;
  }, [props]);

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const timeRange = useMemo(() => {
    if (!startTime) return "";
    return formatTime(startTime);
  }, [startTime]);

  const description = useMemo(() => {
    let desc = "";
    if (props.type === "section") {
      desc = `${componentMap[props.section.component]} ${props.section.number}`;
    } else {
      desc = props.event.description ?? "Custom event";
    }

    if (timeRange) {
      return `${desc}: ${timeRange}`;
    }
    return desc;
  }, [props, timeRange]);

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
    <Tooltip
      trigger={
        <div
          className={classNames(styles.root, {
            [styles.active]: activeEvent === index || activeEvent === null,
          })}
          style={style}
          onMouseEnter={() => setActiveEvent(index)}
          onMouseLeave={() => setActiveEvent(null)}
          title={`${title} - ${description}`}
        ></div>
      }
      title={title}
      description={description}
    />
  );
}
