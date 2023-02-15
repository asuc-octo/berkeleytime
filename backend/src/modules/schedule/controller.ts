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
export async function getSchedulesByUser(userID:string): Promise<Schedule[]> {
  const userSchedules = await ScheduleModel.find({created_by: userID})
  return userSchedules.map(formatSchedule)
}

// get the schedule for a user and a specific term
export async function getScheduleByTermandUser(userID:string, term:string): Promise<Schedule> {
  const userTermSchedule = await ScheduleModel.findOne({created_by: userID, term: term})
  return formatSchedule(userTermSchedule as any)
}
