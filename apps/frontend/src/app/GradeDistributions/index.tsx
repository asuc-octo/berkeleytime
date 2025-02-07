import { useCallback, useEffect, useMemo, useState } from "react";

import { useApolloClient } from "@apollo/client";
import { useSearchParams } from "react-router-dom";
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
import SideBar from "./SideBar";

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

interface Input {
  subject: string;
  courseNumber: string;
  year?: number;
  semester?: Semester;
  givenName?: string;
  familyName?: string;
}

interface Output {
  color: string;
  gradeDistribution: GradeDistribution;
  input: Input;
}

const toPercent = (decimal: number) => {
	return `${(decimal).toFixed(0)}%`;
};

const COLOR_ORDER = ["#4EA6FA", "#6ADF86", "#EC5186", "#F9E151"]

const input = [
  {
    subject: "COMPSCI",
    courseNumber: "61B",
  },
  {
    subject: "COMPSCI",
    courseNumber: "61B",
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
];

export default function GradeDistributions() {
  const client = useApolloClient();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [outputs, setOutputs] = useState<Output[] | null>(null);

  const inputs = useMemo(
    () =>
      searchParams.getAll("input").reduce((acc, input) => {
        const output = input.split(";");

        // Filter out invalid inputs
        if (output.length < 2) return acc;

        // COMPSCI;61B
        if (output.length < 4) {
          const parsedInput: Input = {
            subject: output[0],
            courseNumber: output[1],
          };

          return acc.concat(parsedInput);
        }

        // Filter out invalid inputs
        if (!["T", "P"].includes(output[2])) return acc;

        // COMPSCI;61B;T;2024:Spring;John:DeNero, COMPSCI;61B;T;2024:Spring
        const term = output[output[2] === "T" ? 3 : 4]?.split(":");

        // COMPSCI;61B;P;John:DeNero;2024:Spring, COMPSCI;61B;P;John:DeNero
        const professor = output[output[2] === "T" ? 4 : 3]?.split(":");

        const parsedInput: Input = {
          subject: output[0],
          courseNumber: output[1],
          year: parseInt(term?.[0]),
          semester: term?.[1] as Semester,
          familyName: professor?.[1],
          givenName: professor?.[0],
        };

        return acc.concat(parsedInput);
      }, [] as Input[]),
    [searchParams]
  );

  const initialize = useCallback(async () => {
    setLoading(true);

    // TODO: Fetch course data

    const responses = await Promise.all(
      inputs.map(async (variables) => {
        try {
          const response = await client.query<ReadGradeDistributionResponse>({
            query: READ_GRADE_DISTRIBUTION,
            variables,
          });

          return response;
        } catch {
          // TODO: Handle errors

          return null;
        }
      })
    );

    const output = responses.reduce(
      (acc, response, index) =>
        response
          ? acc.concat({
              color: colors[Math.floor(Math.random() * colors.length)],
              gradeDistribution: response!.data.grade,
              input: inputs[index],
            })
          : acc,
      [] as Output[]
    );

    setOutputs(output);

    setLoading(false);
  }, [client, inputs]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const data = useMemo(
    () => 
      outputs?.reduce(
        (acc, output, index) => {
          output.gradeDistribution.distribution.forEach((grade) => {
            const column = acc.find((item) => item.letter === grade.letter);
            if (!column) return;
            const percent = Math.round(grade.percentage * 100);
            column[index] = percent;
          });

          return acc;
        },
        [
          { letter: "A+"},
          { letter: "A"},
          { letter: "A-"},
          { letter: "B+"},
          { letter: "B"},
          { letter: "B-"},
          { letter: "C+"},
          { letter: "C"},
          { letter: "C-"},
          { letter: "D+"},
          { letter: "D"},
          { letter: "D-"},
          { letter: "F"},
          { letter: "P"},
          { letter: "NP"},
        ] as {
          letter: string;
          [key: number]: number;
        }[]
      ),
    [outputs]
  );

  return (
    <div className={styles.root}>
      <div className={styles.panel}>
        <SideBar
          selectedCourses={inputs}
        />
      </div>
      {loading ? (
        <Boundary>
          <LoadingIndicator size="lg" />
        </Boundary>
      ) : (
        <div className={styles.view}>
          <ResponsiveContainer width="100%" height={500}>
            <BarChart
              syncId="grade-distributions"
              width={730}
              height={250}
              data={data}
            >
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
              <YAxis tickFormatter={toPercent}/>
              {(outputs?.length) && (<Tooltip labelStyle={{color: "var(--heading-color)",}} contentStyle={{backgroundColor: "var(--backdrop-color)", border: "none"}} cursor={{fill: "var(--foreground-color)"}} formatter={toPercent}/>)}
              {outputs?.map((output, index) => (
                <Bar dataKey={index} fill={COLOR_ORDER[index]} key={index} name={`${output.input.subject} ${output.input.courseNumber}`}/>
              ))}
            </BarChart>
          </ResponsiveContainer>
          <div className={styles.legend}>
            {outputs && outputs?.map((output, index) => 
              <div className={styles.info}>
                <div className={styles.heading}>
                  <span style={{backgroundColor: COLOR_ORDER[index]}} className={styles.color}/>
                  <span className={styles.course}>{output.input.subject} {output.input.courseNumber}</span>
                </div>
                <div className={styles.distType}>
                  {output.input.givenName && output.input.familyName ? `${output.input.givenName} ${output.input.familyName} ` : "All Instructors "}
                   • 
                  {output.input.semester && output.input.year ? ` ${output.input.semester} ${output.input.year}` : " All Semesters"}
                </div>
              </div>
            )}
          </div>
          { !(outputs?.length) && (<div>
            No Classes Selected
          </div>)}
        </div>
      )}
    </div>
  );
}
