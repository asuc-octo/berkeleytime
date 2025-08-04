import { useCallback, useEffect, useMemo, useState } from "react";

import { useApolloClient } from "@apollo/client";
import { FrameAltEmpty } from "iconoir-react";
import { useSearchParams } from "react-router-dom";
import {
  CartesianGrid,
  Label,
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
import { READ_TERM, ReadTermResponse } from "@/lib/api/terms";

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
  const [termData, setTermData] = useState<ReadTermResponse | null>(null);

  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [hoveredSeries, setHoveredSeries] = useState<number | null>(null);

  // Fetch term data for enrollment periods
  const fetchTermData = useCallback(async () => {
    if (outputs.length === 0) return;

    const firstOutput = outputs[0];
    try {
      const response = await client.query<ReadTermResponse>({
        query: READ_TERM,
        variables: {
          year: firstOutput.input.year,
          semester: firstOutput.input.semester,
        },
        fetchPolicy: "no-cache",
      });
      setTermData(response.data);
    } catch (error) {
      console.error("Failed to fetch term data:", error);
    }
  }, [client, outputs]);

  useEffect(() => {
    fetchTermData();
  }, [fetchTermData]);

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
          response
            ? acc.concat({
                color: LIGHT_COLORS[index],
                enrollmentHistory: response.data.enrollment,
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
            if (!column) {
              acc.push({
                day: dayOffset,
                [index]: enrollValue,
              });
            } else {
              if (index in column) {
                column[index] = Math.max(enrollValue, column[index]);
              } else {
                column[index] = enrollValue;
              }
            }
          });

          return acc;
        },
        [] as {
          [key: number]: number;
          day: number;
        }[]
      )
      .sort((a, b) => a.day - b.day);
  }, [outputs]);

  // Calculate enrollment period lines
  const enrollmentPeriodLines = useMemo(() => {
    if (!termData?.term || !outputs.length) return [];

    const firstOutput = outputs[0];
    const day0 = new Date(firstOutput.enrollmentHistory.history[0].time);

    return (
      termData.term.sessions?.[0]?.timePeriods
        ?.filter((period) => {
          const description = period.periodDescription.toLowerCase();
          return (
            (description.includes("phase") ||
              description.includes("adjustment")) &&
            description.includes("begin")
          );
        })
        ?.map((period) => {
          const periodDate = new Date(period.endDate);
          const dayOffset = Math.ceil(
            (periodDate.getTime() - day0.getTime()) / (1000 * 3600 * 24)
          );

          return {
            day: dayOffset,
            label: period.periodDescription,
            stroke: "#666",
            strokeDasharray: "5 5",
          };
        }) || []
    );
  }, [termData, outputs]);

  function updateGraphHover(data: any) {
    if (!data.isTooltipActive) return;
    setHoveredDay(data.activeLabel);
    // figure out closest series to mouse that has data point at that value
    const mousePercent =
      ((-data.chartY + CHART_HEIGHT) / CHART_HEIGHT) * dataMax;
    const filteredSeries = data.activePayload.filter((p: any) => p.value);
    const minDiff = Math.min(
      ...filteredSeries.map((fs: any) => Math.abs(fs.value - mousePercent))
    );
    const best = filteredSeries.find(
      (fs: any) => Math.abs(fs.value - mousePercent) === minDiff
    );
    if (best) setHoveredSeries(best.dataKey);
  }

  useEffect(() => {
    if (outputs.length > 0) {
      if (!hoveredSeries) setHoveredSeries(0);
    } else setHoveredSeries(null);
  }, [outputs]);

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

                  {enrollmentPeriodLines.map((line, index) => (
                    <ReferenceLine
                      key={index}
                      x={line.day}
                      stroke="#666"
                      strokeDasharray="5 5"
                    >
                      {/* “top” → put it above the line;  dy < 0 → nudge upward */}
                      <Label
                        value={line.label}
                        angle={-90}
                        dx={-10} // vertical offset (-10 px up)
                        textAnchor="middle" // center horizontally on the X
                        fill="var(--label-color)"
                        fontSize={12}
                      />
                    </ReferenceLine>
                  ))}

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
                    return (
                      <Line
                        dataKey={index}
                        stroke={
                          activeOutput && !output.active
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
      <Footer />
    </Box>
  );
}
