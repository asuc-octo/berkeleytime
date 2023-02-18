import { formatSchedule } from "./formatter";
import { Schedule } from "../../generated-types/graphql";
import { ScheduleModel } from "./model";

// export async function schedules(): Promise<Schedule[]> {
//   const schedules = await ScheduleModel.find();
//   // return schedules
//   // return null as any as ScheduleModule.Schedule;
//   return schedules.map(formatSchedule);
// }

// get the schedules for a user
export async function getSchedulesByUser(userID:string): Promise<Schedule[]> {
  const userSchedules = await ScheduleModel.find({created_by: userID})
  if (userSchedules.length == 0) {
    throw new Error("No schedules found for this user")
  }
  return userSchedules.map(formatSchedule)
}

// get the schedule for a user and a specific term
export async function getScheduleByTermAndUser(userID:string, term:string): Promise<Schedule> {
  const userTermSchedule = await ScheduleModel.findOne({created_by: userID, term: term})
  if (!userTermSchedule) {
    const userSchedules = await ScheduleModel.find({created_by: userID})
    if (userSchedules.length == 0) {
      throw new Error("No schedules found for this user")
    }
    throw new Error("No schedules found for this user that are associated with this term")
  }
  return formatSchedule(userTermSchedule as any)
}
