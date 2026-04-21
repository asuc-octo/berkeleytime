import { useMemo, useState } from "react";

import { useQuery } from "@apollo/client/react";

import { Input, Text } from "@repo/theme";

import {
  CourseAnalyticsField,
  CourseAnalyticsGraphBox,
} from "@/components/CourseAnalytics/CourseAnalyticsLayout";
import { useReadEnrollmentTimeframes } from "@/hooks/api/enrollment";
import {
  GetClassPrimarySectionDatesDocument,
  GetWaitlistProbabilityDocument,
} from "@/lib/generated/graphql";
import type { Semester } from "@/lib/generated/graphql";
import { Semester as SemesterEnum } from "@/lib/generated/graphql";

interface WaitlistProbabilityProps {
  year: number;
  semester: Semester;
  sessionId: string | null;
  subject: string;
  courseNumber: string;
  sectionNumber: string;
  currentWaitlistedCount?: number | null;
  courseLabel?: string;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const parseDateInputToMs = (value: string): number | null => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [yearStr, monthStr, dayStr] = value.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day))
    return null;

  const localDate = new Date(year, month - 1, day, 12, 0, 0, 0);
  const ms = localDate.getTime();
  return Number.isNaN(ms) ? null : ms;
};

/** Calendar day at local noon from API date strings (ISO or YYYY-MM-DD). */
const parseApiDateToLocalNoonMs = (value: string): number | null => {
  const trimmed = value.trim();
  const ymd = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (ymd) return parseDateInputToMs(`${ymd[1]}-${ymd[2]}-${ymd[3]}`);

  const parsed = Date.parse(trimmed);
  if (Number.isNaN(parsed)) return null;
  const d = new Date(parsed);
  return parseDateInputToMs(
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
  );
};

const getTodayLocalNoonMs = (): number | null => {
  const now = new Date();
  return parseDateInputToMs(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
  );
};

