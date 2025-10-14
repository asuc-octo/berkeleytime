// TODO: refactor to match GradeDistribution/index.tsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useApolloClient } from "@apollo/client/react";
import { FrameAltEmpty } from "iconoir-react";
import { useSearchParams } from "react-router-dom";
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

import { Boundary, Box, Flex, HoverCard, LoadingIndicator } from "@repo/theme";

import Footer from "@/components/Footer";
import { READ_ENROLLMENT, ReadEnrollmentResponse, Semester } from "@/lib/api";

import CourseManager from "./CourseManager";
import styles from "./Enrollment.module.scss";
import HoverInfo from "./HoverInfo";
import {
  DARK_COLORS,
  Input,
  LIGHT_COLORS,
  Output,
  getInputSearchParam,
  isInputEqual,
} from "./types";

const toPercent = (decimal: number) => {
  return `${decimal.toFixed(0)}%`;
};

const CHART_HEIGHT = 450;

export default function Enrollment() {
  const client = useApolloClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const [initialInputs] = useState<Input[]>(() =>
    searchParams
      .getAll("input")
      .reduce((acc, input) => {
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
          sectionNumber: output[4],
        };

        return acc.concat(parsedInput);
      }, [] as Input[])
      // Filter out duplicates
      .filter(
        (input, index, inputs) =>
          inputs.findIndex((i) => isInputEqual(input, i)) === index
      )
  );

  const [loading, setLoading] = useState(initialInputs.length > 0);
  const [outputs, setOutputs] = useState<Output[]>([]);

  const [hoveredSeries, setHoveredSeries] = useState<number | null>(null);
  const shouldAnimate = useRef(true);

  const initialize = useCallback(async () => {
    if (!loading) return;

    if (initialInputs.length === 0) {
      searchParams.delete("input");
      setSearchParams(searchParams);

      return;
    }

    const responses = await Promise.all(
      initialInputs.map(async (input) => {
        try {
          const response = await client.query<ReadEnrollmentResponse>({
            query: READ_ENROLLMENT,
            variables: input,
            fetchPolicy: "no-cache",
          });

          return response;
        } catch {
          return null;
        }
      })
    );

    const outputs = responses
      // Filter out failed queries and set any initial state
      .reduce(
        (acc, response, index) =>
          response?.data
            ? acc.concat({
                color: LIGHT_COLORS[index],
                // TODO: Error handling
                enrollmentHistory: response.data!.enrollment,
                input: initialInputs[index],
                active: false,
                hidden: false,
              })
            : acc,
        [] as Output[]
      )
      // Limit to 4 outputs
      .slice(0, 4);

    setOutputs(outputs);

    searchParams.delete("input");

    for (const output of outputs) {
      searchParams.append("input", getInputSearchParam(output.input));
    }

    setLoading(false);
  }, [client, initialInputs, searchParams, setSearchParams, loading]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    shouldAnimate.current = false;
  }, []);

  const activeOutput = useMemo(
    () => outputs?.find((out) => out.active),
    [outputs]
  );

  const filteredOutputs = useMemo(
    () => outputs?.filter((output) => !output.hidden),
    [outputs]
  );

  const data = useMemo(() => {
    return outputs
      ?.reduce(
        (acc, output, index) => {
          const day0 = new Date(output.enrollmentHistory.history[0].time);
          output.enrollmentHistory.history.forEach((enrollment) => {
            const dayOffset = Math.ceil(
              (new Date(enrollment.time).getTime() - day0.getTime()) /
                (1000 * 3600 * 24)
            );
            const column = acc.find((item) => item.day === dayOffset);
            const enrollValue =
              Math.round(
                (enrollment.enrolledCount / enrollment.maxEnroll) * 1000
              ) / 10;
            const waitlistValue =
              enrollment.maxWaitlist > 0
                ? Math.round(
                    (enrollment.waitlistedCount / enrollment.maxWaitlist) * 1000
                  ) / 10
                : 0;
            if (!column) {
              acc.push({
                day: dayOffset,
                [index]: enrollValue,
                [`waitlist_${index}`]: waitlistValue,
              });
            } else {
              if (index in column) {
                column[index] = Math.max(enrollValue, column[index]);
              } else {
                column[index] = enrollValue;
              }
              if (`waitlist_${index}` in column) {
                column[`waitlist_${index}`] = Math.max(
                  waitlistValue,
                  column[`waitlist_${index}`]
                );
              } else {
                column[`waitlist_${index}`] = waitlistValue;
              }
            }
          });

          return acc;
        },
        [] as {
          [key: string | number]: number;
          day: number;
        }[]
      )
      .sort((a, b) => a.day - b.day);
  }, [outputs]);

  function updateGraphHover(data: {
    isTooltipActive?: boolean;
    chartY?: number;
    activePayload?: Array<{ value?: number; dataKey?: number }>;
  }) {
    if (!data.isTooltipActive || data.chartY === undefined) return;
    // figure out closest series to mouse that has data point at that value
    const mousePercent =
      ((-data.chartY + CHART_HEIGHT) / CHART_HEIGHT) * dataMax;
    const filteredSeries =
      data.activePayload?.filter((p) => p.value !== undefined) ?? [];
    const minDiff = Math.min(
      ...filteredSeries.map((fs) => Math.abs((fs.value ?? 0) - mousePercent))
    );
    const best = filteredSeries.find(
      (fs) => Math.abs((fs.value ?? 0) - mousePercent) === minDiff
    );
    if (best?.dataKey !== undefined) setHoveredSeries(best.dataKey);
  }

  useEffect(() => {
    if (outputs.length > 0) {
      if (!hoveredSeries) setHoveredSeries(0);
    } else setHoveredSeries(null);
  }, [hoveredSeries, outputs]);

  const dataMax = useMemo(() => {
    return (
      data.reduce((acc, d) => {
        const m = Math.max(
          ...Object.entries(d)
            .filter(([key]) => !isNaN(Number(key)))
            .map(([, value]) => value)
        );
        return m > acc ? m : acc;
      }, 0) * 1.2
    );
  }, [data]);

  return (
    <Box p="5" className={styles.root}>
      <Flex direction="column">
        <CourseManager outputs={outputs} setOutputs={setOutputs} />
        {loading ? (
          <Boundary>
            <LoadingIndicator size="lg" />
          </Boundary>
        ) : (
          <Flex direction="row">
            <div className={styles.view}>
              <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
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
                  <YAxis domain={[0, dataMax]} tickFormatter={toPercent} />
                  {dataMax >= 100 && (
                    <ReferenceLine
                      y={100}
                      stroke="var(--label-color)"
                      strokeDasharray="5 5"
                      strokeOpacity={0.5}
                      label={{
                        value: "100% Capacity",
                        position: "insideTopLeft",
                        fill: "var(--label-color)",
                        fontSize: 12,
                        offset: 10,
                      }}
                    />
                  )}{" "}
                  {outputs?.length && (
                    <Tooltip
                      content={(props) => {
                        return (
                          <HoverCard
                            content={`Day ${props.label}`}
                            data={props.payload?.map((v) => {
                              const name = v.name?.valueOf();
                              return {
                                label: name ? name.toString() : "N/A",
                                value:
                                  typeof v.value === "number"
                                    ? toPercent(v.value)
                                    : "N/A",
                                color: v.stroke,
                              };
                            })}
                          />
                        );
                      }}
                    />
                  )}
                  {filteredOutputs?.map((output, index) => {
                    const originalIndex = outputs.indexOf(output);
                    return (
                      <React.Fragment key={index}>
                        <Line
                          dataKey={originalIndex}
                          stroke={
                            activeOutput && !output.active
                              ? DARK_COLORS[originalIndex]
                              : LIGHT_COLORS[originalIndex]
                          }
                          name={`${output.input.subject} ${output.input.courseNumber}`}
                          isAnimationActive={shouldAnimate.current}
                          dot={false}
                          strokeWidth={3}
                          type={"bump"}
                          connectNulls
                        />
                        <Line
                          dataKey={`waitlist_${originalIndex}`}
                          stroke={
                            activeOutput && !output.active
                              ? DARK_COLORS[originalIndex]
                              : LIGHT_COLORS[originalIndex]
                          }
                          name={`${output.input.subject} ${output.input.courseNumber} (Waitlist)`}
                          isAnimationActive={shouldAnimate.current}
                          dot={false}
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          type={"bump"}
                          connectNulls
                        />
                      </React.Fragment>
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
                hoveredDay={null}
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
      <Footer />
    </Box>
  );
}
