import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Legend,
  ResponsiveContainer,
  XAxis,
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
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="grade" fill="var(--label-color)" tickMargin={8} />
          <Legend />
          <Bar dataKey="percentage" fill="var(--blue-500)">
            <LabelList
              dataKey="percentage"
              position="insideTop"
              offset={16}
              fontSize={12}
              fill="var(--label-color)"
            />
          </Bar>
          <Bar dataKey="average" fill="var(--label-color)">
            <LabelList
              dataKey="average"
              position="top"
              fontSize={12}
              fill="var(--label-color)"
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
