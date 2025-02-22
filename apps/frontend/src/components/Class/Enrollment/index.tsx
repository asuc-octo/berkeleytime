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

const series = [
  {
    name: "Page A",
    uv: 0,
    pv: 0,
    amt: 1,
  },
  {
    name: "Page B",
    uv: 2000,
    pv: 2500,
    amt: 2,
  },
  {
    name: "Page C",
    uv: 2500,
    pv: 2700,
    amt: 3,
  },
  {
    name: "Page D",
    uv: 2800,
    pv: 2850,
    amt: 4,
  },
  {
    name: "Page E",
    uv: 2900,
    pv: 3000,
    amt: 5,
  },
  {
    name: "Page F",
    uv: 3000,
    pv: 3000,
    amt: 6,
  },
  {
    name: "Page G",
    uv: 3010,
    pv: 3010,
    amt: 7,
  },
];

export default function Enrollment() {
  const { class: _class } = useClass();

  return (
    <div className={styles.root}>
      <div className={styles.legend}>
        <div className={styles.label}>
          <div className={styles.icon} />
          Fall 2024
        </div>
        <div className={styles.label}>
          <div className={styles.icon} />
          Average
        </div>
      </div>
      <div className={styles.chart}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            width={500}
            height={300}
            data={series}
            margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <CartesianGrid
              horizontal={false}
              stroke="var(--border-color)"
              strokeDasharray="4 4"
            />
            <Tooltip />
            <ReferenceLine
              x={3}
              stroke="var(--label-color)"
              label="Max PV PAGE"
            />
            <ReferenceLine
              y={2900}
              label="Fall 2024 enrollment limit"
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
              dataKey="uv"
              stroke="var(--paragraph-color)"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="pv"
              stroke="var(--blue-500)"
              activeDot={{ r: 8 }}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* <Reservations
        enrolledCount={_class.primarySection.enrollment.latestEnrollment.enrolledCount}
        maxEnroll={_class.primarySection.enrollment.latestEnrollment.maxEnroll}
        reservations={_class.primarySection.enrollment.latestEnrollment.seatReservationCounts}
      /> */}
    </div>
  );
}
