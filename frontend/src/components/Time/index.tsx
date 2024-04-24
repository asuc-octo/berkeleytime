import {
  Fragment,
  HTMLAttributes,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";

import * as Tooltip from "@radix-ui/react-tooltip";
import classNames from "classnames";

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
  timeStart: string | null;
  timeEnd: string | null;
  tooltip?: false;
}

const Time = forwardRef<
  HTMLElement,
  TimeProps & HTMLAttributes<HTMLParagraphElement>
>(({ days, timeStart, timeEnd, tooltip, className, ...props }, ref) => {
  const rootRef = useRef<HTMLButtonElement>(null);

  // Explicitly cast the ref to the correct type
  useImperativeHandle(
    ref,
    () => rootRef.current as unknown as HTMLParagraphElement
  );

  // TODO: Use getY with a multiple instead
  const bottom = useMemo(() => {
    if (!timeEnd) return;

    const [hours, minutes] = timeEnd.split(":").map((value) => parseInt(value));

    return 170 - ((hours - 6) * 10 + minutes / 6);
  }, [timeEnd]);

  // TODO: Use getY with a multiple instead
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

  const value = useMemo(() => {
    const time = getTime(timeStart, timeEnd);

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
  }, [days, timeStart, timeEnd]);

  return value ? (
    <Tooltip.Root disableHoverableContent open={tooltip}>
      <Tooltip.Trigger asChild ref={rootRef}>
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
});

Time.displayName = "Time";

export default Time;
