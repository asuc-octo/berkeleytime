import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useApolloClient, useQuery } from "@apollo/client/react";
import moment from "moment";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";
import { CategoricalChartFunc } from "recharts/types/chart/types";

import { Boundary, LoadingIndicator } from "@repo/theme";

import {
  type ChartConfig,
  ChartTooltip,
  ChartTooltipContent,
  createChartConfig,
  formatters,
} from "@/components/Chart";
import { ChartContainer } from "@/components/CourseAnalytics/ChartContainer";
import { CourseAnalyticsPage } from "@/components/CourseAnalytics/CourseAnalyticsPage";
import { useCourseManager } from "@/components/CourseAnalytics/CourseManager/useCourseManager";
import CourseSelectionCard from "@/components/CourseSelectionCard";
import {
  GetEnrollmentDocument,
  GetEnrollmentTimeframesDocument,
  Semester,
} from "@/lib/generated/graphql";
import { RecentType, getPageUrl, savePageUrl } from "@/lib/recent";

import CourseInput from "./CourseManager/CourseInput";
import DataBoard from "./DataBoard";
import {
  DARK_COLORS,
  Input,
  LIGHT_COLORS,
  Output,
  getInputSearchParam,
  isInputEqual,
} from "./types";

// Map group names to full labels
const GROUP_LABELS: Record<string, string> = {
  continuing: "Continuing Students",
  new_transfer: "New Transfer Students",
  new_freshman: "New Freshman Students",
  new_graduate: "New Graduate Students",
  new_student: "New Students",
  all: "All Students",
};

// Memoized formatter to avoid recreating on each render
const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "America/Los_Angeles",
});

// Helper function to get the dark version of a color
const getDarkColor = (lightColor: string): string => {
  const colorIndex = LIGHT_COLORS.indexOf(lightColor);
  return colorIndex !== -1 ? DARK_COLORS[colorIndex] : lightColor;
};

type PhaseLine = {
  timeDelta: number;
  label: string;
  key: string;
};

type EnrollmentChartProps = {
  data: { timeDelta: number; [key: string]: number | null }[] | undefined;
  filteredOutputs: Output[];
  chartConfig: ChartConfig;
  activeOutput?: Output;
  dataMax: number;
  outputs: Output[];
  animateIndices: Set<number>;
  phaseLines: PhaseLine[];
  onHoverDuration: (duration: moment.Duration | null) => void;
};

