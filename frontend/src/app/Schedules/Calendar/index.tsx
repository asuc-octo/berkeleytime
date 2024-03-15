import { MouseEvent, useMemo, useRef, useState } from "react";

import styles from "./Calendar.module.scss";

export default function Calendar() {
  const ref = useRef<HTMLDivElement>(null);
  const [y, setY] = useState<number | null>(null);

  const currentTime = useMemo(() => {
    if (!ref.current || !y) return;

    const percent = y / ref.current.getBoundingClientRect().height;

    const hour = (Math.floor(percent * 18) + 6) % 12 || 12;

    const minute = Math.floor((percent * 18 * 60) % 60);
    const formattedMinute = minute < 10 ? `0${minute}` : minute;

    return `${hour}:${formattedMinute}`;
  }, [y]);

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const y = Math.max(
      13,
      Math.min(
        event.clientY - ref.current.getBoundingClientRect().top,
        ref.current.clientHeight - 11
      )
    );

    setY(y);
  };

  const handleMouseLeave = () => {
    setY(null);
  };

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.timeZone}>PST</div>
        <div className={styles.week}>
          <div className={styles.day}>Sunday</div>
          <div className={styles.day}>Monday</div>
          <div className={styles.day}>Tuesday</div>
          <div className={styles.day}>Wednesday</div>
          <div className={styles.day}>Thursday</div>
          <div className={styles.day}>Friday</div>
          <div className={styles.day}>Saturday</div>
        </div>
      </div>
      <div
        className={styles.view}
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className={styles.sideBar}>
          {currentTime && y && (
            <div className={styles.time} style={{ top: `${y - 13}px` }}>
              {currentTime}
            </div>
          )}
          {[...Array(17)].map((_, hour) => (
            <div key={hour} className={styles.hour}>
              {hour + 7 < 12
                ? `${hour + 7} AM`
                : `${hour + 7 === 12 ? 12 : hour - 5} PM`}
            </div>
          ))}
        </div>
        <div className={styles.week}>
          {[...Array(7)].map((_, day) => (
            <div key={day} className={styles.day}>
              <div className={styles.event}>
                <p className={styles.heading}>AFRICAM 294</p>
                <p className={styles.description}>Lecture</p>
              </div>
              <div className={styles.event}>
                <p className={styles.heading}>Soccer practice</p>
                <p className={styles.description}>Custom event</p>
              </div>
              {y && (
                <div className={styles.line} style={{ top: `${y - 1}px` }} />
              )}
              {[...Array(18)].map((_, hour) => (
                <div key={hour} className={styles.hour}></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
