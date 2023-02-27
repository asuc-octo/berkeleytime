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

// delete a schedule specified by ObjectID
export async function removeSchedule(scheduleID:string): Promise<string> {
  const deletedSchedule = await ScheduleModel.findByIdAndDelete(scheduleID)
  if (!deletedSchedule) {
    throw new Error("Schedule deletion failed")
  }
  return scheduleID
}

// create a new schedule
export async function createSchedule(created_by: string, term: string, schedule_name: string, is_public: boolean): Promise<Schedule> {
  // add class_IDs: [string], section_IDs: [string] later
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();
  const today_string = yyyy + '/' + mm + '/' + dd;

  const newSchedule = await ScheduleModel.create({name: schedule_name, created_by: created_by, date_created: today_string, last_updated: today_string, term: term, public: is_public})
  return formatSchedule(newSchedule as any)
}
