import { useMemo, useRef } from "react";

import * as Tooltip from "@radix-ui/react-tooltip";

import { IEvent } from "../../types";
import { getY } from "../calendar";
import styles from "./Event.module.scss";

interface EventProps {
  columns: number;
  position: number;
  boundary: HTMLDivElement | null;
}

export default function Event({
  columns,
  position,
  preview,
  startTime,
  endTime,
  color,
  boundary,
  name,
  kind,
}: EventProps & IEvent) {
  const triggerRef = useRef<HTMLDivElement>(null);

  const top = useMemo(() => getY(startTime), [startTime]);

  const height = useMemo(() => getY(endTime) - top + 1, [top, endTime]);

  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <div
          ref={triggerRef}
          className={styles.trigger}
          style={{
            top: `${top}px`,
            backgroundColor: color,
            opacity: preview ? 0.25 : 1,
            height: `${height}px`,
            width: `calc((100% - 8px) / ${columns})`,
            left: `calc(4px + (((100% - 8px) / ${columns}) * ${position})`,
          }}
        >
          <div className={styles.heading}>{name}</div>
          <div className={styles.description}>{kind}</div>
        </div>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          collisionBoundary={boundary}
          asChild
          side="top"
          sideOffset={8}
          collisionPadding={8}
        >
          <div className={styles.content}>
            <Tooltip.Arrow className={styles.arrow} />
            <div className={styles.row}></div>
          </div>
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
