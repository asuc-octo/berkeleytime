import { formatSchedule } from "./formatter";
import { Schedule } from "../../generated-types/graphql";
import { ScheduleModel } from "./model";

export async function schedules(): Promise<Schedule[]> {
  const schedules = await ScheduleModel.find();
  // return schedules
  // return null as any as ScheduleModule.Schedule;
  return schedules.map(formatSchedule);
}

// get the schedules for a user
export async function getSchedulesByUser(userID:String) {
  const userSchedules = await ScheduleModel.findById(userID)
  return userSchedules
}

// get the schedule for a user and a specific term
export async function name(userID:String, term:String) {
  const userTermSchedules = await ScheduleModel.findOne(userID, term)
  return userTermSchedules
}
