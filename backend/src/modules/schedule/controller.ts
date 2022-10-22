import { formatSchedule } from "./formatter";
import { ScheduleModel } from "./model";

export async function schedules() {
  const schedules = await ScheduleModel.find();

  return schedules.map(formatSchedule);
}
