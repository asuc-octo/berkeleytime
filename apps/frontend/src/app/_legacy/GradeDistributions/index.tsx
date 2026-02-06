import { memo, useCallback, useEffect, useMemo, useState } from "react";

import { useApolloClient } from "@apollo/client/react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

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
import {
  type CourseOutput,
  type Input,
  getInputSearchParam,
} from "@/components/CourseAnalytics/types";
import CourseSelectionCard from "@/components/CourseSelectionCard";
import { type IGradeDistribution } from "@/lib/api";
import { GetGradeDistributionDocument } from "@/lib/generated/graphql";
import { GRADES } from "@/lib/grades";
import { RecentType, getPageUrl, savePageUrl } from "@/lib/recent";
import { parseInputsFromUrl } from "@/utils/url-course-parser";

import CourseInput from "./CourseInput";
import DataBoard from "./DataBoard";

type Output = CourseOutput<Input, IGradeDistribution>;

const fetchGradeDistribution = async (
  client: ReturnType<typeof useApolloClient>,
  input: Input
): Promise<{ data: IGradeDistribution; input: Input } | null> => {
  try {
    const response = await client.query({
      query: GetGradeDistributionDocument,
      variables: input,
    });

    if (!response.data?.grade) return null;

    return {
      data: response.data.grade,
      input,
    };
  } catch {
    return null;
  }
};

const transformGradeDistributionData = (
  filteredOutputs: Output[]
): Array<{ letter: string; [key: number]: number }> => {
  const letterMap = new Map<
    string,
    { letter: string; [key: number]: number }
  >();

  // Initialize map with all grade letters
  GRADES.forEach((letter) => {
    letterMap.set(letter, { letter });
  });

  filteredOutputs?.forEach((output, index) => {
    output.data.distribution?.forEach((grade) => {
      const column = letterMap.get(grade.letter);
      if (!column) return;

      const percent = Math.round(grade.percentage * 1000) / 10;
      column[index] = percent;
    });
  });

  return Array.from(letterMap.values());
};

type GradeChartProps = {
  data: Array<{ letter: string; [key: number]: number }>;
  filteredOutputs: Output[];
  chartConfig: ChartConfig;
  activeOutput?: Output;
  onHoverLetter: (letter: string | null) => void;
};

const GradeChart = memo(
  function GradeChart({
    data,
    filteredOutputs,
    chartConfig,
    activeOutput,
    onHoverLetter,
  }: GradeChartProps) {
    const barRadius = useCallback(
      (chartWidth: number) => {
        const baseRadius = Math.min(
          6,
          12 / Math.max(filteredOutputs.length, 1)
        );

        if (chartWidth && chartWidth < 500) return 0;
        return Math.max(0, baseRadius);
      },
      [filteredOutputs]
    );

    return (
      <ChartContainer config={chartConfig} hasData={filteredOutputs.length > 0}>
        {(chartWidth) => (
          <BarChart
            syncId="grade-distributions"
            width={730}
            height={200}
            data={data}
            onMouseLeave={() => onHoverLetter(null)}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--border-color)"
            />
            <XAxis dataKey="letter" fill="var(--label-color)" tickMargin={8} />
            <YAxis tickFormatter={(v) => formatters.percent(v, 1)} />
            {filteredOutputs.length > 0 && (
              <ChartTooltip
                content={(props) => {
                  const activeIndex = activeOutput
                    ? filteredOutputs.indexOf(activeOutput)
                    : -1;

                  const filteredPayload =
                    activeIndex >= 0
                      ? props.payload?.filter(
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          (item: any) =>
                            String(item.dataKey ?? item.name) ===
                            activeIndex.toString()
                        )
                      : props.payload;

                  const tooltipConfig = {
                    labelFormatter: (label: string | number | undefined) => {
                      const labelText = label?.toString() ?? null;
                      onHoverLetter(labelText);
                      return `Grade: ${labelText}`;
                    },
                    valueFormatter: (value: number) =>
                      formatters.percent(value, 1),
                    indicator: "square" as const,
                    sortBy: "value" as const,
                    sortOrder: "desc" as const,
                  };

                  return (
                    <ChartTooltipContent
                      {...props}
                      payload={filteredPayload}
                      config={chartConfig}
                      tooltipConfig={tooltipConfig}
                    />
                  );
                }}
              />
            )}
            {filteredOutputs.map((output, index) => (
              <Bar
                dataKey={index}
                fill={output.color}
                fillOpacity={activeOutput && !output.active ? 0.25 : 1}
                key={index}
                name={`${output.input.subject} ${output.input.courseNumber}`}
                radius={[barRadius(chartWidth), barRadius(chartWidth), 0, 0]}
              />
            ))}
          </BarChart>
        )}
      </ChartContainer>
    );
  },
  // Avoid re-rendering the chart when only hover state changes
  (prev, next) =>
    prev.data === next.data &&
    prev.filteredOutputs === next.filteredOutputs &&
    prev.chartConfig === next.chartConfig &&
    prev.activeOutput === next.activeOutput &&
    prev.onHoverLetter === next.onHoverLetter
);

