import { Fragment, useState } from "react";

import classNames from "classnames";

import styles from "./Enrollment.module.scss";

const getColor = (count: number, capacity: number) => {
  const percentage = count / capacity;

  return percentage >= 0.75
    ? "var(--red-500)"
    : percentage > 0.5
      ? "var(--yellow-500)"
      : "var(--green-500)";
};

/*

    "seatReservations": [
      {
        "number": 1,
        "requirementGroup": {
          "code": "000534",
          "description": "Architecture Majors with 7 or more Terms in Attendance"
        },
        "fromDate": {
          "$date": "2023-10-06T00:00:00.000Z"
        },
        "maxEnroll": 52,
        "enrolledCount": 52,
        "_id": {
          "$oid": "661f506533427e1efaf6c504"
        }
      },
      {
        "number": 2,
        "requirementGroup": {
          "code": "000533",
          "description": "Architecture Majors with 5 or more Terms in Attendance"
        },
        "fromDate": {
          "$date": "2023-10-06T00:00:00.000Z"
        },
        "maxEnroll": 50,
        "enrolledCount": 49,
        "_id": {
          "$oid": "661f506533427e1efaf6c505"
        }
      },
      {
        "number": 6,
        "requirementGroup": {
          "code": "000531",
          "description": "College of Environmental Design Students with 5 or more Terms in Attendance"
        },
        "fromDate": {
          "$date": "2023-11-20T00:00:00.000Z"
        },
        "maxEnroll": 16,
        "enrolledCount": 6,
        "_id": {
          "$oid": "661f506533427e1efaf6c506"
        }
      },
      {
        "number": 4,
        "requirementGroup": {
          "code": "000545",
          "description": "Sustainable Environmental Design Majors with 5 or more Terms in Attendance"
        },
        "fromDate": {
          "$date": "2023-10-06T00:00:00.000Z"
        },
        "maxEnroll": 12,
        "enrolledCount": 12,
        "_id": {
          "$oid": "661f506533427e1efaf6c507"
        }
      },
      {
        "number": 5,
        "requirementGroup": {
          "code": "000054",
          "description": "Students with 7 or more Terms in Attendance"
        },
        "fromDate": {
          "$date": "2023-11-20T00:00:00.000Z"
        },
        "maxEnroll": 10,
        "enrolledCount": 2,
        "_id": {
          "$oid": "661f506533427e1efaf6c508"
        }
      },
      {
        "number": 3,
        "requirementGroup": {
          "code": "000055",
          "description": "Students with Enrollment Permission"
        },
        "fromDate": {
          "$date": "2023-10-06T00:00:00.000Z"
        },
        "maxEnroll": 10,
        "enrolledCount": 0,
        "_id": {
          "$oid": "661f506533427e1efaf6c509"
        }
      }
    ]

    */

const reservedSeats = [
  /*{
    title: "Students with Enrollment Permission",
    current: 1,
    total: 2,
  },
  {
    title: "Art History Majors",
    current: 2,
    total: 2,
  },
  {
    title: "Only Art Practice Undergraduates",
    current: 24,
    total: 30,
  },*/
  {
    title: "Architecture Majors with 7 or more Terms in Attendance",
    current: 52,
    total: 52,
  },
  {
    title: "Architecture Majors with 5 or more Terms in Attendance",
    current: 49,
    total: 50,
  },
  {
    title:
      "College of Environmental Design Students with 5 or more Terms in Attendance",
    current: 6,
    total: 16,
  },
  {
    title:
      "Sustainable Environmental Design Majors with 5 or more Terms in Attendance",
    current: 12,
    total: 12,
  },
  {
    title: "Students with 7 or more Terms in Attendance",
    current: 2,
    total: 10,
  },
  {
    title: "Students with Enrollment Permission",
    current: 0,
    total: 10,
  },
];

export default function Enrollment() {
  const [currentTitle, setCurrentTitle] = useState<string | null>(null);

  return (
    <div className={styles.root}>
      <p className={styles.label}>Reserved seats</p>
      <div className={styles.chart}>
        {reservedSeats.map(({ current, total, title }) => {
          const backgroundColor = getColor(current, total);
          const opacity = !currentTitle || title === currentTitle ? 1 : 0.25;

          return (
            <div
              className={styles.bar}
              key={title}
              onMouseOver={() => setCurrentTitle(title)}
              onMouseOut={() => setCurrentTitle(null)}
              style={{ opacity, flex: total }}
            >
              <div
                className={styles.progress}
                style={{
                  backgroundColor,
                  width: `${(current / total) * 100}%`,
                }}
              />
            </div>
          );
        })}
      </div>
      <div className={styles.wrapper}>
        {reservedSeats.map(({ title, current, total }, index) => {
          const color = getColor(current, total);

          return (
            <Fragment key={title}>
              {index !== 0 && <div className={styles.divider} />}
              <div
                className={styles.row}
                onMouseOver={() => setCurrentTitle(title)}
                onMouseOut={() => setCurrentTitle(null)}
              >
                <p
                  className={classNames(styles.title, {
                    [styles.active]: title === currentTitle,
                  })}
                >
                  {title}
                </p>
                <p className={styles.description}>
                  <span style={{ color }}>{current}</span> / {total} (
                  <span style={{ color }}>
                    {((current / total) * 100).toLocaleString()}%
                  </span>
                  )
                </p>
              </div>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
