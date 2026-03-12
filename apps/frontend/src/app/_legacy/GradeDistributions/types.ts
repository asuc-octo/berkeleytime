import { IGradeDistribution } from "@/lib/api";
import { Semester } from "@/lib/generated/graphql";

export enum InputType {
  Term = "T",
  Instructor = "P",
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
  sessionId?: never;
}

export type InstructorInput = TermInstructorInput | NoTermInstructorInput;

export type Input = CourseInput | TermInput | InstructorInput;

export interface Output {
  color: string;
  gradeDistribution: IGradeDistribution;
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
