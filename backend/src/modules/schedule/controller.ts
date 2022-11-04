// import { formatSchedule } from "./formatter";
import { ScheduleModel } from "./model";

export async function schedules() {
  const schedules = await ScheduleModel.find();
  return schedules
  // return schedules.map(formatSchedule);
}

export async function getSchedulesByUser(userID:String) {
  ScheduleModel.findById("")
}
