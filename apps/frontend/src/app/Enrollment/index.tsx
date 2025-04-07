import { useCallback, useEffect, useMemo, useState } from "react";

import { useApolloClient } from "@apollo/client";
import { FrameAltEmpty } from "iconoir-react";
import { useSearchParams } from "react-router-dom";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Boundary, Box, Flex, LoadingIndicator } from "@repo/theme";

import {
  IEnrollment,
  READ_ENROLLMENT,
  ReadEnrollmentResponse,
  Semester,
} from "@/lib/api";
import { colors } from "@/lib/section";

import CourseManage from "./CourseManager";
import styles from "./Enrollment.module.scss";
import HoverInfo from "./HoverInfo";
import {
  DARK_COLORS,
  LIGHT_COLORS,
} from "./types";
import Footer from "@/components/Footer";

interface Input {
  subject: string;
  courseNumber: string;
  year: number;
  semester: Semester;
  sectionNumber?: string;
}

interface Output {
  color: string;
  enrollmentHistory: IEnrollment;
  input: Input;
  hidden: boolean;
  active: boolean;
}

const toPercent = (decimal: number) => {
  return `${decimal.toFixed(0)}%`;
};

export default function Enrollment() {
  const client = useApolloClient();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [outputs, setOutputs] = useState<Output[] | null>(null);

  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [hoveredSeries, setHoveredSeries] = useState<number | null>(null);

  const inputs = useMemo(
    () =>
      searchParams.getAll("input").reduce((acc, input) => {
        const output = input.split(";");

        // Filter out invalid inputs
        if (output.length < 4) return acc;

        // Filter out invalid inputs
        if (output[2] !== "T") return acc;

        // COMPSCI;61B;T;2024:Spring;001, COMPSCI;61B;T;2024:Spring
        const term = output[3]?.split(":");

        const parsedInput: Input = {
          subject: output[0],
          courseNumber: output[1],
          year: parseInt(term?.[0]),
          semester: term?.[1] as Semester,
          sectionNumber: output[4]
        };

        return acc.concat(parsedInput);
      }, [] as Input[]),
    [searchParams]
  );

  const initialize = useCallback(async () => {
    setLoading(true);

    const responses = await Promise.all(
      inputs.map(async (variables) => {
        try {
          const response = await client.query<ReadEnrollmentResponse>({
            query: READ_ENROLLMENT,
            variables,
            fetchPolicy: "no-cache",
          });

          return response;
        } catch {
          return null;
        }
      })
    );

    if (inputs.length > 0) setHoveredSeries(0);

    console.log(responses)

    const output = responses.reduce(
      (acc, response, index) =>
        response
          ? acc.concat({
              color: colors[Math.floor(Math.random() * colors.length)],
              enrollmentHistory: response!.data.enrollment,
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
    () => {
      return outputs?.reduce(
        (acc, output, index) => {
          const day0 = new Date(output.enrollmentHistory.history[0].time)
          output.enrollmentHistory.history.forEach((enrollment) => {
            const dayOffset = Math.ceil((new Date(enrollment.time).getTime() - day0.getTime()) / (1000 * 3600 * 24))
            const column = acc.find((item) => item.day === dayOffset);
            if (!column) {
              acc.push({day: dayOffset, [index]: Math.round(enrollment.enrolledCount / enrollment.maxEnroll * 1000)/10})
            } else {
              if (index in column) {
                column[index] = Math.max(Math.round(enrollment.enrolledCount / enrollment.maxEnroll * 1000)/10, column[index]);
              } else {
                column[index] = Math.round(enrollment.enrolledCount / enrollment.maxEnroll * 1000)/10
              }
            }
          });

          return acc;
        },
        [] as {
          [key: number]: number;
          day: number
        }[]
      ).sort((a, b) => a.day - b.day)
    },
    [outputs]
  );

  function updateGraphHover(data: any) {
    if (!data.isTooltipActive) return;
    setHoveredDay(data.activeLabel);
    setHoveredSeries(data.activePayload[0].dataKey);
  }

  return (
    <Box p="5" className={styles.root}>
      <Flex direction="column">
        <CourseManage
          selectedCourses={
            outputs?.map((out, i) => {
              return {
                enrollmentHistory: out.enrollmentHistory,
                hidden: out.hidden,
                active: out.active,
                color: LIGHT_COLORS[i],
                sectionNumber: out.enrollmentHistory.sectionNumber,
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
                <LineChart
                  syncId="grade-distributions"
                  width={730}
                  height={200}
                  data={data}
                  onMouseMove={updateGraphHover}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--border-color)"
                  />
                  <XAxis
                    dataKey="day"
                    fill="var(--label-color)"
                    tickMargin={8}
                    type="number"
                  />
                  <YAxis tickFormatter={toPercent} />
                  {outputs?.length && (
                    <Tooltip
                      labelStyle={{ color: "var(--heading-color)" }}
                      labelFormatter={(label) => `Day ${label}`}
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
                      <Line
                        dataKey={index}
                        stroke={
                          activeExists && !output.active
                            ? DARK_COLORS[index]
                            : LIGHT_COLORS[index]
                        }
                        key={index}
                        name={`${output.input.subject} ${output.input.courseNumber}`}
                        dot={false}
                        strokeWidth={3}
                        type={"monotone"}
                        connectNulls
                      />
                    );
                  })}
                </LineChart>
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
            {outputs && hoveredSeries !== null && outputs[hoveredSeries] ? (
              <HoverInfo
                color={LIGHT_COLORS[hoveredSeries]}
                subject={outputs[hoveredSeries].input.subject}
                courseNumber={outputs[hoveredSeries].input.courseNumber}
                enrollmentHistory={outputs[hoveredSeries].enrollmentHistory}
                hoveredDay={hoveredDay}
                semester={outputs[hoveredSeries].input.semester}
                year={outputs[hoveredSeries].input.year}
              />
            ) : (
              <HoverInfo
                color={"#aaa"}
                subject={"No Class"}
                courseNumber={"Selected"}
                hoveredDay={null}
              />
            )}
          </Flex>
        )}
      </Flex>
      <Footer/>
    </Box>
  );
}
