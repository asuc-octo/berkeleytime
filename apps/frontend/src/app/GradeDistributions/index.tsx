import { useCallback, useEffect, useMemo, useState } from "react";

import { useApolloClient } from "@apollo/client";
import { FrameAltEmpty } from "iconoir-react";
import { useSearchParams } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Boundary, Box, Flex, LoadingIndicator } from "@repo/theme";

import {
  GradeDistribution,
  READ_GRADE_DISTRIBUTION,
  ReadGradeDistributionResponse,
  Semester,
} from "@/lib/api";

import CourseManage from "./CourseManage";
import styles from "./GradeDistributions.module.scss";
import HoverInfo from "./HoverInfo";

// import HoverInfo from "./HoverInfo";

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
  gradeDistribution: GradeDistribution;
  input: Input;
  hidden: boolean;
  active: boolean;
}

const toPercent = (decimal: number) => {
  return `${decimal.toFixed(0)}%`;
};

const COLOR_ORDER = ["#4EA6FA", "#6ADF86", "#EC5186", "#F9E151"];
const DARK_COLOR_ORDER = ["#132a3e", "#1a3721", "#3b1621", "#3e3844"];

// const input = [
//   {
//     subject: "COMPSCI",
//     courseNumber: "61B",
//   },
//   {
//     subject: "COMPSCI",
//     courseNumber: "61B",
//     year: 2024,
//     semester: "Spring",
//   },
//   {
//     subject: "COMPSCI",
//     courseNumber: "61B",
//     year: 2024,
//     semester: "Spring",
//   },
//   {
//     subject: "COMPSCI",
//     courseNumber: "61A",
//     year: 2024,
//     semester: "Spring",
//     givenName: "John",
//     familyName: "DeNero",
//   },
// ];

export default function GradeDistributions() {
  const client = useApolloClient();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [outputs, setOutputs] = useState<Output[] | null>(null);

  const [hoveredLetter, setHoveredLetter] = useState<string | null>(null);
  const [hoveredSeries, setHoveredSeries] = useState<number | null>(null);

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
            fetchPolicy: "no-cache",
          });

          return response;
        } catch {
          // TODO: Handle errors

          return null;
        }
      })
    );

    if (inputs.length > 0) setHoveredSeries(0);

    const output = responses.reduce(
      (acc, response, index) =>
        response
          ? acc.concat({
              gradeDistribution: response!.data.grade,
              input: inputs[index],
              active:
                outputs && index < outputs.length
                  ? outputs[index].active
                  : false,
              hidden:
                outputs && index < outputs.length
                  ? outputs[index].hidden
                  : false,
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
          { letter: "A+" },
          { letter: "A" },
          { letter: "A-" },
          { letter: "B+" },
          { letter: "B" },
          { letter: "B-" },
          { letter: "C+" },
          { letter: "C" },
          { letter: "C-" },
          { letter: "D+" },
          { letter: "D" },
          { letter: "D-" },
          { letter: "F" },
          { letter: "P" },
          { letter: "NP" },
        ] as {
          letter: string;
          [key: number]: number;
        }[]
      ),
    [outputs]
  );

  const visibleOutputs = useMemo(() => {
    if (outputs?.find((out) => out.active) !== undefined) return 1;
    return outputs?.filter((out) => !out.hidden).length ?? 0;
  }, [outputs]);

  function updateGraphHover(data: any) {
    setHoveredLetter(data.letter);
    setHoveredSeries(data.tooltipPayload[0].dataKey);
  }

  return (
    <Box p="5" className={styles.root}>
      <Flex direction="column">
        <CourseManage
          selectedCourses={
            outputs?.map((out, i) => {
              return {
                gradeDistribution: out.gradeDistribution,
                hidden: out.hidden,
                active: out.active,
                color: COLOR_ORDER[i],
                ...out.input,
              };
            }) ?? []
          }
          hideCourse={(i) => {
            if (!outputs || outputs.length <= i) return;
            outputs[i].hidden = !outputs[i].hidden;
            setOutputs(outputs.slice());
          }}
          setActive={(ind) => {
            if (!outputs || outputs.length <= ind) return;
            for (let i = 0; i < outputs.length; i++)
              outputs[i].active = i == ind ? !outputs[i].active : false;
            setOutputs(outputs.slice());
          }}
        />
        {loading ? (
          <Boundary>
            <LoadingIndicator size="lg" />
          </Boundary>
        ) : (
          <Flex direction="row">
            <div className={styles.view}>
              <ResponsiveContainer width="100%" height={450}>
                <BarChart
                  syncId="grade-distributions"
                  width={730}
                  height={200}
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
                  <YAxis tickFormatter={toPercent} />
                  {outputs?.length && (
                    <Tooltip
                      labelStyle={{ color: "var(--heading-color)" }}
                      contentStyle={{
                        backgroundColor: "var(--backdrop-color)",
                        border: "none",
                      }}
                      cursor={{ fill: "var(--foreground-color)" }}
                      formatter={toPercent}
                    />
                  )}
                  {outputs?.map((output, index) => {
                    if (output.hidden) return;
                    const activeExists =
                      outputs?.find((out) => out.active) !== undefined;
                    return (
                      <Bar
                        dataKey={index}
                        fill={
                          activeExists && !output.active
                            ? DARK_COLOR_ORDER[index]
                            : COLOR_ORDER[index]
                        }
                        key={index}
                        name={`${output.input.subject} ${output.input.courseNumber}`}
                        onMouseMove={updateGraphHover}
                        radius={[
                          10 / visibleOutputs,
                          10 / visibleOutputs,
                          0,
                          0,
                        ]}
                      />
                    );
                  })}
                </BarChart>
              </ResponsiveContainer>
              {!outputs?.length && (
                <div className={styles.empty}>
                  <FrameAltEmpty height={24} width={24} />
                  <br />
                  You have not added
                  <br />
                  any classes yet
                </div>
              )}
            </div>
            {/* TODO: populate this so that update hover also figures out which series we're hovering over */}
            {outputs && hoveredSeries !== null ? (
              <HoverInfo
                color={COLOR_ORDER[hoveredSeries]}
                subject={outputs[hoveredSeries].input.subject}
                courseNumber={outputs[hoveredSeries].input.courseNumber}
                gradeDistribution={outputs[hoveredSeries].gradeDistribution}
                hoveredLetter={hoveredLetter}
              />
            ) : (
              <HoverInfo
                color={"#aaa"}
                subject={"No Class"}
                courseNumber={"Selected"}
                gradeDistribution={undefined}
                hoveredLetter={null}
              />
            )}
          </Flex>
        )}
      </Flex>
    </Box>
  );
}
