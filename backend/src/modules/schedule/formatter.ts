import { ScheduleModule } from "./generated-types/module-types";
import { CustomEventType, ScheduleType, SelectedCourseType } from "../../models/schedule";
import { getCsCourseId } from "../../utils/course";
import { stringToTerm } from "../../utils/term";
import { CourseType } from "../../models/course";
import { formatMetadata } from "../catalog/formatter";
import { ClassModel } from "../../models/class";
import { matchCsCourseId } from "../catalog/controller"
import { formatClass } from "../catalog/formatter"

export function formatSchedule(schedule: ScheduleType): ScheduleModule.Schedule {
  const termFormatted = formatTerm(schedule.term.semester, schedule.term.year);
  return {
    _id: schedule._id as string,
    name: schedule.name,
    created_by: schedule.created_by,
    is_public: schedule.is_public,
    classes: schedule.courses.map(i => {
      return formatScheduleClass(i, termFormatted);
    }),
    term: termFormatted,
    custom_events: schedule.custom_events ? schedule.custom_events.map(formatCustomEvents) : undefined,
    created: schedule.createdAt.toISOString(),
    revised: schedule.updatedAt.toISOString(),
  };
}

function formatTerm(semester: string, year: number): ScheduleModule.TermOutput {
  return {
    semester: semester,
    year: year,
  }
}

function formatCustomEvents(customEvent: CustomEventType): ScheduleModule.CustomEvent{
    return {
        start_time: customEvent.start_time,
        end_time: customEvent.end_time,
        title: customEvent.title,
        location: customEvent.location,
        description: customEvent.description,
        days_of_week: customEvent.days_of_week
    }
}

// function formatClass(course: SelectedCourseType): ScheduleModule.Class{
//   return {
//     class_ID: course.class_ID,
//     primary_section_ID: course.primary_section_ID,
//     secondary_section_IDs: course.secondary_section_IDs,
//   }
// }

function formatScheduleClass(course: SelectedCourseType, termFormatted: ScheduleModule.TermOutput): any {
  const cls = getClassById(course.class_ID, termFormatted, course.primary_section_ID)
  .then(cls => {
    if (cls == null) return null

    const term = stringToTerm(cls.session?.term?.name as string)
    const id = getCsCourseId(cls.course as CourseType)

    return {
        course: {
            id,
            term
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
        enrollCount: cls.aggregateEnrollmentStatus?.enrolledCount as number,
        enrollMax: cls.aggregateEnrollmentStatus?.maxEnroll as number,
        number: cls.number as string,
        semester: term.semester,
        session: cls.session?.name as string,
        status: cls.status?.description as string,
        title: cls.classTitle,
        unitsMax: cls.allowedUnits?.maximum as number,
        unitsMin: cls.allowedUnits?.minimum as number,
        waitlistCount: cls.aggregateEnrollmentStatus?.waitlistedCount as number,
        waitlistMax: cls.aggregateEnrollmentStatus?.maxWaitlist as number,
        year: term.year,

        ...formatMetadata(cls),
    }
  })
  .catch(error => {
    console.error(error);
  });
}

function getClassById(id: string, term: ScheduleModule.TermOutput, classNumber: string = "001") {
  return ClassModel
      .findOne({
          "course.identifiers": matchCsCourseId(id),
          "session.term.name": termToString(term),
          "number": classNumber,
      })
      .lean()
      .then(formatClass)
}

export function termToString(term: ScheduleModule.TermOutput): string {
  return `${term.year} ${term.semester}`;
}