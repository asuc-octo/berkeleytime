import { IEnrollment, Semester } from "@/lib/api";

export interface Input {
  subject: string;
  courseNumber: string;
  year: number;
  semester: Semester;
  sectionNumber?: string;
  sessionId?: string;
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
