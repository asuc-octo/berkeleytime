import { Fragment, useMemo, useState } from "react";

import classNames from "classnames";

import { IReservation } from "@/lib/api";

import styles from "./Reservations.module.scss";

const getColor = (count: number, capacity: number) => {
  const percentage = count / capacity;

  return percentage >= 0.75
    ? "var(--rose-500)"
    : percentage > 0.5
      ? "var(--amber-500)"
      : "var(--emerald-500)";
};

interface ReservationsProps {
  reservations: IReservation[];
  enrollMax: number;
  enrollCount: number;
}

export default function Reservations({
  reservations,
  enrollMax,
  enrollCount,
}: ReservationsProps) {
  const [currentReservation, setCurrentReservation] = useState<number | null>(
    null
  );

  const parsedReservations = useMemo(() => {
    const _reservations = structuredClone(reservations);

    const [totalEnrollCount, totalEnrollMax] = reservations.reduce(
      ([totalEnrollCount, totalEnrollMax], { enrollCount, enrollMax }) => [
        totalEnrollCount + enrollCount,
        totalEnrollMax + enrollMax,
      ],
      [0, 0]
    );

    if (totalEnrollMax !== enrollMax) {
      _reservations.push({
        group: "All students",
        enrollCount: enrollCount - totalEnrollCount,
        enrollMax: enrollMax - totalEnrollMax,
      });
    }

    return _reservations.sort((a, b) => b.enrollMax - a.enrollMax);
  }, [enrollCount, enrollMax, reservations]);

  return (
    <div className={styles.root}>
      <p className={styles.label}>Reservations</p>
      <div className={styles.chart}>
        {parsedReservations.map(({ enrollCount, enrollMax }, index) => {
          const identifier = index + 1;
          const backgroundColor = getColor(enrollCount, enrollMax);

          const opacity =
            !currentReservation || identifier === currentReservation ? 1 : 0.25;

          return (
            <div
              className={styles.bar}
              key={index}
              onMouseOver={() => setCurrentReservation(identifier)}
              onMouseOut={() => setCurrentReservation(null)}
              style={{
                opacity,
                flex: enrollMax,
              }}
            >
              <div
                className={styles.progress}
                style={{
                  backgroundColor,
                  width: `${(enrollCount / enrollMax) * 100}%`,
                }}
              />
            </div>
          );
        })}
      </div>
      <div className={styles.groups}>
        {parsedReservations.map(({ group, enrollCount, enrollMax }, index) => {
          const identifier = index + 1;
          const color = getColor(enrollCount, enrollMax);

          const opacity =
            !currentReservation || identifier === currentReservation ? 1 : 0.25;

          return (
            <Fragment key={group}>
              {index !== 0 && <div className={styles.divider} />}
              <div
                className={styles.group}
                onMouseOver={() => setCurrentReservation(identifier)}
                onMouseOut={() => setCurrentReservation(null)}
              >
                <p
                  className={classNames(styles.title, {
                    [styles.active]: identifier === currentReservation,
                  })}
                >
                  {group}
                </p>
                <p className={styles.description} style={{ opacity }}>
                  <span style={{ color }}>{enrollCount}</span> / {enrollMax}
                </p>
              </div>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
