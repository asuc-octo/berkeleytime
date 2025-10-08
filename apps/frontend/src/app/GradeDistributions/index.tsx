import { useCallback, useEffect, useMemo, useState } from "react";

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
  Semester,
} from "@/lib/api";

import CourseManager from "./CourseManager";
import styles from "./GradeDistributions.module.scss";
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
  return `${decimal.toFixed(1)}%`;
};

export default function GradeDistributions() {
  const client = useApolloClient();
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse any initial input
  const [initialInputs] = useState<Input[]>(() =>
    searchParams
      .getAll("input")
      .reduce((acc, input) => {
        const output = input.split(";");

        // Any input must include a subject and number
        if (output.length < 2) return acc;

        // COMPSCI;61B
        if (output.length < 4) {
          const parsedInput: Input = {
            subject: output[0],
            courseNumber: output[1],
          };

          return acc.concat(parsedInput);
        }

        // Any input must specify a term or professor
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

        if (term?.[2]) parsedInput.sessionId = term[2];

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

  const [hoveredLetter, setHoveredLetter] = useState<string | null>(null);
  const [hoveredSeries, setHoveredSeries] = useState<number | null>(null);

  const initialize = useCallback(async () => {
    if (!loading) return;

    if (initialInputs.length === 0) {
      searchParams.delete("input");
      setSearchParams(searchParams);

      return;
    }

    // Fetch any valid initial input
    const responses = await Promise.all(
      initialInputs.map(async (input) => {
        try {
          const response = await client.query<ReadGradeDistributionResponse>({
            query: READ_GRADE_DISTRIBUTION,
            variables: input,
          });

          return response;
        } catch {
          // TODO: Handle errors

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
                // TODO: Error handling
                gradeDistribution: response.data!.grade,
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

    setSearchParams(searchParams);

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

  const data = useMemo(
    () =>
      filteredOutputs?.reduce(
        (acc, output, index) => {
          output.gradeDistribution.distribution.forEach((grade) => {
            const column = acc.find((item) => item.letter === grade.letter);
            if (!column) return;

            const percent = Math.round(grade.percentage * 1000) / 10;
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
    [filteredOutputs]
  );

  function updateGraphHover(data: any) {
    setHoveredLetter(data.letter);
    setHoveredSeries(data.tooltipPayload[0].dataKey);
  }

  useEffect(() => {
    if (outputs.length > 0) {
      if (!hoveredSeries) setHoveredSeries(0);
    } else setHoveredSeries(null);
  }, [hoveredSeries, outputs]);

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
                  {filteredOutputs?.length && (
                    <Tooltip
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
                                    ? toPercent(v.value)
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
                      onMouseMove={updateGraphHover}
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
            {outputs && hoveredSeries !== null ? (
              <HoverInfo
                color={LIGHT_COLORS[hoveredSeries]}
                subject={outputs[hoveredSeries]?.input.subject}
                courseNumber={outputs[hoveredSeries]?.input.courseNumber}
                gradeDistribution={outputs[hoveredSeries]?.gradeDistribution}
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
      <Footer />
    </Box>
  );
}
