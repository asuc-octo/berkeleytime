import { formatSchedule } from "./formatter";
import { TermOutput, Schedule, TermInput, ScheduleInput } from "../../generated-types/graphql";
import { ScheduleModel } from "../../db/schedule";
import { minimumViableSchedule, partialSchedule } from "./partial-schedules";


// get the schedules for a user
export async function getSchedulesByUser(userID: string): Promise<Schedule[]> {
  const userSchedules = await ScheduleModel.find({created_by: userID})
  if (userSchedules.length == 0) {
    throw new Error("No schedules found for this user")
  }
  return userSchedules.map(formatSchedule)
}

// get the schedule for a user and a specific term
export async function getScheduleByID(id: string): Promise<Schedule> {
  const scheduleFromID = await ScheduleModel.findById({_id: id})
  if (!scheduleFromID) {
    throw new Error("No schedules found with this ID")
  }
  return formatSchedule(scheduleFromID)
}

// delete a schedule specified by ObjectID
export async function removeSchedule(scheduleID: string): Promise<string> {
  const deletedSchedule = await ScheduleModel.findByIdAndDelete(scheduleID)
  if (!deletedSchedule) {
    throw new Error("Schedule deletion failed")
  }
  return scheduleID
}


// create a new schedule
//export async function createSchedule(created_by: string, term: TermInput, schedule_name: string | undefined | null, is_public: boolean | null | undefined, class_IDs: string[] | undefined | null, primary_section_IDs: string[] | undefined | null, secondary_section_IDs: string[] | undefined | null): Promise<Schedule> {
export async function createSchedule(main_schedule: ScheduleInput): Promise<Schedule> {

  // const schedulePartsToCreate: minimumViableSchedule = { created_by: created_by, term: term }
  
  // schedulePartsToCreate.name = schedule_name ? schedule_name : undefined
  // schedulePartsToCreate.class_IDs = class_IDs ? class_IDs : undefined
  // schedulePartsToCreate.primary_section_IDs = primary_section_IDs ? primary_section_IDs : undefined
  // schedulePartsToCreate.secondary_section_IDs = secondary_section_IDs ? secondary_section_IDs : undefined
  // schedulePartsToCreate.is_public = is_public ? is_public : undefined

  const newSchedule = await ScheduleModel.create(main_schedule)
  // const newSchedule = await ScheduleModel.create({_id: newID, name: schedule_name, created_by: created_by, date_created: current_time, last_updated: current_time, term: term, public: is_public, class_IDs: class_IDs, section_IDs: section_IDs})
  return formatSchedule(newSchedule)
}



// update an existing schedule
export async function editSchedule(schedule_ID: string, main_schedule: ScheduleInput): Promise<Schedule> {
  
  // const schedulePartsToUpdate: partialSchedule = {}

  // schedulePartsToUpdate.term = term ? term : undefined
  // schedulePartsToUpdate.name = schedule_name ? schedule_name : undefined
  // schedulePartsToUpdate.class_IDs = class_IDs ? class_IDs : undefined
  // schedulePartsToUpdate.primary_section_IDs = primary_section_IDs ? primary_section_IDs : undefined
  // schedulePartsToUpdate.secondary_section_IDs = secondary_section_IDs ? secondary_section_IDs : undefined
  // schedulePartsToUpdate.is_public = is_public ? is_public : undefined

  const updatedSchedule = await ScheduleModel.findByIdAndUpdate(schedule_ID, main_schedule, {returnDocument: 'after'})
  if (!updatedSchedule) {
    throw new Error("Unable to update existing schedule")
  }
  return formatSchedule(updatedSchedule)
}

// update section selection in an existing schedule
export async function setSections(schedule_ID: string, section_IDs: string[]): Promise<Schedule> {
  const existingSchedule = await ScheduleModel.findByIdAndUpdate(schedule_ID, {section_IDs: section_IDs}, {returnDocument: 'after'})
  if (!existingSchedule) {
    throw new Error("Unable to update existing schedule's section selection")
  }
  return formatSchedule(existingSchedule)
}

// update class selection in an existing schedule
export async function setClasses(scheduleID: string, class_IDs: string[]): Promise<Schedule> {
  const existingSchedule = await ScheduleModel.findByIdAndUpdate(scheduleID, {class_IDs: class_IDs}, {returnDocument: 'after'})
  if (!existingSchedule) {
    throw new Error("Unable to update existing schedule's class selection")
  }
  return formatSchedule(existingSchedule)
}
