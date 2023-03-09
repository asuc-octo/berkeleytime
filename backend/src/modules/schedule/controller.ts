import { formatSchedule } from "./formatter";
import { Schedule, CustomEvent, InputMaybe } from "../../generated-types/graphql";
import { ScheduleModel } from "./model";
import { ObjectID } from "bson";
import { isBoolean } from "lodash";
//import { Schedule } from "./fixture";

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
export async function getScheduleByID(id:string): Promise<Schedule> {
  const scheduleFromID = await ScheduleModel.findById({_id: id})
  if (!scheduleFromID) {
    throw new Error("No schedules found with this ID")
  }
  return formatSchedule(scheduleFromID as any)
}

// delete a schedule specified by ObjectID
export async function removeSchedule(scheduleID:string): Promise<string> {
  const deletedSchedule = await ScheduleModel.findByIdAndDelete(scheduleID)
  if (!deletedSchedule) {
    throw new Error("Schedule deletion failed")
  }
  return scheduleID
}

// get current time stamp
function getTime(): string {
  const today = new Date()
  const dd = String(today.getDate()).padStart(2, '0')
  const mm = String(today.getMonth() + 1).padStart(2, '0') //January is 0!
  const yyyy = today.getFullYear()
  const today_string = yyyy + '/' + mm + '/' + dd
  return today_string
}

interface minimumViableSchedule {
  _id: ObjectID,
  created_by: string,
  term: string,
  schedule_name?: string,
  class_IDs?: string[],
  section_IDs?: string[],
  public?: boolean,
  last_updated?: string,
  date_created?: string,
}

// create a new schedule
export async function createSchedule(created_by: string, term: string, schedule_name: string, is_public: boolean, class_IDs: string[], section_IDs: string[]): Promise<Schedule> {

  // args: {arguments: InputMaybe<String>}
  // add class_IDs: [string], section_IDs: [string] later
  
  const current_time = getTime()
  const newID = new ObjectID()

  const schedulePartsToCreate: minimumViableSchedule = { _id: newID, created_by: created_by, term: term }
  if (schedule_name) {
    schedulePartsToCreate.schedule_name = schedule_name
  }

  if (class_IDs) {
    schedulePartsToCreate.class_IDs = class_IDs
  }

  if (section_IDs) {
    schedulePartsToCreate.section_IDs = section_IDs
  }

  schedulePartsToCreate.public = is_public
  schedulePartsToCreate.last_updated = current_time
  schedulePartsToCreate.date_created = current_time

  const newSchedule = await ScheduleModel.create(schedulePartsToCreate)
  // const newSchedule = await ScheduleModel.create({_id: newID, name: schedule_name, created_by: created_by, date_created: current_time, last_updated: current_time, term: term, public: is_public, class_IDs: class_IDs, section_IDs: section_IDs})
  return formatSchedule(newSchedule as any)
}

interface partialSchedule {
  schedule_name?: string,
  created_by?: string,
  term?: string,
  class_IDs?: string[],
  section_IDs?: string[],
  public?: boolean,
  update_time?: string
}

// update an existing schedule
export async function editSchedule(schedule_ID: string, created_by: string | undefined | null, term: string | undefined | null, schedule_name: string | undefined | null, class_IDs: string[], section_IDs: string[], is_public?: boolean | undefined | null): Promise<Schedule> {
  const current_time = getTime()
  
  const schedulePartsToUpdate: partialSchedule = { update_time: current_time}

  if (term) {
    schedulePartsToUpdate.term = term
  }
  if (schedule_name) {
    schedulePartsToUpdate.schedule_name = schedule_name
  }
  if (class_IDs) {
    schedulePartsToUpdate.class_IDs = class_IDs
  }
  if (section_IDs) {
    schedulePartsToUpdate.section_IDs = section_IDs
  }
  if (isBoolean(is_public)) {
    schedulePartsToUpdate.public = is_public
  }
  
  /** 
  let updatedSchedule
  if (isBoolean(is_public)) {
    schedulePartsToUpdate.public = is_public
    updatedSchedule = await ScheduleModel.findByIdAndUpdate(schedule_ID, schedulePartsToUpdate, {returnDocument: 'after'})
    //updatedSchedule = await ScheduleModel.findByIdAndUpdate(schedule_ID, {name: schedule_name, created_by: created_by, last_updated: current_time, term: term, public: is_public, class_IDs: class_IDs, section_IDs: section_IDs}, {returnDocument: 'after'})
  } else {
    updatedSchedule = await ScheduleModel.findByIdAndUpdate(schedule_ID, {name: schedule_name, created_by: created_by, last_updated: current_time, term: term, class_IDs: class_IDs, section_IDs: section_IDs}, {returnDocument: 'after'})
  }*/

  const updatedSchedule = await ScheduleModel.findByIdAndUpdate(schedule_ID, schedulePartsToUpdate, {returnDocument: 'after'})

  return formatSchedule(updatedSchedule as any)
}

// update section selection in an existing schedule
export async function setSections(schedule_ID: string, section_IDs: string[]): Promise<Schedule> {
  const existingSchedule = await ScheduleModel.findByIdAndUpdate(schedule_ID, {section_IDs: section_IDs, last_updated: getTime()}, {returnDocument: 'after'})
  if (!existingSchedule) {
    throw new Error("Unable to update existing schedule's section selection")
  }
  return formatSchedule(existingSchedule as any)
}

// update class selection in an existing schedule
export async function setClasses(scheduleID: string, class_IDs: string[]): Promise<Schedule> {
  const existingSchedule = await ScheduleModel.findByIdAndUpdate(scheduleID, {class_IDs: class_IDs, last_updated: getTime()}, {returnDocument: 'after'})
  if (!existingSchedule) {
    throw new Error("Unable to update existing schedule's class selection")
  }
  return formatSchedule(existingSchedule as any)
}