export function WaitlistProbability({
  year,
  semester,
  sessionId,
  subject,
  courseNumber,
  sectionNumber,
  currentWaitlistedCount = null,
  courseLabel,
}: WaitlistProbabilityProps) {
  const [kStr, setKStr] = useState("1");

  const viewingDateMs = getTodayLocalNoonMs();

  const section = {
    year,
    semester,
    sessionId: sessionId ?? null,
    subject,
    courseNumber,
    sectionNumber,
  };

  const kNum = kStr === "" ? NaN : Number(kStr);

  const isSummerSession = semester === SemesterEnum.Summer;
  const isInstantGetIn = currentWaitlistedCount === 0;

  const { data: enrollmentTimeframes, loading: loadingTimeframes } =
    useReadEnrollmentTimeframes(year, semester, {
      skip: isSummerSession,
    });

  const { data: classDatesData } = useQuery(GetClassPrimarySectionDatesDocument, {
    variables: {
      year,
      semester,
      sessionId: sessionId ?? "1",
      subject,
      courseNumber,
      number: sectionNumber,
    },
    skip: isSummerSession,
  });

  const classStartDateRaw =
    classDatesData?.class?.primarySection?.startDate ?? null;

  const timeRemainingDaysNum = useMemo<number | null>(() => {
    if (!classStartDateRaw || viewingDateMs === null) return null;
    const classStartMs = parseApiDateToLocalNoonMs(classStartDateRaw);
    if (classStartMs === null) return null;
    return Math.max(0, (classStartMs - viewingDateMs) / MS_PER_DAY);
  }, [classStartDateRaw, viewingDateMs]);

  const hasValidInput =
    !Number.isNaN(kNum) &&
    kNum >= 0 &&
    timeRemainingDaysNum !== null &&
    Number.isFinite(timeRemainingDaysNum);

  const isInWaitlistPeriod = useMemo(() => {
    if (isSummerSession || viewingDateMs === null) return false;
    if (!enrollmentTimeframes || enrollmentTimeframes.length === 0) return false;

    const timeframeMs = enrollmentTimeframes
      .map((timeframe) => {
        const startMs = Date.parse(timeframe.startDate);
        const endMs = timeframe.endDate ? Date.parse(timeframe.endDate) : NaN;
        return {
          startMs,
          endMs: Number.isNaN(endMs) ? startMs : endMs,
        };
      })
      .filter(
        (timeframe) =>
          Number.isFinite(timeframe.startMs) && Number.isFinite(timeframe.endMs)
      );

    if (timeframeMs.length === 0) return false;

    const windowStart = Math.min(...timeframeMs.map((t) => t.startMs));
    const windowEnd = Math.max(...timeframeMs.map((t) => t.endMs));
    return viewingDateMs >= windowStart && viewingDateMs <= windowEnd;
  }, [enrollmentTimeframes, isSummerSession, viewingDateMs]);

  const shouldShowPredictor =
    !isSummerSession &&
    !loadingTimeframes &&
    viewingDateMs !== null &&
    isInWaitlistPeriod;

  const { data, loading, error } = useQuery(GetWaitlistProbabilityDocument, {
    variables: {
      k: Math.max(0, Math.floor(kNum)),
      timeRemainingDays: Math.max(0, timeRemainingDaysNum ?? 0),
      section,
    },
    skip: !hasValidInput || !shouldShowPredictor || isInstantGetIn,
  });

  const result =
    hasValidInput && shouldShowPredictor ? data?.waitlistGetInProbability : null;
  const probability = isInstantGetIn ? 1 : result?.probability ?? null;
  const predictorTargetLabel =
    courseLabel ?? `${subject} ${courseNumber} (Section ${sectionNumber})`;

  const waitlistSuffix =
    typeof currentWaitlistedCount === "number"
      ? `/${currentWaitlistedCount}`
      : null;

  if (!shouldShowPredictor) {
    return null;
  }

  return (
    <div style={{ marginTop: 24 }}>
      <CourseAnalyticsGraphBox>
      <div style={{ marginBottom: 10 }}>
        <Text size="2" weight="medium">
          Waitlist predictor
        </Text>
        <Text size="1" style={{ color: "var(--paragraph-color)" }}>
          For: {predictorTargetLabel}
        </Text>
        <Text
          size="1"
          style={{ color: "var(--paragraph-color)", marginTop: 4 }}
        >
          Probability to get off waitlist by class start date.
        </Text>
      </div>

      <Text size="2" weight="medium" style={{ marginBottom: 12 }}>
        Get-in probability
      </Text>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <CourseAnalyticsField label="Position">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "nowrap",
            }}
          >
            <Input
              type="number"
              min={0}
              value={kStr}
              onChange={(e) => setKStr(e.target.value)}
              style={{
                width: 72,
                minWidth: 72,
                maxWidth: 72,
                flex: "0 0 72px",
              }}
            />
            {waitlistSuffix && (
              <Text
                size="2"
                style={{
                  color: "var(--label-color)",
                  whiteSpace: "nowrap",
                  flex: "0 0 auto",
                }}
              >
                {waitlistSuffix}
              </Text>
            )}
          </div>
        </CourseAnalyticsField>
        <CourseAnalyticsField label="Days until class start">
          <Text size="2" style={{ color: "var(--paragraph-color)" }}>
            {timeRemainingDaysNum !== null
              ? (() => {
                  const rounded = Math.round(timeRemainingDaysNum);
                  return `${rounded} day${rounded === 1 ? "" : "s"}`;
                })()
              : "Unknown"}
          </Text>
        </CourseAnalyticsField>
      </div>

      {loading && hasValidInput && !isInstantGetIn && (
        <Text
          size="1"
          style={{ color: "var(--paragraph-color)", marginTop: 8 }}
        >
          Calculating…
        </Text>
      )}
      {error && (
        <Text size="1" style={{ color: "var(--red-500)", marginTop: 8 }}>
          {error.message}
        </Text>
      )}
      {probability !== null && !loading && hasValidInput && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            marginTop: 12,
          }}
        >
          <Text size="2">
            P(get in) ={" "}
            <strong>{(probability * 100).toFixed(1)}%</strong>
          </Text>
          {isInstantGetIn && (
            <Text size="1" style={{ color: "var(--paragraph-color)" }}>
              Current waitlist is 0, so this is treated as an instant get-in.
            </Text>
          )}
        </div>
      )}
    </CourseAnalyticsGraphBox>
    </div>
  );
}