const GradeDistributions = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [hoveredLetter, setHoveredLetter] = useState<string | null>(null);

  const initialInputs: Input[] = useMemo(() => {
    // If no current params, check for saved URL and parse it directly
    if (searchParams.toString().length === 0) {
      const savedUrl = getPageUrl(RecentType.GradesPage);
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
    savePageUrl(RecentType.GradesPage, currentUrl);
  }, [location.search]);

  // Update URL to match the restored state
  useEffect(() => {
    if (searchParams.toString().length === 0 && initialInputs.length > 0) {
      const savedUrl = getPageUrl(RecentType.GradesPage);
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
  } = useCourseManager({
    initialInputs,
    fetchData: fetchGradeDistribution,
    serializeInput: getInputSearchParam,
  });

  const data = useMemo(
    () => transformGradeDistributionData(filteredOutputs),
    [filteredOutputs]
  );

  const chartConfig = useMemo(() => {
    const labels = filteredOutputs.reduce(
      (acc, output, index) => {
        acc[index.toString()] =
          `${output.input.subject} ${output.input.courseNumber}`;
        return acc;
      },
      {} as Record<string, string>
    );

    const themes = filteredOutputs.reduce(
      (acc, output, index) => {
        acc[index.toString()] = {
          light: output.color,
          dark: output.color,
        };
        return acc;
      },
      {} as Record<string, { light: string; dark: string }>
    );

    return createChartConfig(
      filteredOutputs.map((_, i) => i.toString()),
      { labels, themes }
    );
  }, [filteredOutputs]);

  const sidebarOutputs = useMemo(() => {
    const selected = filteredOutputs?.filter((output) => output.active) ?? [];
    if (selected.length === 1) return selected;
    if ((filteredOutputs?.length ?? 0) === 1) return filteredOutputs;
    return [];
  }, [filteredOutputs]);

  const handleHoverLetter = useCallback((letter: string | null) => {
    setHoveredLetter(letter);
  }, []);

  return (
    <>
      <CourseAnalyticsPage
        courseInput={<CourseInput outputs={outputs} setOutputs={setOutputs} />}
        bottomTitle="% of Students vs Grade Received"
        bottomDescription={
          <>
            We source our course grade data from Berkeley's official{" "}
            <a
              href="https://calanswers.berkeley.edu/"
              target="_blank"
              rel="noopener noreferrer"
            >
              CalAnswers
            </a>{" "}
            database.
          </>
        }
        courseCards={
          <>
            {outputs.map((output, index) => {
              const instructor =
                output.input.type &&
                output.input.familyName &&
                output.input.givenName
                  ? `${output.input.givenName} ${output.input.familyName}`
                  : "All instructors";

              const semester =
                output.input.type && output.input.semester && output.input.year
                  ? `${output.input.semester} ${output.input.year}`
                  : "All semesters";

              return (
                <CourseSelectionCard
                  key={index}
                  color={output.color}
                  subject={output.input.subject}
                  number={output.input.courseNumber}
                  metadata={`${semester} • ${instructor}`}
                  gradeDistribution={output.data}
                  onClick={() => updateActive(index, !output.active)}
                  onClickDelete={() => remove(index)}
                  onClickHide={() => updateHidden(index, !output.hidden)}
                  active={output.active}
                  hidden={output.hidden}
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
            <GradeChart
              data={data}
              filteredOutputs={filteredOutputs}
              chartConfig={chartConfig}
              activeOutput={activeOutput}
              onHoverLetter={handleHoverLetter}
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
                gradeDistribution={output.data}
                hoveredLetter={hoveredLetter}
              />
            ))
          ) : (
            <DataBoard
              color={"#aaa"}
              subject={"No Class"}
              courseNumber={"Selected"}
              gradeDistribution={undefined}
              hoveredLetter={null}
            />
          )
        }
      />
    </>
  );
};

export default GradeDistributions;
