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
import moment from "moment";
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
import { CategoricalChartFunc } from "recharts/types/chart/types";

import { Boundary, Box, Flex, HoverCard, LoadingIndicator } from "@repo/theme";

import Footer from "@/components/Footer";
import { READ_ENROLLMENT, ReadEnrollmentResponse, Semester } from "@/lib/api";

import CourseManager from "./CourseManager";
import styles from "./Enrollment.module.scss";
import HoverInfo from "./HoverInfo";
import { EnrollmentEventReturn, semesterEnrollments } from "./EnrollmentDays";
import {
  DARK_COLORS,
  Input,
  LIGHT_COLORS,
  Output,
  getInputSearchParam,
  isInputEqual,
} from "./types";
import { uniq } from "lodash";

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

  const [hoveredDuration, setHoveredDuration] =
    useState<moment.Duration | null>(null);

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

  const uniqueSemesters = useMemo(() => { // would only work with one semseter selected, not sure how multiple semester selected would work
    const semesterSet = new Set<string>();

    outputs
      ?.filter((output) => !output.hidden)
      .forEach((output) => {
        if (output.input.semester && output.input.year) {
          semesterSet.add(`${output.input.semester} ${output.input.year}`);
        }
      });
    return semesterSet;
  }, [outputs]);

  const [enrollmentDaysShowed, setEnrollmentDaysShowed] = useState<EnrollmentEventReturn[]>([]);
  const enrollmentDays = useMemo(() => {
    if (!outputs) return undefined;
    const output = outputs[0];
    if (!output) return undefined;
    const firstTime = moment(
        output.enrollmentHistory.history[0].time
    ).startOf("minute");

    const keywords = ["Phase 1", "Phase 2", "Adjustment"];
    const importantDays = semesterEnrollments(Array.from(uniqueSemesters), keywords, firstTime);
    const firstSemester = Array.from(uniqueSemesters)[0]; // doesn't make sense with multiple semesters selected
    setEnrollmentDaysShowed(importantDays[firstSemester]);
    if (uniqueSemesters.size > 1) setEnrollmentDaysShowed([]);
    return importantDays;

  }, [uniqueSemesters, outputs]);
  /**
   *
   * A list of combined time series of the format:
   *
   *    ```
   *    {
   *      timeDelta: number,
   *      enroll_0: number | null,
   *      enroll_1: number | null,
   *      waitlist_0: number | null,
   *      waitlist_1: number | null,
   *      // ...
   *    }
   *    ```
   *
   * `timeDelta` is in minutes since the first time data point of that selected class
   */
  const data:
    | { timeDelta: number; [key: string]: number | null }[]
    | undefined = useMemo(() => {
    if (!outputs) return undefined;

    // set of all unique time deltas (in minutes). used to generate combined time series
    const timeDeltas = new Set<number>();

    // list (one for each selected class) of mappings from time (prettified string) to enrollment data
    const timeToEnrollmentMaps: Map<
      number,
      { enrolledCount: number; waitlistedCount: number }
    >[] = outputs.map((output) => {
      // the first time data point, floored to the nearest minute
      const firstTime = moment(
        output.enrollmentHistory.history[0].time
      ).startOf("minute");
      return new Map(
        output.enrollmentHistory.history.map((enrollment) => {
          // time as prettified string floored to nearest minute
          const time = moment(enrollment.time).startOf("minute");
          const timeDelta = moment.duration(time.diff(firstTime)).asMinutes();
          timeDeltas.add(timeDelta);
          return [
            timeDelta,
            {
              enrolledCount:
                (enrollment.enrolledCount /
                  (output.enrollmentHistory.latest?.maxEnroll ??
                    output.enrollmentHistory.history[
                      output.enrollmentHistory.history.length - 1
                    ].maxEnroll ??
                    1)) *
                100,
              waitlistedCount:
                (enrollment.waitlistedCount /
                  (output.enrollmentHistory.latest?.maxWaitlist ??
                    output.enrollmentHistory.history[
                      output.enrollmentHistory.history.length - 1
                    ].maxWaitlist ??
                    1)) *
                100,
            },
          ];
        })
      );
    });

    return Array.from(timeDeltas)
      .map((timeDelta) => {
        const datapoint: { timeDelta: number; [key: string]: number | null } = {
          timeDelta,
        };
        for (let i = 0; i < outputs.length; i++) {
          const { enrolledCount, waitlistedCount } = timeToEnrollmentMaps[
            i
          ].get(timeDelta) || { enrolledCount: null, waitlistedCount: null };
          datapoint[`enroll_${i}`] = enrolledCount;
          datapoint[`waitlist_${i}`] = waitlistedCount;
        }
        return datapoint;
      })
      .sort((a, b) => a.timeDelta - b.timeDelta); // set doesn't guarantee order, so we sort by timeDelta
  }, [outputs]);

  const updateGraphHover: CategoricalChartFunc = (data) => {
    // if (!data.isTooltipActive || data.chartY === undefined) return;
    // // figure out closest series to mouse that has data point at that value
    // const mousePercent =
    //   ((-data.chartY + CHART_HEIGHT) / CHART_HEIGHT) * dataMax;
    // const filteredSeries =
    //   data.activePayload?.filter((p) => p.value !== undefined) ?? [];
    // const minDiff = Math.min(
    //   ...filteredSeries.map((fs) => Math.abs((fs.value ?? 0) - mousePercent))
    // );
    // const best = filteredSeries.find(
    //   (fs) => Math.abs((fs.value ?? 0) - mousePercent) === minDiff
    // );
    // if (best?.dataKey !== undefined) setHoveredSeries(best.dataKey);
    setHoveredDuration(
      data.activeLabel ? moment.duration(data.activeLabel, "minutes") : null
    );
  };

  useEffect(() => {
    if (outputs.length > 0) {
      if (!hoveredSeries) setHoveredSeries(0);
    } else setHoveredSeries(null);
  }, [hoveredSeries, outputs]);

  const dataMax = useMemo(() => {
    if (!data) return 0;

    return (
      data.reduce((acc, datapoint) => {
        const datapointValues = Object.values({
          ...datapoint,
          timeDelta: null,
        }).filter((v) => v !== null) as number[];
        return Math.max(acc, ...datapointValues);
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
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--border-color)"
                  />
                  <XAxis
                    dataKey="timeDelta"
                    fill="var(--label-color)"
                    tickMargin={8}
                    type="number"
                    tickFormatter={(timeDelta) =>
                      String(
                        Math.floor(
                          moment.duration(timeDelta, "minutes").asDays()
                        ) + 1
                      )
                    }
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
                  {enrollmentDaysShowed.map(({ description, timeDelta }) => (
                    <ReferenceLine
                      x={timeDelta}
                      stroke="var(--label-color)"
                      strokeDasharray="5 5"
                      strokeOpacity={0.5}
                      label={{
                        value: description,
                        position: "insideTopLeft",
                        fill: "var(--label-color)",
                        angle: 90,
                        fontSize: 12,
                        offset: 10,
                      }} 
                    />
                  ))}
                  {outputs?.length && (
                    <Tooltip
                      content={(props) => {
                        const duration = moment.duration(
                          props.label,
                          "minutes"
                        );
                        // setHoveredDuration(duration);
                        const day = Math.floor(duration.asDays()) + 1;
                        // if not granular (12:00am only), then don't show time
                        const time =
                          duration.hours() > 0
                            ? Intl.DateTimeFormat("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                                timeZone: "America/Los_Angeles",
                              }).format(moment.utc(0).add(duration).toDate())
                            : "";

                        return (
                          <HoverCard
                            content={`Day ${day} ${time}`}
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
                          dataKey={`enroll_${originalIndex}`}
                          stroke={
                            activeOutput && !output.active
                              ? DARK_COLORS[originalIndex]
                              : LIGHT_COLORS[originalIndex]
                          }
                          name={`${output.input.subject} ${output.input.courseNumber}`}
                          isAnimationActive={shouldAnimate.current}
                          dot={false}
                          strokeWidth={3}
                          type="stepAfter"
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
                          type="stepAfter"
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
            <div className={styles.hoverInfoContainer}>
              {outputs?.[0] ? (
                outputs.map((output: Output, i: number) => (
                  <div key={i} className={styles.hoverInfoCard}>
                    <HoverInfo
                      color={LIGHT_COLORS[i]}
                      subject={output.input.subject}
                      courseNumber={output.input.courseNumber}
                      enrollmentHistory={output.enrollmentHistory}
                      hoveredDuration={hoveredDuration}
                      semester={output.input.semester}
                      year={output.input.year}
                    />
                  </div>
                ))
              ) : (
                <div className={styles.hoverInfoCard}>
                  <HoverInfo
                    color={"#aaa"}
                    subject={"No Class"}
                    courseNumber={"Selected"}
                    hoveredDuration={null}
                  />
                </div>
              )}
            </div>
          </Flex>
        )}
      </Flex>
      <Footer />
    </Box>
  );
}
