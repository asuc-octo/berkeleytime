import { useEffect, useMemo, useRef, useState } from "react";

import classNames from "classnames";

import { Card, Color } from "@repo/theme";

import { componentMap } from "@/lib/api";

import { ScheduleEvent, getY } from "../../schedule";
import styles from "./Event.module.scss";

interface EventProps {
  columns: number;
  position: number;
  active: boolean;
  flipPopup: boolean;
  color: Color;
}

// TODO: Hover card
export default function Event({
  columns,
  position,
  startTime,
  endTime,
  active,
  flipPopup,
  color,
  ...props
}: EventProps & ScheduleEvent) {
  const [isHovered, setIsHovered] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const [popupWidth, setPopupWidth] = useState(250);

  const top = useMemo(() => getY(startTime!), [startTime]);

  const height = useMemo(() => getY(endTime!) - top + 1, [top, endTime]);

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
    return "Custom event";
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
  }, [columns, position, top, height, props]);

  const popupStyle = useMemo(() => {
    const eventWidth = `calc((100% - 4px - ${columns - 1} * 2px) / ${columns})`;
    const eventLeft = `calc(2px + calc((100% - 4px - ${columns - 1} * 2px) / ${columns}) * ${position} + 2px * ${position})`;

    return {
      top: `${top + 1}px`,
      left: flipPopup
        ? `calc(${eventLeft} - ${popupWidth}px)`
        : `calc(${eventLeft} + ${eventWidth})`,
    };
  }, [columns, position, top, flipPopup, popupWidth]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  useEffect(() => {
    if (isHovered && popupRef.current) {
      const width = popupRef.current.offsetWidth;
      setPopupWidth(width);
    }
  }, [isHovered]);

  const formatTimeTo12Hour = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <>
      <div
        className={classNames(styles.root, { [styles.active]: active })}
        style={style}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className={styles.heading}>{title}</div>
        <div className={styles.description}>{description}</div>
        {props.type === "section" && props.section.meetings.length > 0 && (
          <div className={styles.description}>
            {props.section.meetings[0].location}
          </div>
        )}
      </div>
      <div
        ref={popupRef}
        className={classNames(styles.popup, { [styles.visible]: isHovered })}
        style={popupStyle}
      >
        <Card.Root>
          <Card.LeftBorder color={color} />
          <Card.Body>
            <Card.Heading>{title}</Card.Heading>
            <Card.Description>{description}</Card.Description>
            <Card.Description>
              {props.type === "section" && props.section.meetings.length > 0
                ? `${props.section.meetings[0].location}, `
                : ""}
              {formatTimeTo12Hour(startTime!)}-{formatTimeTo12Hour(endTime!)}
            </Card.Description>
            {props.type === "section" && props.section.meetings.length > 0 && (
              <Card.Description>
                {props.section.meetings[0].instructors
                  .map((i) => `${i.familyName}, ${i.givenName}; `)
                  .join("")
                  .slice(0, -2)}
              </Card.Description>
            )}
          </Card.Body>
        </Card.Root>
      </div>
    </>
  );
}
