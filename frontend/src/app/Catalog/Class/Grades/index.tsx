import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import styles from "./Grades.module.scss";

const data = [
  {
    grade: "A",
    percentage: 20,
    average: 25,
  },
  {
    grade: "B",
    percentage: 15,
    average: 20,
  },
  {
    grade: "C",
    percentage: 10,
    average: 15,
  },
  {
    grade: "D",
    percentage: 5,
    average: 10,
  },
  {
    grade: "F",
    percentage: 2.5,
    average: 5,
  },
  {
    grade: "Pass",
    percentage: 35,
    average: 20,
  },
  {
    grade: "Not pass",
    percentage: 17.5,
    average: 5,
  },
];

export default function Grades() {
  return (
    <div className={styles.root}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart width={730} height={250} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="grade" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="percentage" fill="#8884d8" />
          <Bar dataKey="average" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
