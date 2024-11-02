import { ClassType, SectionType } from "@repo/common";

import {
  ClassFinalExam,
  ClassGradingBasis,
  Semester,
} from "../../generated-types/graphql";
import { ClassModule } from "./generated-types/module-types";

interface Relationships {
  course: null;
  term: null;
  primarySection: null;
  sections: null;
  gradeDistribution: null;
}

export type IntermediateClass = Omit<ClassModule.Class, keyof Relationships> &
  Relationships;

export const formatDate = (date?: string | number | Date | null) => {
  if (!date) return date;

  if (date instanceof Date) return date.toISOString();

  return new Date(date).toISOString();
};

export const formatClass = (_class: ClassType) => {
  const [year, semester] = _class.session?.term?.name?.split(" ") as string[];

  return {
    subject: _class.course?.subjectArea?.code as string,
    courseNumber: _class.course?.catalogNumber?.formatted as string,
    number: _class.number as string,

    year: parseInt(year),
    semester: semester as Semester,
    session: _class.session?.id as string,

    course: null,
    gradeDistribution: null,
    term: null,
    primarySection: null,
    sections: null,

    description: _class.classDescription,
    gradingBasis: _class.gradingBasis?.description as ClassGradingBasis,
    finalExam: _class.finalExam?.code as ClassFinalExam,
    title: _class.classTitle,
    unitsMax: _class.allowedUnits?.maximum as number,
    unitsMin: _class.allowedUnits?.minimum as number,
  } as IntermediateClass;
};

export type IntermediateSection = Omit<
  ClassModule.Section,
  "course" | "term" | "class"
> & {
  course: null;
  term: null;
  class: null;
};

export const formatSection = (section: SectionType) => {
  const [year, semester] = section?.class?.session?.term?.name?.split(
    " "
  ) as string[];

  return {
    subject: section.class?.course?.subjectArea?.code as string,
    courseNumber: section?.class?.course?.catalogNumber?.formatted as string,
    classNumber: section?.class?.number as string,
    number: section.number as string,

    year: parseInt(year),
    semester: semester as Semester,
    session: section?.class?.session?.id as string,

    class: null,
    course: null,
    term: null,

    ccn: section.id as number,
    primary: section.association?.primary as boolean,

    component: section.component?.code as string,

    endDate: formatDate(section?.endDate),
    startDate: formatDate(section?.startDate),

    meetings: section.meetings?.map((m) => ({
      days: [
        m.meetsSunday,
        m.meetsMonday,
        m.meetsTuesday,
        m.meetsWednesday,
        m.meetsThursday,
        m.meetsFriday,
        m.meetsSaturday,
      ],

      endDate: formatDate(m.endDate),
      endTime: m.endTime,
      location: m.location?.description,
      startDate: formatDate(m.startDate),
      startTime: m.startTime,

      instructors: m?.assignedInstructors
        ?.filter(
          (i) => i.printInScheduleOfClasses && i.instructor?.names != undefined
        )
        .map((i) => {
          // Primary name has precedence over preferred name
          let nameInfo = i.instructor?.names?.find(
            (n) => n.type?.code === "PRI"
          );
          if (nameInfo == undefined) {
            nameInfo = i.instructor?.names?.find((n) => n.type?.code === "PRF");
          }

          return {
            givenName: nameInfo?.givenName as string,
            familyName: nameInfo?.familyName as string,
          };
        }),
    })),

    exams: section.exams?.map((e) => ({
      date: formatDate(e.date),
      endTime: e.endTime,
      location: e.location?.description as string,
      startTime: e.startTime,

      // FIN: Final, MID: Midterm
      final: e.type?.code === "FIN",
    })),

    // P: In-Person Instruction, O: Online
    online: section.instructionMode?.code === "O",

    // O: Open, C: Closed
    open: section.enrollmentStatus?.status?.code === "O",

    enrollCount: section.enrollmentStatus?.enrolledCount as number,
    enrollMax: section.enrollmentStatus?.maxEnroll as number,
    waitlistCount: section.enrollmentStatus?.waitlistedCount as number,
    waitlistMax: section.enrollmentStatus?.maxWaitlist as number,

    reservations: section.enrollmentStatus?.seatReservations?.map((sr) => ({
      group: sr.requirementGroup?.description as string,
      enrollCount: sr.enrolledCount as number,
      enrollMax: sr.maxEnroll as number,
    })),
  } as IntermediateSection;
};
