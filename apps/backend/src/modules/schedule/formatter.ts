import { ScheduleType } from "@repo/common";

import { ScheduleModule } from "./generated-types/module-types";

export type IntermediateSchedule = Omit<
  ScheduleModule.Schedule,
  "term" | "classes"
> & {
  term: null;
  classes: ScheduleModule.SelectedClassInput[];
};

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
