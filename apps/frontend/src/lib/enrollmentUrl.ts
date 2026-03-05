import { Semester } from "@/lib/generated/graphql";

export interface EnrollmentUrlInput {
  subject: string;
  courseNumber: string;
  year: number;
  semester: Semester;
  sectionNumber: string;
  sessionId?: string;
}

const parseInputString = (inputString: string): EnrollmentUrlInput | null => {
  const parts = inputString.split(";");
  if (parts.length < 5) return null;

  const [subject, courseNumber, typeToken, termString, sectionNumber] = parts;
  if (!subject || !courseNumber || !termString || !sectionNumber) return null;
  if (typeToken !== "T") return null;

  const termParts = termString.split(":");
  if (termParts.length < 2) return null;

  const [rawYear, rawSemester, rawSessionId] = termParts;
  if (!rawYear || !rawSemester) return null;

  const year = Number.parseInt(rawYear, 10);
  if (Number.isNaN(year)) return null;

  return {
    subject,
    courseNumber,
    year,
    semester: rawSemester as Semester,
    sectionNumber,
    sessionId: rawSessionId || undefined,
  };
};

export const isEnrollmentInputEqual = (
  a: EnrollmentUrlInput,
  b: EnrollmentUrlInput
) =>
  a.subject === b.subject &&
  a.courseNumber === b.courseNumber &&
  a.year === b.year &&
  a.semester === b.semester &&
  a.sessionId === b.sessionId &&
  a.sectionNumber === b.sectionNumber;

export const getEnrollmentInputSearchParam = (input: EnrollmentUrlInput) => {
  const termParts = [`${input.year}`, input.semester];
  if (input.sessionId) termParts.push(input.sessionId);

  return `${input.subject};${input.courseNumber};T;${termParts.join(":")};${input.sectionNumber}`;
};

export const getEnrollmentInputId = (input: EnrollmentUrlInput) =>
  `${input.subject}-${input.courseNumber}-${input.year}-${input.semester}-${input.sessionId ?? "1"}-${input.sectionNumber}`;

export const parseEnrollmentInputsFromUrl = (
  searchParams: URLSearchParams
): EnrollmentUrlInput[] => {
  const parsed = searchParams
    .getAll("input")
    .map(parseInputString)
    .filter((input): input is EnrollmentUrlInput => input !== null);

  return parsed.filter(
    (input, index, allInputs) =>
      allInputs.findIndex((candidate) =>
        isEnrollmentInputEqual(candidate, input)
      ) === index
  );
};
