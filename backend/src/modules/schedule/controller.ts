// import { formatSchedule } from "./formatter";
import { ScheduleModel } from "./model";

export async function schedules() {
  const schedules = await ScheduleModel.find();
  return schedules
  // return null as any as ScheduleModule.Schedule;
  // return schedules.map(formatSchedule);
}

// get the schedules for a user
export async function getSchedulesByUser(userID:String) {
  const userSchedules = await ScheduleModel.findById(userID)
  return userSchedules
}

// get the schedule for a user and a specific term
export async function name(userID:String, term:String) {
  
}
