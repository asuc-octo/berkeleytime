import {
  memo,
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
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import { Boundary, Box, Flex, LoadingIndicator } from "@repo/theme";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  createChartConfig,
  formatters,
} from "@/components/Chart";
import Footer from "@/components/Footer";
import { GetGradeDistributionDocument } from "@/lib/generated/graphql";
import { GRADES } from "@/lib/grades";
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

const useChartWidth = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect?.width ?? 0;
      setChartWidth(width);
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return { containerRef, chartWidth };
};

const useChartHeight = (chartWidth: number) => {
  return useMemo(() => {
    if (chartWidth > 1000) return 550;
    if (chartWidth >= 600) return 400;
    return 250;
  }, [chartWidth]);
};

const fetchGradeDistribution = async (
  client: ReturnType<typeof useApolloClient>,
  input: Input,
  i: number
): Promise<Output | null> => {
  try {
    const response = await client.query({
      query: GetGradeDistributionDocument,
      variables: input,
    });

    if (!response.data?.grade) return null;

    return {
      color: LIGHT_COLORS[i % LIGHT_COLORS.length],
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
  const letterMap = new Map<
    string,
    { letter: string; [key: number]: number }
  >();

  // Initialize map with all grade letters
  GRADES.forEach((letter) => {
    letterMap.set(letter, { letter });
  });

  filteredOutputs?.forEach((output, index) => {
    output.gradeDistribution.distribution?.forEach((grade) => {
      const column = letterMap.get(grade.letter);
      if (!column) return;

      const percent = Math.round(grade.percentage * 1000) / 10;
      column[index] = percent;
    });
  });

  return Array.from(letterMap.values());
};

type GradeChartProps = {
  data: Array<{ letter: string; [key: string]: number }>;
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
    const { containerRef, chartWidth } = useChartWidth();
    const chartHeight = useChartHeight(chartWidth);

    const barRadius = useMemo(() => {
      const baseRadius = Math.min(
        6,
        12 / Math.max(filteredOutputs.length, 1)
      );

      if (chartWidth && chartWidth < 500) return 0;
      return Math.max(0, baseRadius);
    }, [chartWidth, filteredOutputs]);

    return (
      <div className={styles.view} ref={containerRef}>
        <ChartContainer config={chartConfig} className={styles.chart}>
          <ResponsiveContainer width="100%" height={chartHeight || 400}>
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
              <XAxis
                dataKey="letter"
                fill="var(--label-color)"
                tickMargin={8}
              />
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
                      valueFormatter: (value: number) => formatters.percent(value, 1),
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
                  fillOpacity={
                    activeOutput && !output.active ? 0.25 : 1
                  }
                  key={index}
                  name={`${output.input.subject} ${output.input.courseNumber}`}
                  radius={[
                    barRadius,
                    barRadius,
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
        </ChartContainer>
      </div>
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
        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete("input");
        setSearchParams(nextParams);

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

      setOutputs(outputs.map((output) => ({ ...output, active: false })));
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("input");

      outputs.forEach((output) => {
        nextParams.append("input", getInputSearchParam(output.input));
      });

      setSearchParams(nextParams);
      setLoading(false);
    };

    initialize();
  }, [client, initialInputs, searchParams, loading]);

  const activeOutput = useMemo(
    () => outputs?.find((out) => out.active),
    [outputs]
  );

  const filteredOutputs = useMemo(
    () => outputs.filter((output) => !output.hidden),
    [outputs]
  );

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
          light: LIGHT_COLORS[index % LIGHT_COLORS.length],
          dark: DARK_COLORS[index % DARK_COLORS.length],
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
    <Box p="5" className={styles.root}>
      <Flex direction="column">
        <CourseManager outputs={outputs} setOutputs={setOutputs} />
        {loading ? (
          <Boundary>
            <LoadingIndicator size="lg" />
          </Boundary>
        ) : (
          <div className={styles.content}>
            <GradeChart
              data={data}
              filteredOutputs={filteredOutputs}
              chartConfig={chartConfig}
              activeOutput={activeOutput}
              onHoverLetter={handleHoverLetter}
            />
            <div className={styles.hoverInfoContainer}>
              {sidebarOutputs?.[0] ? (
                sidebarOutputs.map((output: Output, i: number) => (
                  <div key={i} className={styles.hoverInfoCard}>
                    <HoverInfo
                      color={output.color}
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
          </div>
        )}
      </Flex>
      <Footer />
    </Box>
  );
};

export default GradeDistributions;
