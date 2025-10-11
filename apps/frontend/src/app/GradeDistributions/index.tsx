import { useEffect, useMemo, useState } from "react";

import { useApolloClient } from "@apollo/client/react";
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

import { Boundary, Box, Flex, HoverCard, LoadingIndicator } from "@repo/theme";

import Footer from "@/components/Footer";
import {
  READ_GRADE_DISTRIBUTION,
  ReadGradeDistributionResponse,
} from "@/lib/api";
import { GRADES } from "@/lib/grades";
import { decimalToPercentString } from "@/utils/number-formatter";
import { parseInputsFromUrl } from "@/utils/url-course-parser";

import CourseManager from "./CourseManager";
import styles from "./GradeDistributions.module.scss";
import HoverInfo from "./HoverInfo";
import {
  DARK_COLORS,
  Input,
  LIGHT_COLORS,
  Output,
  getInputSearchParam,
} from "./types";

const fetchGradeDistribution = async (
  client: ReturnType<typeof useApolloClient>,
  input: Input,
  i: number
): Promise<Output | null> => {
  try {
    const response = await client.query<ReadGradeDistributionResponse>({
      query: READ_GRADE_DISTRIBUTION,
      variables: input,
    });

    if (!response.data?.grade) return null;

    return {
      color: LIGHT_COLORS[i],
      gradeDistribution: response.data.grade,
      input,
      active: false,
      hidden: false,
    };
  } catch {
    return null;
  }
};

const transformGradeDistributionData = (
  filteredOutputs: Output[]
): Array<{ letter: string; [key: number]: number }> => {
  return filteredOutputs?.reduce(
    (acc, output, index) => {
      output.gradeDistribution.distribution.forEach((grade) => {
        const column = acc.find((item) => item.letter === grade.letter);
        if (!column) return;

        const percent = Math.round(grade.percentage * 1000) / 10;
        column[index] = percent;
      });

      return acc;
    },
    GRADES.map((letter) => ({ letter })) as {
      letter: string;
      [key: number]: number;
    }[]
  );
};

const GradeDistributions = () => {
  const client = useApolloClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialInputs: Input[] = useMemo(
    () => parseInputsFromUrl(searchParams),
    [searchParams]
  ); // if courses are specified in the url, empty array if none

  const [loading, setLoading] = useState<boolean>(initialInputs.length > 0); // true if courses are specified in url
  const [outputs, setOutputs] = useState<Output[]>([]); // list of course grade information
  const [hoveredLetter, setHoveredLetter] = useState<string | null>(null); // which grade bucket is hovered

  useEffect(() => {
    const initialize = async () => {
      if (!loading) return;
      if (!initialInputs?.[0]) {
        searchParams.delete("input");
        setSearchParams(searchParams);

        return;
      }

      const results = await Promise.all(
        initialInputs.map((input, i) =>
          fetchGradeDistribution(client, input, i)
        )
      );

      const outputs = results
        .filter((output): output is Output => output !== null)
        .slice(0, 4);

      setOutputs(outputs);
      searchParams.delete("input");

      outputs.forEach((output) => {
        searchParams.append("input", getInputSearchParam(output.input));
      });

      setSearchParams(searchParams);
      setLoading(false);
    };

    initialize();
  }, [client, initialInputs, searchParams, loading]);

  const activeOutput = useMemo(
    () => outputs?.find((out) => out.active),
    [outputs]
  );

  const filteredOutputs = useMemo(
    () => outputs?.filter((output) => !output.hidden),
    [outputs]
  );

  const data = useMemo(
    () => transformGradeDistributionData(filteredOutputs || []),
    [filteredOutputs]
  );

  return (
    <Box p="5">
      <Flex direction="column">
        <CourseManager outputs={outputs} setOutputs={setOutputs} />
        {loading ? (
          <Boundary>
            <LoadingIndicator size="lg" />
          </Boundary>
        ) : (
          <Flex direction="row">
            <div className={styles.view}>
              <ResponsiveContainer width="100%" height={550}>
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
                  <YAxis
                    tickFormatter={(value) => decimalToPercentString(value, 1)}
                  />
                  {filteredOutputs?.length && (
                    <Tooltip
                      cursor={{
                        fill: "var(--border-color)",
                        fillOpacity: 0.5,
                      }}
                      content={(props) => {
                        return (
                          <HoverCard
                            content={props.label}
                            data={props.payload?.map((v) => {
                              const name = v.name?.valueOf();
                              return {
                                label: name ? name.toString() : "N/A",
                                value:
                                  typeof v.value === "number"
                                    ? decimalToPercentString(v.value, 1)
                                    : "N/A",
                                color: v.fill,
                              };
                            })}
                          />
                        );
                      }}
                    />
                  )}
                  {filteredOutputs?.map((output, index) => (
                    <Bar
                      dataKey={index}
                      fill={
                        activeOutput && !output.active
                          ? DARK_COLORS[index]
                          : output.color
                      }
                      key={index}
                      name={`${output.input.subject} ${output.input.courseNumber}`}
                      onMouseMove={(data) => setHoveredLetter(data.letter)}
                      radius={[
                        10 / filteredOutputs.length,
                        10 / filteredOutputs.length,
                        0,
                        0,
                      ]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
              {!filteredOutputs?.length && (
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
                      gradeDistribution={output.gradeDistribution}
                      hoveredLetter={hoveredLetter}
                    />
                  </div>
                ))
              ) : (
                <div className={styles.hoverInfoCard}>
                  <HoverInfo
                    color={"#aaa"}
                    subject={"No Class"}
                    courseNumber={"Selected"}
                    gradeDistribution={undefined}
                    hoveredLetter={null}
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
};

export default GradeDistributions;
