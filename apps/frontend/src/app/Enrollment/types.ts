import { IEnrollment, Semester } from "@/lib/api";

export interface Input {
  subject: string;
  courseNumber: string;
  year: number;
  semester: Semester;
  sectionNumber?: string;
  sessionId?: string;
}

/**
 * Parses a single input string from URL parameters for Enrollment
 *
 * Format examples:
 * - Basic: "COMPSCI;61B;T;2024:Spring"
 * - With section: "COMPSCI;61B;T;2024:Spring;001"
 */
export function parseInputString(inputString: string): Input | null {
  const parts = inputString.split(";");

  // Minimum required: subject, courseNumber, type token, and term
  if (parts.length < 4) return null;

  const [subject, courseNumber, typeToken, termString] = parts;
  if (!subject || !courseNumber || typeToken !== "T" || !termString)
    return null;

  // Parse term (year:semester)
  const termParts = termString.split(":");
  if (termParts.length < 2) return null;

  const [rawYear, rawSemester] = termParts;
  if (!rawYear || !rawSemester) return null;

  const year = Number.parseInt(rawYear, 10);
  if (Number.isNaN(year)) return null;

  const semester = rawSemester as Semester;

  // Build the input object
  const input: Input = {
    subject,
    courseNumber,
    year,
    semester,
  };

  // Add optional sectionNumber if present
  if (parts[4]) {
    input.sectionNumber = parts[4];
  }

  return input;
}

export interface Output {
  color: string;
  enrollmentHistory: IEnrollment;
  input: Input;
  hidden: boolean;
  active: boolean;
}

export const getInputSearchParam = (input: Input) => {
  if (!input.sectionNumber) {
    return `${input.subject};${input.courseNumber};T;${input.year}:${input.semester}`;
  }
  return `${input.subject};${input.courseNumber};T;${input.year}:${input.semester};${input.sectionNumber}`;
};

export const LIGHT_COLORS = ["#4EA6FA", "#6ADF86", "#EC5186", "#F9E151"];
export const DARK_COLORS = ["#132a3e", "#1a3721", "#3b1621", "#3e3844"];

export const isInputEqual = (a: Input, b: Input) => {
  return (
    b.subject === a.subject &&
    b.courseNumber === a.courseNumber &&
    b.sectionNumber === a.sectionNumber &&
    b.year === a.year &&
    b.semester === a.semester
  );
};
