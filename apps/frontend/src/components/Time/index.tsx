import { ComponentPropsWithRef, Fragment, useMemo } from "react";

import classNames from "classnames";
import { Tooltip } from "radix-ui";

import styles from "./Time.module.scss";

const getTime = (start: string | null, end: string | null) => {
  if (!start || !end) return;

  const [startHours, startMinutes] = start
    .split(":")
    .map((value) => parseInt(value));

  const [endHours, endMinutes] = end.split(":").map((value) => parseInt(value));

  if (startHours === 0) return;

  let time = `${startHours % 12 || 12}`;
  if (startMinutes > 0) time += `:${startMinutes.toString().padStart(2, "0")}`;

  time += ` - ${endHours % 12 || 12}`;
  if (endMinutes > 0) time += `:${endMinutes.toString().padStart(2, "0")}`;
  time += endHours < 12 ? " AM" : " PM";

  return time;
};

interface TimeProps {
  days: boolean[] | null;
  startTime: string | null;
  endTime: string | null;
  tooltip?: false;
}

export default function Time({
  days,
  startTime,
  endTime,
  tooltip,
  className,
  ...props
}: Omit<ComponentPropsWithRef<"p">, keyof TimeProps> & TimeProps) {
  // TODO: Use getY with a multiple instead
  const bottom = useMemo(() => {
    if (!endTime) return;

    const [hours, minutes] = endTime.split(":").map((value) => parseInt(value));

    return 170 - ((hours - 6) * 10 + minutes / 6);
  }, [endTime]);

  // TODO: Use getY with a multiple instead
  const height = useMemo(() => {
    if (!startTime || !endTime) return;

    const [startHours, startMinutes] = startTime
      .split(":")
      .map((value) => parseInt(value));

    const [endHours, endMinutes] = endTime
      .split(":")
      .map((value) => parseInt(value));

    return (endHours - startHours) * 10 + (endMinutes - startMinutes) / 6;
  }, [startTime, endTime]);

  const value = useMemo(() => {
    const time = getTime(startTime, endTime);

    if (!days?.some((day) => day) || !time) return;

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
      time
    );
  }, [days, startTime, endTime]);

  return value ? (
    <Tooltip.Root disableHoverableContent open={tooltip}>
      <Tooltip.Trigger asChild>
        <p className={classNames(styles.trigger, className)} {...props}>
          {value}
        </p>
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
            {days!.map((day, index) => (
              <Fragment key={index}>
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
              </Fragment>
            ))}
          </div>
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  ) : (
    <p className={classNames(styles.trigger, className)} {...props}>
      To be determined
    </p>
  );
}
