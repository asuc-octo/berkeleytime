import { ScheduleType } from "@repo/common";

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
    ...schedule,

    term: null,
  } as IntermediateSchedule;
};
