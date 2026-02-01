import { ITermItem } from "@repo/common/models";

export type Semester = "Spring" | "Fall" | "Summer";
export type Group =
  | "continuing"
  | "new_transfer"
  | "new_freshman"
  | "new_graduate"
  | "new_student"
  | "all";
export type EventType = "start" | "end";

export interface ParsedEnrollmentEvent {
  termCode: string; // "SP26", "FA25" - derived
  semester: Semester;
  year: number; // 4-digit: 2026
  phase: 1 | 2 | null; // null for adjustment
  isAdjustment: boolean;
  group: Group;
  eventType: EventType;
}

const SEMESTER_PREFIX_MAP: Record<string, Semester> = {
  SP: "Spring",
  FA: "Fall",
  SU: "Summer",
};

const SEMESTER_FULL_MAP: Record<string, Semester> = {
  spring: "Spring",
  fall: "Fall",
  summer: "Summer",
};

/**
 * Extract semester and year from event summary prefix (e.g., "SP26", "FA25")
 */
function extractFromPrefix(summary: string): {
  semester: Semester;
  year: number;
} | null {
  const match = summary.match(/^(SP|FA|SU)(\d{2})\s/i);
  if (!match) return null;

  const prefix = match[1].toUpperCase();
  const yearShort = parseInt(match[2], 10);
  const year = yearShort >= 50 ? 1900 + yearShort : 2000 + yearShort;

  const semester = SEMESTER_PREFIX_MAP[prefix];
  if (!semester) return null;

  return { semester, year };
}

/**
 * Extract semester from full word format (e.g., "Spring - ", "Fall 2023 - ")
 */
function extractFromFullWord(summary: string): {
  semester: Semester;
  year: number | null;
} | null {
  const match = summary.match(/^(Spring|Fall|Summer)(?:\s+(\d{4}))?\s*-/i);
  if (!match) return null;

  const semesterWord = match[1].toLowerCase();
  const semester = SEMESTER_FULL_MAP[semesterWord];
  if (!semester) return null;

  const year = match[2] ? parseInt(match[2], 10) : null;
  return { semester, year };
}

/**
 * Infer year from terms collection by finding which term's enrollment period
 * contains the event date.
 */
function inferYearFromTerms(
  semester: Semester,
  eventDate: Date,
  terms: ITermItem[]
): number | null {
  // Find UGRD terms that match the semester
  const matchingTerms = terms.filter(
    (t) =>
      t.name.toLowerCase().includes(semester.toLowerCase()) &&
      t.academicCareerCode === "UGRD"
  );

  for (const term of matchingTerms) {
    const session = term.sessions?.[0];
    if (session?.enrollBeginDate) {
      const enrollStart = new Date(session.enrollBeginDate);
      // Use term end date as fallback if enrollEndDate not available
      const enrollEnd = session.enrollEndDate
        ? new Date(session.enrollEndDate)
        : new Date(term.endDate);

      // Add buffer: enrollment events can happen slightly before/after official dates
      const bufferDays = 14;
      const bufferedStart = new Date(enrollStart);
      bufferedStart.setDate(bufferedStart.getDate() - bufferDays);
      const bufferedEnd = new Date(enrollEnd);
      bufferedEnd.setDate(bufferedEnd.getDate() + bufferDays);

      if (eventDate >= bufferedStart && eventDate <= bufferedEnd) {
        return parseInt(term.academicYear, 10);
      }
    }
  }

  return null;
}

/**
 * Extract phase number (1 or 2) from summary
 */
function extractPhase(summary: string): 1 | 2 | null {
  // Match "Phase 1", "Phase I", "Phase 2", "Phase II"
  const match = summary.match(/Phase\s*([12I]+)/i);
  if (!match) return null;

  const phaseStr = match[1].toUpperCase();
  if (phaseStr === "1" || phaseStr === "I") return 1;
  if (phaseStr === "2" || phaseStr === "II") return 2;

  return null;
}

/**
 * Check if event is an adjustment period event
 */
function isAdjustmentEvent(summary: string): boolean {
  return /adjustment\s*period/i.test(summary);
}

