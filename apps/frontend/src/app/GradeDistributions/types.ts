import { GradeDistribution, Semester } from "@/lib/api";

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
    if (!input.givenName && !input.familyName) {
      return `${input.subject};${input.courseNumber};T;${input.year}:${input.semester}`;
    }

    return `${input.subject};${input.courseNumber};T;${input.year}:${input.semester};${input.givenName}:${input.familyName}`;
  }

  // Instructor input
  if (!input.year && !input.semester) {
    return `${input.subject};${input.courseNumber};P;${input.givenName}:${input.familyName}`;
  }

  return `${input.subject};${input.courseNumber};P;${input.givenName}:${input.familyName};${input.year}:${input.semester}`;
};

export const LIGHT_COLORS = ["#4EA6FA", "#6ADF86", "#EC5186", "#F9E151"];

export const DARK_COLORS = ["#132a3e", "#1a3721", "#3b1621", "#3e3844"];

export const isInputEqual = (a: Input, b: Input) => {
  if (!a.type && !b.type)
    return b.courseNumber === a.courseNumber && b.subject === a.subject;

  if (
    (a.type === InputType.Instructor && b.type === InputType.Instructor) ||
    (a.type === InputType.Term && b.type === InputType.Term)
  ) {
    return (
      b.subject === a.subject &&
      b.courseNumber === a.courseNumber &&
      b.givenName === a.givenName &&
      b.familyName === a.familyName &&
      b.year === a.year &&
      b.semester === a.semester
    );
  }

  return false;
};
