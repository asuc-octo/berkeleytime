import { useEffect, useMemo, useState } from "react";

import { useApolloClient } from "@apollo/client/react";
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

import { Boundary, Box, Flex, HoverCard, LoadingIndicator } from "@repo/theme";

import Footer from "@/components/Footer";
import { READ_ENROLLMENT, ReadEnrollmentResponse } from "@/lib/api";
import { decimalToPercentString } from "@/utils/number-formatter";
import { parseInputsFromUrl } from "@/utils/url-course-parser";

import CourseManager from "./CourseManager";
import styles from "./Enrollment.module.scss";
import HoverInfo from "./HoverInfo";
import {
  DARK_COLORS,
  Input,
  LIGHT_COLORS,
  Output,
  getInputSearchParam,
} from "./types";

const fetchEnrollment = async (
  client: ReturnType<typeof useApolloClient>,
  input: Input,
  i: number
): Promise<Output | null> => {
  try {
    const response = await client.query<ReadEnrollmentResponse>({
      query: READ_ENROLLMENT,
      variables: input,
      fetchPolicy: "no-cache",
    });

    if (!response.data?.enrollment) return null;

    return {
      color: LIGHT_COLORS[i % LIGHT_COLORS.length],
      enrollmentHistory: response.data.enrollment,
      input,
      active: false,
      hidden: false,
    };
  } catch {
    return null;
  }
};

const transformEnrollmentData = (
  filteredOutputs: Output[]
): Array<{ day: number; [key: number]: number }> => {
  return filteredOutputs
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
};

const CHART_HEIGHT = 450;

const Enrollment = () => {
  const client = useApolloClient();
  const [searchParams, setSearchParams] = useSearchParams(); // specify courses plotted

  const initialInputs: Input[] = useMemo(
    () => parseInputsFromUrl(searchParams),
    [searchParams]
  );

  const [loading, setLoading] = useState<boolean>(initialInputs.length > 0);
  const [outputs, setOutputs] = useState<Output[]>([]); // enrollment timeseries data
  const [hoveredDay, setHoveredDay] = useState<number | null>(null); // which day is hovered

  useEffect(() => {
    const initialize = async () => {
      if (!loading) return;
      if (!initialInputs?.[0]) {
        searchParams.delete("input");
        setSearchParams(searchParams);

        return;
      }

      const results = await Promise.all(
        initialInputs.map((input, i) => fetchEnrollment(client, input, i))
      );

      const outputs = results
        .filter((output): output is Output => output !== null)
        .slice(0, 4); // TODO: 4 class limit magic number

      setOutputs(outputs);
      searchParams.delete("input");

      outputs.forEach((output) =>
        searchParams.append("input", getInputSearchParam(output.input))
      );

      setSearchParams(searchParams);
      setLoading(false);
    };

    initialize();
  }, [client, initialInputs, searchParams, loading]);

  const activeOutput = useMemo(
    () => outputs.find((out) => out.active),
    [outputs]
  );

  const filteredOutputs = useMemo(
    () => outputs.filter((output) => !output.hidden),
    [outputs]
  );

  const data = useMemo(
    () => transformEnrollmentData(filteredOutputs || []),
    [filteredOutputs]
  );

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
                  onMouseMove={(data) => {
                    if (!data.isTooltipActive || !data.activeLabel) return;
                    setHoveredDay(Number(data.activeLabel));
                  }}
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
                  <YAxis
                    domain={[0, dataMax]}
                    tickFormatter={(value) => decimalToPercentString(value, 0)}
                  />
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
                                    ? decimalToPercentString(v.value, 0)
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
            <div className={styles.hoverInfoContainer}>
              {outputs?.[0] ? (
                outputs.map((output: Output, i: number) => (
                  <div key={i} className={styles.hoverInfoCard}>
                    <HoverInfo
                      color={output.color}
                      subject={output.input.subject}
                      courseNumber={output.input.courseNumber}
                      enrollmentHistory={output.enrollmentHistory}
                      hoveredDay={hoveredDay}
                      semester={output.input.semester}
                      year={output.input.year}
                    />
                  </div>
                ))
              ) : (
                <HoverInfo
                  color={"#aaa"}
                  subject={"No Class"}
                  courseNumber={"Selected"}
                  hoveredDay={null}
                />
              )}
            </div>
          </Flex>
        )}
      </Flex>
      <Footer />
    </Box>
  );
};

export default Enrollment;
