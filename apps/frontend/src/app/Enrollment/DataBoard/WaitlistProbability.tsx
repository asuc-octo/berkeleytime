import { useState } from "react";

import { useQuery } from "@apollo/client/react";
import { Input, Text } from "@repo/theme";

import { GetWaitlistProbabilityDocument } from "@/lib/generated/graphql";
import { Semester } from "@/lib/generated/graphql";

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
    <div
      style={{
        marginTop: 24,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <Text size="2" weight="medium">
        Waitlist get-in probability
      </Text>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Text size="1" style={{ minWidth: 120 }}>
            Position
          </Text>
          <Input
            type="number"
            min={0}
            value={kStr}
            onChange={(e) => setKStr(e.target.value)}
          />
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Text size="1" style={{ minWidth: 120 }}>
            Days left
          </Text>
          <Input
            type="number"
            min={0}
            step={0.5}
            value={timeRemainingDaysStr}
            onChange={(e) => setTimeRemainingDaysStr(e.target.value)}
          />
        </label>
      </div>
      {loading && hasValidInput && (
        <Text size="1" style={{ color: "var(--paragraph-color)" }}>
          Calculating…
        </Text>
      )}
      {error && (
        <Text size="1" style={{ color: "var(--red-500)" }}>
          {error.message}
        </Text>
      )}
      {result && !loading && hasValidInput && (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <Text size="2">
            P(get in) ={" "}
            <strong>
              {(result.probability * 100).toFixed(1)}%
            </strong>
          </Text>
        </div>
      )}
    </div>
  );
}
