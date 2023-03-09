import { formatSchedule } from "./formatter";
import { Schedule } from "../../generated-types/graphql";
import { ScheduleModel } from "./model";
import { ObjectID } from "bson";
import { isBoolean } from "lodash";
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
  return formatSchedule(scheduleFromID as any)
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
export async function createSchedule(created_by: string, term: string, schedule_name: string | undefined | null, is_public: boolean, class_IDs: string[] | undefined | null, primary_section_IDs: string[], secondary_section_IDs: string[]): Promise<Schedule> {
  
  const newID = new ObjectID()

  const schedulePartsToCreate: minimumViableSchedule = { _id: newID, created_by: created_by, term: term }
  if (schedule_name) {
    schedulePartsToCreate.name = schedule_name
  }

  if (class_IDs) {
    schedulePartsToCreate.class_IDs = class_IDs
  }

  if (primary_section_IDs) {
    schedulePartsToCreate.primary_section_IDs = primary_section_IDs
  }

  if (secondary_section_IDs) {
    schedulePartsToCreate.secondary_section_IDs = secondary_section_IDs
  }

  schedulePartsToCreate.public = is_public

  const newSchedule = await ScheduleModel.create(schedulePartsToCreate)
  // const newSchedule = await ScheduleModel.create({_id: newID, name: schedule_name, created_by: created_by, date_created: current_time, last_updated: current_time, term: term, public: is_public, class_IDs: class_IDs, section_IDs: section_IDs})
  return formatSchedule(newSchedule as any)
}



// update an existing schedule
export async function editSchedule(schedule_ID: string, created_by: string | undefined | null, term: string | undefined | null, schedule_name: string | undefined | null, class_IDs: string[], primary_section_IDs: string[], secondary_section_IDs: string[], is_public?: boolean | undefined | null): Promise<Schedule> {
  
  const schedulePartsToUpdate: partialSchedule = {}

  if (term) {
    schedulePartsToUpdate.term = term
  }
  if (schedule_name) {
    schedulePartsToUpdate.name = schedule_name
  }
  if (class_IDs) {
    schedulePartsToUpdate.class_IDs = class_IDs
  }
  if (primary_section_IDs) {
    schedulePartsToUpdate.primary_section_IDs = primary_section_IDs
  }

  if (secondary_section_IDs) {
    schedulePartsToUpdate.secondary_section_IDs = secondary_section_IDs
  }

  if (isBoolean(is_public)) {
    schedulePartsToUpdate.public = is_public
  }

  const updatedSchedule = await ScheduleModel.findByIdAndUpdate(schedule_ID, schedulePartsToUpdate, {returnDocument: 'after'})

  return formatSchedule(updatedSchedule as any)
}

// update section selection in an existing schedule
export async function setSections(schedule_ID: string, section_IDs: string[]): Promise<Schedule> {
  const existingSchedule = await ScheduleModel.findByIdAndUpdate(schedule_ID, {section_IDs: section_IDs}, {returnDocument: 'after'})
  if (!existingSchedule) {
    throw new Error("Unable to update existing schedule's section selection")
  }
  return formatSchedule(existingSchedule as any)
}

// update class selection in an existing schedule
export async function setClasses(scheduleID: string, class_IDs: string[]): Promise<Schedule> {
  const existingSchedule = await ScheduleModel.findByIdAndUpdate(scheduleID, {class_IDs: class_IDs}, {returnDocument: 'after'})
  if (!existingSchedule) {
    throw new Error("Unable to update existing schedule's class selection")
  }
  return formatSchedule(existingSchedule as any)
}
