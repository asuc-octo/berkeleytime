import { useMemo } from "react";

import * as Tooltip from "@radix-ui/react-tooltip";

import styles from "./Time.module.scss";

const getTime = (start: string, end: string) => {
  if (!start || !end) return "To be determined";

  const [startHours, startMinutes] = start
    .split(":")
    .map((value) => parseInt(value));

  const [endHours, endMinutes] = end.split(":").map((value) => parseInt(value));

  if (startHours === 0 && endHours === 0) return "To be determined";

  let time = `${startHours % 12 || 12}`;
  if (startMinutes > 0) time += `:${startMinutes.toString().padStart(2, "0")}`;

  time += ` - ${endHours % 12 || 12}`;
  if (endMinutes > 0) time += `:${endMinutes.toString().padStart(2, "0")}`;
  time += endHours < 12 ? " AM" : " PM";

  return time;
};

interface TimeProps {
  days: boolean[];
  timeStart: string | null;
  timeEnd: string | null;
}

export default function Time({ days, timeStart, timeEnd }: TimeProps) {
  const bottom = useMemo(() => {
    if (!timeEnd) return;

    const [hours, minutes] = timeEnd.split(":").map((value) => parseInt(value));

    return 170 - ((hours - 6) * 10 + minutes / 6);
  }, [timeEnd]);

  const height = useMemo(() => {
    if (!timeStart || !timeEnd) return;

    const [startHours, startMinutes] = timeStart
      .split(":")
      .map((value) => parseInt(value));

    const [endHours, endMinutes] = timeEnd
      .split(":")
      .map((value) => parseInt(value));

    return (endHours - startHours) * 10 + (endMinutes - startMinutes) / 6;
  }, [timeStart, timeEnd]);

  const time = useMemo(() => {
    if (!days?.some((day) => day) || !timeStart || !timeEnd) return;

    return (
      days
        .reduce(
          (time, day, index) =>
            day
              ? [...time, ["Su", "M", "Tu", "W", "Th", "F", "Sa"][index]]
              : time,
          [] as string[]
        )
        .join("") +
      ", " +
      getTime(timeStart, timeEnd)
    );
  }, [days, timeStart, timeEnd]);

  return time ? (
    <Tooltip.Root disableHoverableContent>
      <Tooltip.Trigger asChild>
        <p className={styles.trigger}>{time}</p>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          asChild
          side="bottom"
          sideOffset={8}
          collisionPadding={8}
        >
          <div className={styles.calendar}>
            <Tooltip.Arrow className={styles.arrow} />
            {days.map((day, index) => (
              <>
                {index > 0 && <div className={styles.divider} />}
                <div className={styles.day}>
                  <div className={styles.label}>
                    {["Su", "M", "Tu", "W", "Th", "F", "Sa"][index]}
                  </div>
                  {day && (
                    <div
                      className={styles.event}
                      style={{ bottom: `${bottom}px`, height: `${height}px` }}
                    />
                  )}
                </div>
              </>
            ))}
          </div>
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  ) : (
    <Tooltip.Root disableHoverableContent>
      <Tooltip.Trigger asChild>
        <p className={styles.trigger}>To be determined</p>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          asChild
          side="bottom"
          sideOffset={8}
          collisionPadding={8}
        >
          <div className={styles.content}>
            <Tooltip.Arrow className={styles.arrow} />
            <p className={styles.title}>Time</p>
            <p className={styles.description}>
              The time for this class has not been determined yet.
            </p>
          </div>
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
