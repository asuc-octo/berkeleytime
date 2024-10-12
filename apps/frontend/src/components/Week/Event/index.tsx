import { useMemo } from "react";

import * as HoverCard from "@radix-ui/react-hover-card";
import classNames from "classnames";

import { ISection, componentMap } from "@/lib/api";
import { getY } from "@/lib/schedule";
import { getColor } from "@/lib/section";

import styles from "./Event.module.scss";

interface EventProps {
  columns: number;
  position: number;
  active: boolean;
}

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

  // TODO: Hover card content
  return (
    <HoverCard.Root openDelay={0} closeDelay={100}>
      <HoverCard.Trigger asChild>
        <div
          className={classNames(styles.trigger, { [styles.active]: active })}
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
      </HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content asChild collisionPadding={8} sideOffset={8}>
          <div className={styles.content}>
            <HoverCard.Arrow className={styles.arrow} />
          </div>
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
}
