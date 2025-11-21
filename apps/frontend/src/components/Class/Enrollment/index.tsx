import { useMemo } from "react";

import { ArrowUpRight, GraphUp } from "iconoir-react";
import moment from "moment";
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
import type { TooltipContentProps } from "recharts";

import { Box, Button, Container, HoverCard } from "@repo/theme";

import EmptyState from "@/components/Class/EmptyState";
import { useReadClassEnrollment } from "@/hooks/api/classes/useReadClass";
import useClass from "@/hooks/useClass";

import styles from "./Enrollment.module.scss";

const toPercent = (decimal: number) => {
  return `${decimal.toFixed(0)}%`;
};

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "America/Los_Angeles",
});

type EnrollmentTooltipPayload = {
  name?: string | number;
  value?: number;
  stroke?: string;
};

const renderTooltip = ({
  label,
  payload,
}: TooltipContentProps<number, string>) => {
  if (typeof label !== "number" || !payload || payload.length === 0) {
    return null;
  }

  const duration = moment.duration(label, "minutes");
  const day = Math.floor(duration.asDays()) + 1;
  const time = timeFormatter.format(moment.utc(0).add(duration).toDate());

  return (
    <HoverCard
      content={`Day ${day} ${time}`}
      data={payload.map((value: EnrollmentTooltipPayload, index: number) => {
        const name =
          typeof value.name === "string"
            ? value.name
            : typeof value.name === "number"
              ? value.name.toString()
              : "";
        return {
          key: `${name}-${index}`,
          label: name === "enrolled" ? "Enrolled" : "Waitlisted",
          value:
            typeof value.value === "number" ? toPercent(value.value) : "N/A",
          color: value.stroke,
        };
      })}
    />
  );
};

export default function Enrollment() {
  const { class: _class } = useClass();
  const { data: enrollmentData, loading } = useReadClassEnrollment(
    _class.year,
    _class.semester,
    _class.subject,
    _class.courseNumber,
    _class.number
  );

  const history = enrollmentData?.primarySection?.enrollment?.history ?? [];

  const data = useMemo(() => {
    if (history.length === 0) return [];

    const firstTime = moment(history[0].startTime).startOf("minute");
    const maxEnroll = history[history.length - 1].maxEnroll ?? 1;
    const maxWaitlist = history[history.length - 1].maxWaitlist ?? 1;

    const timeToEnrollmentMap = new Map<
      number,
      { enrolledPercent: number; waitlistedPercent: number }
    >();

    for (const enrollment of history) {
      const start = moment(enrollment.startTime).startOf("minute");
      const end = moment(enrollment.endTime).startOf("minute");
      const granularity = enrollment.granularitySeconds;

      for (
        let cur = start.clone();
        !cur.isAfter(end);
        cur.add(granularity, "seconds")
      ) {
        const timeDelta = moment.duration(cur.diff(firstTime)).asMinutes();

        timeToEnrollmentMap.set(timeDelta, {
          enrolledPercent: (enrollment.enrolledCount / maxEnroll) * 100,
          waitlistedPercent: (enrollment.waitlistedCount / maxWaitlist) * 100,
        });
      }
    }

    return Array.from(timeToEnrollmentMap.entries())
      .map(([timeDelta, values]) => ({
        timeDelta,
        enrolled: values.enrolledPercent,
        waitlisted: values.waitlistedPercent,
      }))
      .sort((a, b) => a.timeDelta - b.timeDelta);
  }, [history]);

  const dataMax = useMemo(() => {
    if (data.length === 0) return 0;
    const maxValue = data.reduce(
      (acc, point) => Math.max(acc, point.enrolled, point.waitlisted),
      0
    );

    return maxValue * 1.2;
  }, [data]);

  const enrollmentExplorerUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set(
      "input",
      `${_class.subject};${_class.courseNumber};T;${_class.year}:${_class.semester};${_class.number}`
    );

    if (typeof window !== "undefined") {
      try {
        const url = new URL(window.location.origin);
        if (url.hostname === "localhost") {
          url.port = "8080";
        }
        url.pathname = "/enrollment";
        url.search = params.toString();
        return url.toString();
      } catch {
        // ignore and fall back
      }
    }

    return `http://localhost:8080/enrollment?${params.toString()}`;
  }, [
    _class.subject,
    _class.courseNumber,
    _class.year,
    _class.semester,
    _class.number,
  ]);

  if (loading) {
    return <EmptyState heading="Loading Enrollment Data" loading />;
  }

  if (data.length === 0) {
    return (
      <EmptyState
        icon={<GraphUp width={32} height={32} />}
        heading="No Enrollment Data Available"
        paragraph={
          <>
            This class doesn't have enrollment history data yet.
            <br />
            Enrollment trends will appear here once data is available.
          </>
        }
      />
    );
  }

  return (
    <Box p="5" className={styles.root}>
      <Container size="3">
        <div className={styles.wrapper}>
          <div className={styles.header}>
            <div className={styles.titleBlock}>
              <h2 className={styles.title}>Enrollment History</h2>
              <p className={styles.subtitle}>
                {_class.semester} {_class.year}
              </p>
            </div>
            <Button
              as="a"
              href={enrollmentExplorerUrl}
              target="_blank"
              rel="noreferrer noopener"
              variant="secondary"
              className={styles.openButton}
            >
              Open in Enrollment
              <ArrowUpRight height={16} width={16} />
            </Button>
          </div>
          <div className={styles.chart}>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  width={730}
                  height={450}
                  data={data}
                  margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--border-color)"
                  />
                  <XAxis
                    dataKey="timeDelta"
                    type="number"
                    stroke="var(--label-color)"
                    tickMargin={8}
                    tick={{
                      fill: "var(--paragraph-color)",
                      fontSize: "var(--text-14)",
                    }}
                    tickFormatter={(timeDelta) =>
                      String(
                        Math.floor(
                          moment
                            .duration(timeDelta as number, "minutes")
                            .asDays()
                        ) + 1
                      )
                    }
                  />
                  <YAxis
                    stroke="var(--label-color)"
                    tickFormatter={toPercent}
                    tick={{
                      fill: "var(--paragraph-color)",
                      fontSize: "var(--text-14)",
                    }}
                    domain={[0, dataMax || 100]}
                  />
                  <Tooltip content={renderTooltip} />
                  <ReferenceLine
                    y={100}
                    stroke="var(--label-color)"
                    strokeDasharray="5 5"
                    strokeOpacity={0.5}
                    label={{
                      value: "100% Capacity",
                      position: "insideTopLeft",
                      fill: "var(--paragraph-color)",
                      fontSize: "var(--text-14)",
                      offset: 10,
                    }}
                  />
                  <Line
                    type="linear"
                    dataKey="waitlisted"
                    stroke="var(--orange-500)"
                    dot={false}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="waitlisted"
                    connectNulls
                  />
                  <Line
                    type="linear"
                    dataKey="enrolled"
                    stroke="var(--blue-500)"
                    dot={false}
                    strokeWidth={3}
                    name="enrolled"
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className={styles.axisLabel}>Days since enrollment opened</p>
          </div>
        </div>
      </Container>
    </Box>
  );
}
