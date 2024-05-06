import { ClassType } from "../../models/class";
import { CourseType } from "../../models/course";
import { SectionType } from "../../models/section";
import { TermInput } from "../../generated-types/graphql";
import { getCsCourseId } from "../../utils/course";
import { stringToTerm } from "../../utils/term";

export function formatMetadata(data: any) {
  return {
    lastUpdated: !data._updated
      ? (data._updatedAt as Date)
      : (data._updated as Date),
    raw: data,
  };
}

export function formatClass(cls: ClassType | null): any {
  if (cls == null) return null;

  const term = stringToTerm(cls.session?.term?.name as string);
  const id = getCsCourseId(cls.course as CourseType);

  return {
    course: {
      id,
      term,
    },

    primarySection: {
      id,
      term,
      classNumber: cls.number,
    },

    sections: {
      id,
      term,
      classNumber: cls.number,
    },

    description: cls.classDescription,
    number: cls.number as string,
    semester: term.semester,
    gradingBasis: cls.gradingBasis?.description as string,
    finalExam: cls.finalExam?.code as string,
    session: cls.session?.id as string,
    title: cls.classTitle,
    unitsMax: cls.allowedUnits?.maximum as number,
    unitsMin: cls.allowedUnits?.minimum as number,
    year: term.year,

    ...formatMetadata(cls),
  };
}

export function formatSection(section: SectionType | null): any {
  if (section == null) return null;

  const term = stringToTerm(section.class?.session?.term?.name as string);

  const id = getCsCourseId(section.class?.course as CourseType);

  return {
    class: {
      id,
      term,
      classNumber: section.class?.number,
    },

    course: {
      id,
      term,
    },

    ccn: section.id as number,
    number: section.number as string,
    primary: section.association?.primary as boolean,

    component: section.component?.code as string,

    endDate: section?.endDate?.toISOString() as string,
    startDate: section?.startDate?.toISOString() as string,

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

      endDate: m.endDate?.toISOString() as string,
      endTime: m.endTime,
      location: m.location?.description,
      startDate: m.startDate?.toISOString() as string,
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
      date: e.date,
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

    ...formatMetadata(section),
  };
}

export function formatCourse(
  course: CourseType | null,
  term?: TermInput | null
): any {
  if (course == null) return null;

  return {
    classes: getCsCourseId(course),

    crossListing: {
      displayNames: course.crossListing?.courses,
      term,
    },

    requiredCourses: Array.isArray(course.preparation?.requiredCourses)
      ? course.preparation?.requiredCourses.map((c) =>
          getCsCourseId(c as CourseType)
        )
      : [],

    requirements: course.preparation?.requiredText,
    description: course.description as string,
    fromDate: course.fromDate,
    gradingBasis: course.gradingBasis?.description as string,
    academicCareer: course.academicCareer?.code as string,
    number: course.catalogNumber?.formatted as string,
    subject: course.classSubjectArea?.code as string,
    title: course.title as string,
    toDate: course.toDate,

    ...formatMetadata(course),
  };
}
