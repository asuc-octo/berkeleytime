// import { IClass } from "@/lib/api";
import { useMemo } from "react";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import useClass from "@/hooks/useClass";

import styles from "./Enrollment.module.scss";

// import Reservations from "./Reservations";

// import Reservations from "./Reservations";

export default function Enrollment() {
  const { class: _class } = useClass();

  const data = useMemo(() => {
    if (!_class.primarySection.enrollment) return [];
    const day0 = new Date(_class.primarySection.enrollment?.history[0].time);
    return _class.primarySection.enrollment?.history
      .reduce(
        (acc, enrollment) => {
          const dayOffset = Math.ceil(
            (new Date(enrollment.time).getTime() - day0.getTime()) /
              (1000 * 3600 * 24)
          );
          acc.push({
            day: dayOffset,
            enrollment: enrollment.enrolledCount,
          });
          return acc;
        },
        [] as {
          enrollment: number;
          day: number;
        }[]
      )
      .sort((a, b) => a.day - b.day);
  }, [_class.primarySection.enrollment]);

  return (
    <div className={styles.root}>
      <div className={styles.chart}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            width={500}
            height={300}
            data={data}
            margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <CartesianGrid
              horizontal={false}
              stroke="var(--border-color)"
              strokeDasharray="4 4"
            />
            <Tooltip />
            <ReferenceLine
              y={_class.primarySection.enrollment?.latest.maxEnroll}
              label={`${_class.semester} ${_class.year} enrollment limit`}
              stroke="var(--label-color)"
            />
            <XAxis
              dataKey="amt"
              stroke="var(--label-color)"
              tickMargin={8}
              label={<div className={styles.label} />}
            />
            <YAxis
              stroke="var(--label-color)"
              tickFormatter={(value) => value.toLocaleString()}
              tickMargin={8}
              label={<div className={styles.label} />}
            />
            <Line
              type="monotone"
              dataKey="enrollment"
              stroke="var(--blue-500)"
              dot={false}
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className={styles.legend}>
        <div className={styles.label}>
          <div className={styles.icon} />
          {_class?.semester} {_class?.year}
        </div>
        <div className={styles.label}>
          <div className={styles.icon} />
          Average
        </div>
      </div>
      {/* { _class.primarySection.enrollment && <Reservations
        enrolledCount={_class.primarySection.enrollment.latest.enrolledCount}
        maxEnroll={_class.primarySection.enrollment.latest.maxEnroll}
        reservations={_class.primarySection.enrollment.seatReservationTypes}
      /> } */}
    </div>
  );
}