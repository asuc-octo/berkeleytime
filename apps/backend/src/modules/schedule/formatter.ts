import { ScheduleType } from "@repo/common/models";

import { ScheduleModule } from "./generated-types/module-types";

export interface ScheduleRelationships {
  classes: ScheduleModule.SelectedClassInput[];
  term: null;
}

export type IntermediateSchedule = Omit<
  ScheduleModule.Schedule,
  keyof ScheduleRelationships
> &
  ScheduleRelationships;

export const formatSchedule = async (schedule: ScheduleType) => {
  return {
    ...schedule.toObject(),
    term: null,
  } as unknown as IntermediateSchedule;
};
