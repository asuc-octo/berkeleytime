import { Fragment, useMemo, useState } from "react";

import classNames from "classnames";

import { ISeatReservationCount } from "@/lib/api";

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
  reservations: ISeatReservationCount[];
  maxEnroll: number;
  enrolledCount: number;
}

export default function Reservations({
  reservations,
  maxEnroll,
  enrolledCount,
}: ReservationsProps) {
  const [currentReservation, setCurrentReservation] = useState<number | null>(
    null
  );

  const parsedReservations = useMemo(() => {
    const _reservations = structuredClone(reservations);

    const [totalEnrollCount, totalEnrollMax] = reservations.reduce(
      ([totalEnrollCount, totalEnrollMax], { enrolledCount, maxEnroll }) => [
        totalEnrollCount + enrolledCount,
        totalEnrollMax + maxEnroll,
      ],
      [0, 0]
    );

    if (totalEnrollMax !== maxEnroll) {
      _reservations.push({
        number: 0,
        enrolledCount: enrolledCount - totalEnrollCount,
        maxEnroll: maxEnroll - totalEnrollMax,
      });
    }

    return _reservations.sort((a, b) => b.maxEnroll - a.maxEnroll);
  }, [enrolledCount, maxEnroll, reservations]);

  return (
    <div className={styles.root}>
      <p className={styles.label}>Reservations</p>
      <div className={styles.chart}>
        {parsedReservations.map(({ enrolledCount, maxEnroll }, index) => {
          const identifier = index + 1;
          const backgroundColor = getColor(enrolledCount, maxEnroll);

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
                flex: maxEnroll,
              }}
            >
              <div
                className={styles.progress}
                style={{
                  backgroundColor,
                  width: `${(enrolledCount / maxEnroll) * 100}%`,
                }}
              />
            </div>
          );
        })}
      </div>
      <div className={styles.groups}>
        {parsedReservations.map(
          ({ number, enrolledCount, maxEnroll }, index) => {
            const identifier = index + 1;
            const color = getColor(enrolledCount, maxEnroll);

            const opacity =
              !currentReservation || identifier === currentReservation
                ? 1
                : 0.25;

            return (
              <Fragment key={number}>
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
                    {number}
                  </p>
                  <p className={styles.description} style={{ opacity }}>
                    <span style={{ color }}>{enrolledCount}</span> / {maxEnroll}
                  </p>
                </div>
              </Fragment>
            );
          }
        )}
      </div>
    </div>
  );
}
