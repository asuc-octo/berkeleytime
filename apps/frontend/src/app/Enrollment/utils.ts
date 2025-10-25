import { Semester } from "@/lib/api";

import { Input } from "./types";

/**
 * Parses a single enrollment input string from URL parameters
 *
 * Format examples:
 * - "COMPSCI;61B;T;2024:Spring"
 * - "COMPSCI;61B;T;2024:Spring;001"
 */
function parseEnrollmentInputString(inputString: string): Input | null {
  const parts = inputString.split(";");

  // Required: subject, courseNumber, type marker (T), and term
  if (parts.length < 4) return null;

  const [subject, courseNumber, typeToken, termString] = parts;
  if (!subject || !courseNumber || typeToken !== "T" || !termString)
    return null;

  // Parse term (year:semester or year:semester:sessionId)
  const termParts = termString.split(":");
  if (termParts.length < 2) return null;

  const [rawYear, rawSemester] = termParts;
  if (!rawYear || !rawSemester) return null;

  const year = Number.parseInt(rawYear, 10);
  if (Number.isNaN(year)) return null;

  const semester = rawSemester as Semester;

  // Build base input
  const input: Input = {
    subject,
    courseNumber,
    year,
    semester,
  };

  // Add optional sessionId if present (3rd part of term)
  if (termParts[2]) {
    input.sessionId = termParts[2];
  }

  // Add optional sectionNumber if present (5th part overall)
  if (parts[4]) {
    input.sectionNumber = parts[4];
  }

  return input;
}

/**
 * Parses all enrollment input query parameters from URL into Input objects
 * Filters out invalid inputs
 */
export function parseEnrollmentInputsFromUrl(
  searchParams: URLSearchParams
): Input[] {
  const inputStrings = searchParams.getAll("input");

  return inputStrings
    .map(parseEnrollmentInputString)
    .filter((input): input is Input => input !== null);
}