const EnrollmentChart = memo(function EnrollmentChart({
  data,
  filteredOutputs,
  chartConfig,
  activeOutput,
  dataMax,
  outputs,
  animateIndices,
  phaseLines,
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
    <ChartContainer config={chartConfig} hasData={filteredOutputs.length > 0}>
      {() => (
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
          {/* Enrollment phase start lines */}
          {phaseLines.map((line) => (
            <ReferenceLine
              key={line.key}
              x={line.timeDelta}
              stroke="var(--paragraph-color)"
              strokeWidth={1}
              strokeDasharray="6 4"
              strokeOpacity={0.8}
              label={{
                value: line.label,
                position: "insideBottomLeft",
                fill: "var(--paragraph-color)",
                fontSize: 10,
                angle: -90,
                dx: 12,
                dy: -10,
              }}
            />
          ))}
          {outputs?.length > 0 && (
            <ChartTooltip
              content={(props) => {
                // Filter payload to only show active output when a class is selected
                let payloadToShow = props.payload;
                if (props.payload && activeOutput) {
                  const activeIndex = outputs.findIndex((o) => o.active);
                  if (activeIndex !== -1) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    payloadToShow = props.payload.filter((item: any) => {
                      const dataKey = item.dataKey || item.name;
                      return (
                        dataKey === `enroll_${activeIndex}` ||
                        dataKey === `waitlist_${activeIndex}`
                      );
                    });
                  }
                }

                return (
                  <ChartTooltipContent
                    {...props}
                    payload={payloadToShow}
                    config={chartConfig}
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
                );
              }}
            />
          )}
          {filteredOutputs?.map((output, index) => {
            const originalIndex = outputs.indexOf(output);
            const shouldAnimateLine = animateIndices.has(originalIndex);
            const lineColor =
              activeOutput && !output.active
                ? getDarkColor(output.color)
                : output.color;
            return (
              <React.Fragment key={index}>
                <Line
                  dataKey={`enroll_${originalIndex}`}
                  stroke={lineColor}
                  name={`${output.input.subject} ${output.input.courseNumber}`}
                  isAnimationActive={shouldAnimateLine}
                  dot={false}
                  strokeWidth={3}
                  type="monotone"
                  connectNulls
                />
                <Line
                  dataKey={`waitlist_${originalIndex}`}
                  stroke={lineColor}
                  name={`${output.input.subject} ${output.input.courseNumber} (Waitlist)`}
                  isAnimationActive={shouldAnimateLine}
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
      )}
    </ChartContainer>
  );
});

const parseInputsFromUrl = (searchParams: URLSearchParams): Input[] =>
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
    );

const fetchEnrollment = async (
  client: ReturnType<typeof useApolloClient>,
  input: Input
): Promise<{ data: Output["data"]; input: Input } | null> => {
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

    if (!response.data?.enrollment) return null;

    return {
      data: response.data.enrollment,
      input,
    };
  } catch {
    return null;
  }
};

export default function Enrollment() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialInputs = useMemo(() => {
    // If no current params, check for saved URL and parse it directly
    if (searchParams.toString().length === 0) {
      const savedUrl = getPageUrl(RecentType.EnrollmentPage);
      if (savedUrl) {
        const savedParams = new URLSearchParams(savedUrl);
        return parseInputsFromUrl(savedParams);
      }
    }
    return parseInputsFromUrl(searchParams);
  }, [searchParams]);

  // Save current URL to localStorage whenever it changes
  useEffect(() => {
    const currentUrl = location.search;
    savePageUrl(RecentType.EnrollmentPage, currentUrl);
  }, [location.search]);

  // Update URL to match the restored state
  useEffect(() => {
    if (searchParams.toString().length === 0 && initialInputs.length > 0) {
      const savedUrl = getPageUrl(RecentType.EnrollmentPage);
      if (savedUrl) {
        navigate({ ...location, search: savedUrl }, { replace: true });
      }
    }
  }, []); // Only on mount

  const {
    outputs,
    setOutputs,
    loading,
    activeOutput,
    filteredOutputs,
    remove,
    updateActive,
    updateHidden,
  } = useCourseManager<Input, Output["data"]>({
    initialInputs,
    fetchData: fetchEnrollment,
    serializeInput: getInputSearchParam,
    colors: LIGHT_COLORS,
  });

  const [hoveredSeries, setHoveredSeries] = useState<number | null>(null);
  const [animateIndices, setAnimateIndices] = useState<Set<number>>(new Set());
  const previousOutputsLength = useRef(0);

  const [hoveredDuration, setHoveredDuration] =
    useState<moment.Duration | null>(null);

  // Track newly added classes and animate only their lines
  useEffect(() => {
    const currentLength = outputs.length;
    const previousLength = previousOutputsLength.current;

    if (currentLength > previousLength) {
      // New class(es) added - find which indices are new
      const newIndices = new Set<number>();
      for (let i = previousLength; i < currentLength; i++) {
        newIndices.add(i);
      }
      setAnimateIndices(newIndices);

      // Clear animation after animation completes (recharts default is ~1000ms)
      const timeout = setTimeout(() => {
        setAnimateIndices(new Set());
      }, 1500);

      previousOutputsLength.current = currentLength;
      return () => clearTimeout(timeout);
    }

    // Update previous length even if no new classes were added
    previousOutputsLength.current = currentLength;
  }, [outputs.length]);

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
      { enrolledCount: number | null; waitlistedCount: number | null }
    >[] = outputs.map((output) => {
      // Calculate valid denominators for maxEnroll and maxWaitlist
      const maxEnrollHistory = output.data.history.map((e) => e.maxEnroll ?? 0);
      const maxWaitlistHistory = output.data.history.map(
        (e) => e.maxWaitlist ?? 0
      );

      const maxEnrollMax = Math.max(...maxEnrollHistory);
      const maxWaitlistMax = Math.max(...maxWaitlistHistory);
      const lastMaxEnroll =
        output.data.history[output.data.history.length - 1].maxEnroll ?? 0;
      const lastMaxWaitlist =
        output.data.history[output.data.history.length - 1].maxWaitlist ?? 0;

      // Determine valid denominators:
      // - If denominator was always zero, we'll set values to null (hide the line)
      // - If denominator was non-zero but last is zero, use the max value from history
      // - Otherwise, use the last value (or 1 as fallback)
      const validMaxEnroll =
        maxEnrollMax > 0
          ? lastMaxEnroll > 0
            ? lastMaxEnroll
            : maxEnrollMax
          : 0;
      const validMaxWaitlist =
        maxWaitlistMax > 0
          ? lastMaxWaitlist > 0
            ? lastMaxWaitlist
            : maxWaitlistMax
          : 0;

      // the first time data point, floored to the nearest minute
      const firstTime = moment(output.data.history[0].startTime).startOf(
        "minute"
      );
      const map = new Map<
        number,
        { enrolledCount: number | null; waitlistedCount: number | null }
      >();
      for (const enrollment of output.data.history) {
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

          // If denominator was always zero, set to null (hide the line)
          // Otherwise, calculate percentage using valid denominator
          map.set(timeDelta, {
            enrolledCount:
              validMaxEnroll > 0
                ? (enrollment.enrolledCount / validMaxEnroll) * 100
                : null,
            waitlistedCount:
              validMaxWaitlist > 0
                ? (enrollment.waitlistedCount / validMaxWaitlist) * 100
                : null,
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

  // Determine the semester to show phase lines for
  const phaseLinesConfig = useMemo(() => {
    if (!outputs || outputs.length === 0) return null;

    // Check if all outputs are from the same semester
    const firstSemester = outputs[0].input.semester;
    const firstYear = outputs[0].input.year;
    const allSameSemester = outputs.every(
      (o) => o.input.semester === firstSemester && o.input.year === firstYear
    );

    if (allSameSemester) {
      return { year: firstYear, semester: firstSemester, showAlways: true };
    }

    // If different semesters, show lines for active output's semester
    if (activeOutput) {
      return {
        year: activeOutput.input.year,
        semester: activeOutput.input.semester,
        showAlways: false,
      };
    }

    return null;
  }, [outputs, activeOutput]);

  // Fetch enrollment timeframes for the relevant semester
  const { data: timeframesData } = useQuery(GetEnrollmentTimeframesDocument, {
    variables: {
      year: phaseLinesConfig?.year ?? 0,
      semester: phaseLinesConfig?.semester ?? Semester.Fall,
    },
    skip: !phaseLinesConfig,
  });

  // Calculate phase line positions
  const phaseLines = useMemo((): PhaseLine[] => {
    if (!data || data.length === 0 || !timeframesData?.enrollmentTimeframes)
      return [];
    if (!phaseLinesConfig) return [];

    // Find the output that matches the phase lines semester to get its first timestamp
    const matchingOutput = outputs.find(
      (o) =>
        o.input.year === phaseLinesConfig.year &&
        o.input.semester === phaseLinesConfig.semester
    );

    if (!matchingOutput) return [];

    const firstTime = moment(matchingOutput.data.history[0].startTime);
    const lastTimeDelta = data[data.length - 1].timeDelta;

    // Debug logging
    console.log("Phase lines debug:", {
      firstTime: firstTime.toISOString(),
      lastTimeDelta,
      lastTimeDeltaDays: lastTimeDelta / 1440,
      timeframes: timeframesData.enrollmentTimeframes.map((tf) => ({
        group: tf.group,
        phase: tf.phase,
        startDate: tf.startDate,
        calculatedTimeDelta: moment
          .duration(moment(tf.startDate).diff(firstTime))
          .asMinutes(),
        calculatedDay:
          moment.duration(moment(tf.startDate).diff(firstTime)).asMinutes() /
            1440 +
          1,
      })),
    });

    // Format semester as FA25, SP24, etc.
    const semesterPrefix =
      phaseLinesConfig.semester === "Fall"
        ? "FA"
        : phaseLinesConfig.semester === "Spring"
          ? "SP"
          : "SU";
    const yearSuffix = String(phaseLinesConfig.year).slice(-2);
    const termLabel = `${semesterPrefix}${yearSuffix}`;

    const result = timeframesData.enrollmentTimeframes
      .filter((tf) => tf.group === "continuing" || tf.group === "all")
      .map((tf) => {
        const phaseStart = moment(tf.startDate);
        const timeDelta = moment
          .duration(phaseStart.diff(firstTime))
          .asMinutes();

        // Only include lines within the chart's data range
        if (timeDelta < 0 || timeDelta > lastTimeDelta) return null;

        const phaseLabel = tf.isAdjustment
          ? "Adjustment Period"
          : `Phase ${tf.phase}`;
        const groupLabel = GROUP_LABELS[tf.group] ?? tf.group;

        return {
          timeDelta,
          label: `${termLabel} ${phaseLabel} - ${groupLabel}`,
          key: `${tf.phase}-${tf.group}-${tf.isAdjustment}`,
        };
      })
      .filter((line): line is NonNullable<typeof line> => line !== null);

    console.log("Phase lines result:", result);
    return result;
  }, [data, timeframesData, phaseLinesConfig, outputs]);

  const chartConfig = useMemo(() => {
    const labels: Record<string, string> = {};
    const themes: Record<string, { light: string; dark: string }> = {};

    outputs.forEach((output, index) => {
      const courseName = `${output.input.subject} ${output.input.courseNumber}${output.input.sectionNumber ? ` ${output.input.sectionNumber}` : ""}`;
      labels[`enroll_${index}`] = `${courseName} - Enrolled`;
      labels[`waitlist_${index}`] = `${courseName} - Waitlisted`;

      themes[`enroll_${index}`] = {
        light: output.color,
        dark: getDarkColor(output.color),
      };
      themes[`waitlist_${index}`] = {
        light: output.color,
        dark: getDarkColor(output.color),
      };
    });

    const keys = outputs.flatMap((_, i) => [`enroll_${i}`, `waitlist_${i}`]);
    return createChartConfig(keys, { labels, themes });
  }, [outputs]);

  const sidebarOutputs = useMemo(() => {
    const selected = filteredOutputs?.filter((output) => output.active) ?? [];
    if (selected.length === 1) return selected;
    if ((filteredOutputs?.length ?? 0) === 1) return filteredOutputs;
    return [];
  }, [filteredOutputs]);

  const handleHoverDuration = useCallback(
    (duration: moment.Duration | null) => {
      setHoveredDuration(duration);
    },
    []
  );

  return (
    <>
      <CourseAnalyticsPage
        courseInput={<CourseInput outputs={outputs} setOutputs={setOutputs} />}
        bottomTitle="% of Class Filled vs Days After Enrollment Begins"
        bottomDescription={
          <>
            We source our historic course and enrollment data directly from
            Berkeley{" "}
            <a
              href="https://sis.berkeley.edu/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Student Information System's
            </a>{" "}
            Course and Class APIs.
          </>
        }
        courseCards={
          <>
            {outputs.map(({ input, ...rest }, index) => {
              const instructorNames =
                input.instructors && input.instructors.length
                  ? input.instructors.join(", ")
                  : null;
              const instructor = instructorNames
                ? instructorNames
                : input.sectionNumber
                  ? `LEC ${input.sectionNumber}`
                  : "All Instructors";
              const semester = `${input.semester} ${input.year}`;
              return (
                <CourseSelectionCard
                  key={`${index}-${input.subject}-${input.courseNumber}-${semester} • ${instructor}`}
                  subject={input.subject}
                  number={input.courseNumber}
                  metadata={`${semester} • ${instructor}`}
                  gradeDistribution={undefined}
                  loadGradeDistribution={false}
                  onClick={() => updateActive(index, !rest.active)}
                  onClickDelete={() => remove(index)}
                  onClickHide={() => updateHidden(index, !rest.hidden)}
                  color={rest.color}
                  active={rest.active}
                  hidden={rest.hidden}
                />
              );
            })}
            {!outputs ||
              (!outputs.length && <div style={{ height: "85px" }}></div>)}
          </>
        }
        chart={
          loading ? (
            <Boundary>
              <LoadingIndicator size="lg" />
            </Boundary>
          ) : (
            <EnrollmentChart
              data={data}
              filteredOutputs={filteredOutputs}
              chartConfig={chartConfig}
              activeOutput={activeOutput}
              dataMax={dataMax}
              outputs={outputs}
              animateIndices={animateIndices}
              phaseLines={phaseLines}
              onHoverDuration={handleHoverDuration}
            />
          )
        }
        dataBoard={
          loading ? (
            <Boundary>
              <LoadingIndicator size="md" />
            </Boundary>
          ) : sidebarOutputs?.[0] ? (
            sidebarOutputs.map((output: Output, i: number) => (
              <DataBoard
                key={i}
                color={output.color}
                subject={output.input.subject}
                courseNumber={output.input.courseNumber}
                enrollmentHistory={output.data}
                instructors={output.input.instructors}
                hoveredDuration={hoveredDuration}
                semester={output.input.semester}
                year={output.input.year}
              />
            ))
          ) : (
            <DataBoard
              color={"#aaa"}
              subject={"No Class"}
              courseNumber={"Selected"}
              hoveredDuration={null}
            />
          )
        }
      />
    </>
  );
}
