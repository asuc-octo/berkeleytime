import { ScheduleModule } from "./generated-types/module-types";
import { CustomEventType, ScheduleType } from "./model";

export function formatSchedule(schedule: ScheduleType): ScheduleModule.Schedule {
  return {
    name: schedule.date_created,
    created_by: schedule.created_by,
    date_created: schedule.date_created,
    last_updated: schedule.last_updated,
    term: schedule.term,
    public: schedule.public,
    class_IDs: schedule.class_IDs,
    section_IDs: schedule.section_IDs,
    custom_events: schedule.custom_events.map(formatCustomEvents)
    
  };
}

function formatCustomEvents(customEvent: CustomEventType) {
    return {
        start_time: customEvent.start_time,
        end_time: customEvent.end_time,
        title: customEvent.title,
        location: customEvent.location,
        description: customEvent.description,
        days_of_week: customEvent.days_of_week
    }
}