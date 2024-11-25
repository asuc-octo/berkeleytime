import { useCallback, useEffect, useMemo, useState } from "react";

import { useApolloClient } from "@apollo/client";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Boundary, LoadingIndicator } from "@repo/theme";

import {
  GradeDistribution,
  READ_GRADE_DISTRIBUTION,
  ReadGradeDistributionResponse,
  Semester,
} from "@/lib/api";
import { colors } from "@/lib/section";

import styles from "./GradeDistributions.module.scss";

// const data = [
//   {
//     grade: "A",
//     percentage: 20,
//     average: 25,
//   },
//   {
//     grade: "B",
//     percentage: 15,
//     average: 20,
//   },
//   {
//     grade: "C",
//     percentage: 10,
//     average: 15,
//   },
//   {
//     grade: "D",
//     percentage: 5,
//     average: 10,
//   },
//   {
//     grade: "F",
//     percentage: 2.5,
//     average: 5,
//   },
//   {
//     grade: "Pass",
//     percentage: 35,
//     average: 20,
//   },
//   {
//     grade: "Not pass",
//     percentage: 17.5,
//     average: 5,
//   },
// ];

interface Output {
  color: string;
  gradeDistribution: GradeDistribution;
  input: {
    subject: string;
    courseNumber: string;
    number?: string;
    year?: number;
    semester?: Semester;
    givenName?: string;
    familyName?: string;
  };
}

const input = [
  {
    subject: "COMPSCI",
    courseNumber: "61B",
  },
  {
    subject: "COMPSCI",
    courseNumber: "61B",
    number: "001",
    year: 2024,
    semester: "Spring",
  },
  {
    subject: "COMPSCI",
    courseNumber: "61B",
    year: 2024,
    semester: "Spring",
  },
  {
    subject: "COMPSCI",
    courseNumber: "61A",
    year: 2024,
    semester: "Spring",
    givenName: "John",
    familyName: "DeNero",
  },
  // {
  //   subject: "COMPSCI",
  //   courseNumber: "61A",
  //   givenName: "Joshua",
  //   familyName: "Hug",
  // },
];

export default function GradeDistributions() {
  const client = useApolloClient();
  const [loading, setLoading] = useState(false);

  const [output, setOutput] = useState<Output[] | null>(null);

  const initialize = useCallback(async () => {
    setLoading(true);

    const responses = await Promise.all(
      input.map((variables) =>
        client.query<ReadGradeDistributionResponse>({
          query: READ_GRADE_DISTRIBUTION,
          variables,
        })
      )
    );

    const output = responses.map(
      (response, index) =>
        ({
          color: colors[Math.floor(Math.random() * colors.length)],
          gradeDistribution: response.data.grade,
          input: input[index],
        }) as Output
    );

    setOutput(output);

    setLoading(false);
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const data = useMemo(
    () =>
      output?.reduce(
        (acc, output, index) => {
          output.gradeDistribution.distribution.forEach((grade) => {
            const column = acc.find((item) => item.letter === grade.letter);
            const percent = Math.round(grade.percentage * 100);

            if (!column) {
              acc.push({ letter: grade.letter, [index]: percent });

              return;
            }

            column[index] = percent;
          });

          return acc;
        },
        [] as {
          letter: string;
          [key: number]: number;
        }[]
      ),
    [output]
  );

  console.log(data);

  return (
    <div className={styles.root}>
      <div className={styles.panel}></div>
      {loading ? (
        <Boundary>
          <LoadingIndicator size="lg" />
        </Boundary>
      ) : (
        <div className={styles.view}>
          <ResponsiveContainer width="100%" height={256}>
            <BarChart width={730} height={250} data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--border-color)"
              />
              <XAxis
                dataKey="letter"
                fill="var(--label-color)"
                tickMargin={8}
              />
              <YAxis />
              <Legend />
              <Tooltip />
              {output?.map((_, index) => (
                <Bar dataKey={index} fill={output[index].color} key={index} />
              ))}
            </BarChart>
          </ResponsiveContainer>
          <ResponsiveContainer width="100%" height={256}>
            <LineChart width={730} height={250} data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--border-color)"
              />
              <XAxis
                dataKey="letter"
                fill="var(--label-color)"
                tickMargin={8}
              />
              <YAxis />
              <Legend />
              <Tooltip />
              {output?.map((_, index) => (
                <Line
                  dataKey={index}
                  stroke={output[index].color}
                  key={index}
                  type="natural"
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
          <div className={styles.grid}>
            {output?.map((_, index) => (
              <ResponsiveContainer width="100%" height={256} key={index}>
                <BarChart width={730} height={250} data={data}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--border-color)"
                  />
                  <XAxis
                    dataKey="letter"
                    fill="var(--label-color)"
                    tickMargin={8}
                  />
                  <YAxis />
                  <Legend />
                  <Tooltip cursor={{ fill: "var(--backdrop-color)" }} />
                  <Bar dataKey={index} fill={output[index].color} />
                </BarChart>
              </ResponsiveContainer>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
