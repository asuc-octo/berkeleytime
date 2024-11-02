import { ScheduleType } from "@repo/common";

import { ScheduleModule } from "./generated-types/module-types";

interface Relationships {
  classes: ScheduleModule.SelectedClassInput[];
  term: null;
}

export type IntermediateSchedule = Omit<
  ScheduleModule.Schedule,
  keyof Relationships
> &
  Relationships;

export const formatSchedule = async (schedule: ScheduleType) => {
  return {
    _id: schedule._id as string,
    name: schedule.name,
    createdBy: schedule.createdBy,
    public: schedule.public,
    classes: schedule.classes,
    year: schedule.year,
    semester: schedule.semester,
    term: null,
    events: schedule.events,
  } as IntermediateSchedule;
};
