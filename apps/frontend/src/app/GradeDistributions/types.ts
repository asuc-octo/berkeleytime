import { GradeDistribution, Semester } from "@/lib/api";

export enum InputType {
  Term = "T",
  Instructor = "P",
}

interface ParsedTerm {
  year: number;
  semester: Semester;
  sessionId: string;
}

interface ParsedInstructor {
  givenName: string;
  familyName: string;
}

/**
 * Parses a term string like "2024:Spring:001" into structured data
 */
function parseTerm(termString: string | undefined): ParsedTerm | null {
  if (!termString) return null;

  const parts = termString.split(":");
  if (parts.length < 3) return null;

  const [rawYear, rawSemester, sessionId] = parts;
  if (!rawYear || !rawSemester || !sessionId) return null;

  const year = Number.parseInt(rawYear, 10);
  if (Number.isNaN(year)) return null;

  return {
    year,
    semester: rawSemester as Semester,
    sessionId,
  };
}

/**
 * Parses an instructor string like "John:DeNero" into structured data
 */
function parseInstructor(
  instructorString: string | undefined
): ParsedInstructor | null {
  if (!instructorString) return null;

  const parts = instructorString.split(":");
  if (parts.length < 2) return null;

  const [givenName, familyName] = parts;
  if (!givenName || !familyName) return null;

  return { givenName, familyName };
}

/**
 * Parses a single input string from URL parameters for GradeDistributions
 *
 * Format examples:
 * - Basic: "COMPSCI;61B"
 * - Term: "COMPSCI;61B;T;2024:Spring:001"
 * - Instructor: "COMPSCI;61B;P;John:DeNero"
 * - Full: "COMPSCI;61B;T;2024:Spring:001;John:DeNero"
 */
export function parseInputString(inputString: string): Input | null {
  const parts = inputString.split(";");

  // Minimum required: subject and course number
  if (parts.length < 2) return null;

  const [subject, courseNumber] = parts;
  if (!subject || !courseNumber) return null;

  // Basic format: just subject and course number
  if (parts.length < 4) {
    return { subject, courseNumber };
  }

  const typeToken = parts[2];
  if (!["T", "P"].includes(typeToken)) return null;

  const inputType = typeToken as InputType;

  // Parse term and instructor based on type
  const termIndex = inputType === InputType.Term ? 3 : 4;
  const instructorIndex = inputType === InputType.Term ? 4 : 3;

  const term = parseTerm(parts[termIndex]);
  const instructor = parseInstructor(parts[instructorIndex]);

  // Build the input object based on what was successfully parsed
  if (inputType === InputType.Term) {
    if (!term) return null;

    const baseInput: Input = {
      subject,
      courseNumber,
      type: InputType.Term,
      ...term,
    };

    // Add instructor if present
    if (instructor) {
      return { ...baseInput, ...instructor };
    }

    return baseInput;
  }

  if (inputType === InputType.Instructor) {
    if (!instructor) return null;

    const baseInput: Input = {
      subject,
      courseNumber,
      type: InputType.Instructor,
      ...instructor,
    };

    // Add term if present
    if (term) {
      return { ...baseInput, ...term };
    }

    return baseInput;
  }

  return null;
}

interface BaseInput {
  subject: string;
  courseNumber: string;
  type?: InputType;
}

export interface CourseInput extends BaseInput {
  type?: never;
}

interface BaseTermInput extends BaseInput {
  year: number;
  semester: Semester;
  type: InputType.Term;
  sessionId: string;
}

export interface InstructorTermInput extends BaseTermInput {
  givenName: string;
  familyName: string;
}

export interface NoInstructorTermInput extends BaseTermInput {
  givenName?: never;
  familyName?: never;
}

export type TermInput = InstructorTermInput | NoInstructorTermInput;

interface BaseInstructorInput extends BaseInput {
  givenName: string;
  familyName: string;
  type: InputType.Instructor;
}

export interface TermInstructorInput extends BaseInstructorInput {
  year: number;
  semester: Semester;
  sessionId: string;
}

export interface NoTermInstructorInput extends BaseInstructorInput {
  year?: never;
  semester?: never;
}

export type InstructorInput = TermInstructorInput | NoTermInstructorInput;

export type Input = CourseInput | TermInput | InstructorInput;

export interface Output {
  color: string;
  gradeDistribution: GradeDistribution;
  input: Input;
  hidden: boolean;
  active: boolean;
}

export const getInputSearchParam = (input: Input) => {
  // Course input
  if (!input.type) return `${input.subject};${input.courseNumber}`;

  // Term input
  if (input.type === InputType.Term) {
    const termSegment = `${input.year}:${input.semester}:${input.sessionId}`;
    if (!input.givenName && !input.familyName) {
      return `${input.subject};${input.courseNumber};T;${termSegment}`;
    }

    return `${input.subject};${input.courseNumber};T;${termSegment};${input.givenName}:${input.familyName}`;
  }

  // Instructor input
  if (!input.year && !input.semester) {
    return `${input.subject};${input.courseNumber};P;${input.givenName}:${input.familyName}`;
  }

  const termSegment = `${input.year}:${input.semester}:${input.sessionId}`;

  return `${input.subject};${input.courseNumber};P;${input.givenName}:${input.familyName};${termSegment}`;
};

export const LIGHT_COLORS = ["#4EA6FA", "#6ADF86", "#EC5186", "#F9E151"];

export const DARK_COLORS = ["#132a3e", "#1a3721", "#3b1621", "#3e3844"];

export const isInputEqual = (a: Input, b: Input) => {
  if (!a.type && !b.type)
    return b.courseNumber === a.courseNumber && b.subject === a.subject;

  if (a.type !== b.type) return false;

  if (a.type === InputType.Term && b.type === InputType.Term) {
    return (
      b.subject === a.subject &&
      b.courseNumber === a.courseNumber &&
      b.givenName === a.givenName &&
      b.familyName === a.familyName &&
      b.year === a.year &&
      b.semester === a.semester &&
      b.sessionId === a.sessionId
    );
  }

  if (a.type === InputType.Instructor && b.type === InputType.Instructor) {
    const baseMatch =
      b.subject === a.subject &&
      b.courseNumber === a.courseNumber &&
      b.givenName === a.givenName &&
      b.familyName === a.familyName;
    if (a.year && a.semester && b.year && b.semester) {
      return (
        baseMatch &&
        b.year === a.year &&
        b.semester === a.semester &&
        b.sessionId === a.sessionId
      );
    }
    return baseMatch && !a.year && !b.year;
  }

  return false;
};
