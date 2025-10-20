import { Semester } from "@/lib/api";

import {
  Input,
  InputType,
  isInputEqual,
} from "../app/GradeDistributions/types";

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
 * Parses a single input string from URL parameters
 *
 * Format examples:
 * - Basic: "COMPSCI;61B"
 * - Term: "COMPSCI;61B;T;2024:Spring:001"
 * - Instructor: "COMPSCI;61B;P;John:DeNero"
 * - Full: "COMPSCI;61B;T;2024:Spring:001;John:DeNero"
 */
function parseInputString(inputString: string): Input | null {
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

/**
 * Parses all input query parameters from URL into Input objects
 * Filters out invalid inputs and removes duplicates
 */
export function parseInputsFromUrl(searchParams: URLSearchParams): Input[] {
  const inputStrings = searchParams.getAll("input");

  const inputs = inputStrings
    .map(parseInputString)
    .filter((input): input is Input => input !== null);

  // Remove duplicates
  return inputs.filter(
    (input, index, arr) =>
      arr.findIndex((i) => isInputEqual(input, i)) === index
  );
}
