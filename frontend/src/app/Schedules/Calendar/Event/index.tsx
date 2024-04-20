import { useMemo, useRef } from "react";

import * as Tooltip from "@radix-ui/react-tooltip";

import { ISection } from "@/lib/api";

import { getY } from "../calendar";
import styles from "./Event.module.scss";

interface EventProps {
  columns: number;
  position: number;
  boundary: Element | null;
}

export default function Event({
  columns,
  position,
  timeStart,
  timeEnd,
  boundary,
  course,
  class: class_,
  kind,
}: EventProps & ISection) {
  const triggerRef = useRef<HTMLDivElement>(null);

  const top = useMemo(() => getY(timeStart!), [timeStart]);

  const height = useMemo(() => getY(timeEnd!) - top + 1, [top, timeEnd]);

  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <div
          ref={triggerRef}
          className={styles.trigger}
          style={{
            top: `${top}px`,
            backgroundColor: "var(--red-500)",
            // opacity: preview ? 0.25 : 1,
            height: `${height}px`,
            width: `calc((100% - 8px) / ${columns})`,
            left: `calc(4px + (((100% - 8px) / ${columns}) * ${position})`,
          }}
        >
          <div className={styles.heading}>
            {course.subject} {course.number} {class_?.number ?? "001"}
          </div>
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
