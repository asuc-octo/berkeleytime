import { ScheduleModule } from "./generated-types/module-types";
import { CustomEventType, ScheduleType } from "../../db/schedule";

export function formatSchedule(schedule: ScheduleType): ScheduleModule.Schedule {
  return {
    _id: schedule._id as string,
    name: schedule.name,
    created_by: schedule.created_by,
    term: schedule.term,
    public: schedule.public,
    class_IDs: schedule.class_IDs,
    primary_section_IDs: schedule.primary_section_IDs,
    secondary_section_IDs: schedule.secondary_section_IDs,
    custom_events: schedule.custom_events.map(formatCustomEvents)
    
  };
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