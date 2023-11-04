import { ScheduleModule } from "./generated-types/module-types";
import { CustomEventType, ScheduleType, SelectedCourseType } from "../../db/schedule";

export function formatSchedule(schedule: ScheduleType): ScheduleModule.Schedule {
  return {
    _id: schedule._id as string,
    name: schedule.name,
    created_by: schedule.created_by,
    is_public: schedule.is_public,
    courses: schedule.courses.map(formatCourse),
    term: formatTerm(schedule.term.semester, schedule.term.year),
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

function formatCourse(course: SelectedCourseType): ScheduleModule.SelectedCourse{
  return {
    class_ID: course.class_ID,
    primary_section_ID: course.primary_section_ID,
    secondary_section_IDs: course.secondary_section_IDs,
  }
}