/**
 * Extract student group from summary
 */
function extractGroup(summary: string): Group {
  const lowerSummary = summary.toLowerCase();

  // Order matters - more specific patterns first
  if (
    /new\s+(undergraduate\s+)?transfer/.test(lowerSummary) ||
    /new\s+transfer\s+undergrad/.test(lowerSummary)
  ) {
    return "new_transfer";
  }

  if (
    /new\s+(undergraduate\s+)?(freshman|first[\s-]*year)/.test(lowerSummary) ||
    /new\s+freshmen/.test(lowerSummary)
  ) {
    return "new_freshman";
  }

  if (/new\s+graduate/.test(lowerSummary)) {
    return "new_graduate";
  }

  // Generic "new student" (used for shared end dates)
  if (
    /new\s+student/.test(lowerSummary) ||
    /new\s+undergraduate\s+student/.test(lowerSummary)
  ) {
    return "new_student";
  }

  if (/continuing/.test(lowerSummary)) {
    return "continuing";
  }

  // Default for adjustment periods or unspecified
  return "all";
}

/**
 * Extract event type (start or end)
 */
function extractEventType(summary: string): EventType | null {
  const lowerSummary = summary.toLowerCase();

  if (/\b(begin|start)/.test(lowerSummary)) {
    return "start";
  }

  if (/\bend/.test(lowerSummary)) {
    return "end";
  }

  return null;
}

/**
 * Generate term code from semester and year (e.g., "SP26", "FA25")
 */
function generateTermCode(semester: Semester, year: number): string {
  const prefix =
    semester === "Spring" ? "SP" : semester === "Fall" ? "FA" : "SU";
  const yearShort = year % 100;
  return `${prefix}${yearShort.toString().padStart(2, "0")}`;
}

/**
 * Check if the summary matches enrollment phase patterns
 */
function isEnrollmentPhaseEvent(summary: string): boolean {
  const lowerSummary = summary.toLowerCase();
  return (
    /phase\s*[12i]/i.test(summary) ||
    /adjustment\s*period/i.test(summary) ||
    (/enrollment\s*(begin|end|start)/i.test(summary) &&
      (lowerSummary.includes("continuing") ||
        lowerSummary.includes("new") ||
        lowerSummary.includes("phase")))
  );
}

/**
 * Main parser function - parses enrollment event summary into structured data.
 * Returns null if the event doesn't match enrollment phase patterns.
 */
export function parseEnrollmentEvent(
  summary: string,
  eventDate: Date,
  terms: ITermItem[]
): ParsedEnrollmentEvent | null {
  // First check if this looks like an enrollment phase event
  if (!isEnrollmentPhaseEvent(summary)) {
    return null;
  }

  // Extract semester and year
  let semester: Semester | null = null;
  let year: number | null = null;

  // Try prefix format first (SP26, FA25)
  const prefixResult = extractFromPrefix(summary);
  if (prefixResult) {
    semester = prefixResult.semester;
    year = prefixResult.year;
  } else {
    // Try full word format (Spring - , Fall 2023 - )
    const fullWordResult = extractFromFullWord(summary);
    if (fullWordResult) {
      semester = fullWordResult.semester;
      year = fullWordResult.year;
    }
  }

  // If we don't have semester, we can't parse this event
  if (!semester) {
    return null;
  }

  // If year is missing, infer from terms
  if (year === null) {
    year = inferYearFromTerms(semester, eventDate, terms);
    if (year === null) {
      return null; // Can't determine year
    }
  }

  // Extract phase and adjustment status
  const isAdjustment = isAdjustmentEvent(summary);
  const phase = isAdjustment ? null : extractPhase(summary);

  // Must be either a phase event or adjustment event
  if (!isAdjustment && phase === null) {
    return null;
  }

  // Extract event type
  const eventType = extractEventType(summary);
  if (!eventType) {
    return null;
  }

  // Extract group
  const group = extractGroup(summary);

  // Generate term code
  const termCode = generateTermCode(semester, year);

  return {
    termCode,
    semester,
    year,
    phase,
    isAdjustment,
    group,
    eventType,
  };
}
