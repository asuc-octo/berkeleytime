import { useMemo } from "react";

import { ArrowUpRight, FrameAltEmpty } from "iconoir-react";
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

import { Box, Button, Container, HoverCard } from "@repo/theme";

import useClass from "@/hooks/useClass";

import styles from "./Enrollment.module.scss";

const toPercent = (decimal: number) => {
  return `${decimal.toFixed(0)}%`;
};

export default function Enrollment() {
  const { class: _class } = useClass();

  const data = useMemo(() => {
    const history = _class.primarySection.enrollment?.history ?? [];
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
        const dayOffset =
          Math.floor(moment.duration(cur.diff(firstTime)).asDays()) + 1;

        timeToEnrollmentMap.set(dayOffset, {
          enrolledPercent: (enrollment.enrolledCount / maxEnroll) * 100,
          waitlistedPercent: (enrollment.waitlistedCount / maxWaitlist) * 100,
        });
      }
    }

    return Array.from(timeToEnrollmentMap.entries())
      .map(([day, data]) => ({
        day,
        enrolled: data.enrolledPercent,
        waitlisted: data.waitlistedPercent,
      }))
      .sort((a, b) => a.day - b.day);
  }, [_class.primarySection.enrollment]);

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

  if (data.length === 0) {
    return (
      <div className={styles.placeholder}>
        <FrameAltEmpty width={32} height={32} />
        <p className={styles.heading}>No Enrollment Data Available</p>
        <p className={styles.paragraph}>
          This class doesn't have enrollment history data yet.
          <br />
          Enrollment trends will appear here once data is available.
        </p>
      </div>
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
                  dataKey="day"
                  stroke="var(--label-color)"
                  tickMargin={8}
                  tick={{ fill: "var(--paragraph-color)", fontSize: 12 }}
                  label={{
                    value: "Days since enrollment opened",
                    position: "insideBottom",
                    offset: -5,
                    fill: "var(--label-color)",
                    fontSize: 12,
                  }}
                />
                <YAxis
                  stroke="var(--label-color)"
                  tickFormatter={toPercent}
                  tick={{ fill: "var(--paragraph-color)", fontSize: 12 }}
                />
                <Tooltip
                  content={(props) => {
                    return (
                      <HoverCard
                        content={`Day ${props.label}`}
                        data={props.payload?.map((v, index) => {
                          const name = v.name?.valueOf();
                          return {
                            key: `${name}-${index}`,
                            label:
                              name === "enrolled" ? "Enrolled" : "Waitlisted",
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
                <Line
                  type="monotone"
                  dataKey="enrolled"
                  stroke="var(--blue-500)"
                  dot={false}
                  strokeWidth={3}
                  name="enrolled"
                />
                <Line
                  type="monotone"
                  dataKey="waitlisted"
                  stroke="var(--orange-500)"
                  dot={false}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="waitlisted"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Container>
    </Box>
  );
}
