import { useState } from "react";

import { useQuery } from "@apollo/client/react";

import { Input, Text } from "@repo/theme";

import {
  CourseAnalyticsField,
  CourseAnalyticsGraphBox,
} from "@/components/CourseAnalytics/CourseAnalyticsLayout";
import { GetWaitlistProbabilityDocument } from "@/lib/generated/graphql";
import type { Semester } from "@/lib/generated/graphql";

interface WaitlistProbabilityProps {
  year: number;
  semester: Semester;
  sessionId: string | null;
  subject: string;
  courseNumber: string;
  sectionNumber: string;
}

export function WaitlistProbability({
  year,
  semester,
  sessionId,
  subject,
  courseNumber,
  sectionNumber,
}: WaitlistProbabilityProps) {
  const [kStr, setKStr] = useState("1");
  const [timeRemainingDaysStr, setTimeRemainingDaysStr] = useState("7");

  const section = {
    year,
    semester,
    sessionId: sessionId ?? null,
    subject,
    courseNumber,
    sectionNumber,
  };

  const kNum = kStr === "" ? NaN : Number(kStr);
  const timeRemainingDaysNum =
    timeRemainingDaysStr === "" ? NaN : Number(timeRemainingDaysStr);
  const hasValidInput =
    !Number.isNaN(kNum) &&
    !Number.isNaN(timeRemainingDaysNum) &&
    kNum >= 0 &&
    timeRemainingDaysNum >= 0;

  const { data, loading, error } = useQuery(GetWaitlistProbabilityDocument, {
    variables: {
      k: Math.max(0, Math.floor(kNum)),
      timeRemainingDays: Math.max(0, timeRemainingDaysNum),
      section,
    },
    skip: !hasValidInput,
  });

  const result = hasValidInput ? data?.waitlistGetInProbability : null;

  return (
    <CourseAnalyticsGraphBox>
      <Text size="2" weight="medium" style={{ marginBottom: 12 }}>
        Waitlist get-in probability
      </Text>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <CourseAnalyticsField label="Position">
          <Input
            type="number"
            min={0}
            value={kStr}
            onChange={(e) => setKStr(e.target.value)}
          />
        </CourseAnalyticsField>
        <CourseAnalyticsField label="Days left">
          <Input
            type="number"
            min={0}
            step={0.5}
            value={timeRemainingDaysStr}
            onChange={(e) => setTimeRemainingDaysStr(e.target.value)}
          />
        </CourseAnalyticsField>
      </div>
      {loading && hasValidInput && (
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
      {result && !loading && hasValidInput && (
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
            <strong>{(result.probability * 100).toFixed(1)}%</strong>
          </Text>
        </div>
      )}
    </CourseAnalyticsGraphBox>
  );
}
