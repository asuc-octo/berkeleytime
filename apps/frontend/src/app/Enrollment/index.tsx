// TODO: refactor to match GradeDistribution/index.tsx
import React, {
  memo,
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
  XAxis,
  YAxis,
} from "recharts";
import { CategoricalChartFunc } from "recharts/types/chart/types";

import { Boundary, Box, Flex, LoadingIndicator } from "@repo/theme";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  createChartConfig,
  formatters,
} from "@/components/Chart";
import Footer from "@/components/Footer";
import { GetEnrollmentDocument, Semester } from "@/lib/generated/graphql";

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

const CHART_HEIGHT = 450;

// Memoized formatter to avoid recreating on each render
const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "America/Los_Angeles",
});

// Type alias for tooltip content function props
type TooltipContentProps = Parameters<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Extract<ContentType<number, string>, (...args: any[]) => any>
>[0];

type EnrollmentChartProps = {
  data: { timeDelta: number; [key: string]: number | null }[] | undefined;
  filteredOutputs: Output[];
  chartConfig: ChartConfig;
  activeOutput?: Output;
  dataMax: number;
  outputs: Output[];
  shouldAnimate: boolean;
  onHoverDuration: (duration: moment.Duration | null) => void;
};

const EnrollmentChart = memo(function EnrollmentChart({
  data,
  filteredOutputs,
  chartConfig,
  activeOutput,
  dataMax,
  outputs,
  shouldAnimate,
  onHoverDuration,
}: EnrollmentChartProps) {
  const handleHover: CategoricalChartFunc = useCallback(
    (payload) => {
      onHoverDuration(
        payload?.activeLabel !== undefined && payload?.activeLabel !== null
          ? moment.duration(payload.activeLabel, "minutes")
          : null
      );
    },
    [onHoverDuration]
  );

  return (
    <div className={styles.view}>
      <ChartContainer config={chartConfig}>
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <LineChart
            syncId="grade-distributions"
            width={730}
            height={200}
            data={data}
            onMouseMove={handleHover}
            onMouseLeave={() => onHoverDuration(null)}
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
              interval={"preserveStartEnd"}
              type="number"
              tickFormatter={(timeDelta) =>
                String(
                  Math.floor(moment.duration(timeDelta, "minutes").asDays()) + 1
                )
              }
            />
            <YAxis
              domain={[0, dataMax]}
              tickFormatter={(v) => formatters.percentRound(v)}
            />
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
            )}
            {outputs?.length > 0 && (
              <ChartTooltip
                tooltipConfig={{
                  labelFormatter: (label) => {
                    const duration = moment.duration(label, "minutes");
                    const day = Math.floor(duration.asDays()) + 1;
                    const time = timeFormatter.format(
                      moment.utc(0).add(duration).toDate()
                    );
                    return `Day ${day} ${time}`;
                  },
                  valueFormatter: (value) => formatters.percentRound(value),
                  indicator: "line",
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
                    isAnimationActive={shouldAnimate}
                    dot={false}
                    strokeWidth={3}
                    type="monotone"
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
                    isAnimationActive={shouldAnimate}
                    dot={false}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    type="monotone"
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
      </ChartContainer>
    </div>
  );
});

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
          const response = await client.query({
            query: GetEnrollmentDocument,
            variables: {
              year: input.year,
              semester: input.semester,
              sessionId: input.sessionId,
              subject: input.subject,
              courseNumber: input.courseNumber,
              sectionNumber: input.sectionNumber,
            },
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
          response?.data?.enrollment
            ? acc.concat({
                // TODO: Error handling
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
        output.enrollmentHistory.history[0].startTime
      ).startOf("minute");
      const map = new Map<
        number,
        { enrolledCount: number; waitlistedCount: number }
      >();
      for (const enrollment of output.enrollmentHistory.history) {
        const start = moment(enrollment.startTime).startOf("minute");
        const end = moment(enrollment.endTime).startOf("minute");
        const granularity = enrollment.granularitySeconds;

        for (
          let cur = start.clone();
          !cur.isAfter(end);
          cur.add(granularity, "seconds")
        ) {
          const timeDelta = moment.duration(cur.diff(firstTime)).asMinutes();
          timeDeltas.add(timeDelta);

          map.set(timeDelta, {
            enrolledCount:
              (enrollment.enrolledCount /
                (output.enrollmentHistory.history[
                  output.enrollmentHistory.history.length - 1
                ].maxEnroll ?? 1)) *
              100,
            waitlistedCount:
              (enrollment.waitlistedCount /
                (output.enrollmentHistory.history[
                  output.enrollmentHistory.history.length - 1
                ].maxWaitlist ?? 1)) *
              100,
          });
        }
      }
      return map;
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

  const chartConfig = useMemo(() => {
    const labels: Record<string, string> = {};
    const themes: Record<string, { light: string; dark: string }> = {};

    outputs.forEach((output, index) => {
      const courseName = `${output.input.subject} ${output.input.courseNumber}${output.input.sectionNumber ? ` ${output.input.sectionNumber}` : ""}`;
      labels[`enroll_${index}`] = `${courseName} - Enrolled`;
      labels[`waitlist_${index}`] = `${courseName} - Waitlisted`;

      themes[`enroll_${index}`] = {
        light: LIGHT_COLORS[index % LIGHT_COLORS.length],
        dark: DARK_COLORS[index % DARK_COLORS.length],
      };
      themes[`waitlist_${index}`] = {
        light: LIGHT_COLORS[index % LIGHT_COLORS.length],
        dark: DARK_COLORS[index % DARK_COLORS.length],
      };
    });

    const keys = outputs.flatMap((_, i) => [`enroll_${i}`, `waitlist_${i}`]);
    return createChartConfig(keys, { labels, themes });
  }, [outputs]);

  const handleHoverDuration = useCallback(
    (duration: moment.Duration | null) => {
      setHoveredDuration(duration);
    },
    []
  );

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
            <EnrollmentChart
              data={data}
              filteredOutputs={filteredOutputs}
              chartConfig={chartConfig}
              activeOutput={activeOutput}
              dataMax={dataMax}
              outputs={outputs}
              shouldAnimate={shouldAnimate.current}
              onHoverDuration={handleHoverDuration}
            />
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
