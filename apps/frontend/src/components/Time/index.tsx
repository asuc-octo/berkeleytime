import { ComponentPropsWithRef, Fragment, useMemo } from "react";

import classNames from "classnames";

import styles from "./Time.module.scss";

const getTime = (start?: string | null, end?: string | null) => {
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
  days?: boolean[] | null;
  startTime?: string | null;
  endTime?: string | null;
}

export default function Time({
  days,
  startTime,
  endTime,
  className,
  ...props
}: Omit<ComponentPropsWithRef<"p">, keyof TimeProps> & TimeProps) {
  // Calculate position from midnight (0:00) to midnight (24:00)
  const bottom = useMemo(() => {
    if (!endTime) return;

    const [hours, minutes] = endTime.split(":").map((value) => parseInt(value));

    // 240px total height (24 hours * 10px/hour), position from bottom
    return 240 - (hours * 10 + minutes / 6);
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
              ? [...time, ["M", "Tu", "W", "Th", "F", "Sa", "Su"][index]]
              : time,
          [] as string[]
        )
        .join("") +
      ", " +
      time
    );
  }, [days, startTime, endTime]);

  return value ? (
    <p className={classNames(styles.trigger, className)} {...props}>
      {value}
    </p>
  ) : (
    <p className={classNames(styles.trigger, className)} {...props}>
      To be determined
    </p>
  );
}
