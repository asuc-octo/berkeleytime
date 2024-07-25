import { omitBy } from "lodash";

import { ScheduleModel } from "@repo/common";

import {
  CustomEventInput,
  Schedule,
  ScheduleInput,
  SelectedCourseInput,
} from "../../generated-types/graphql";
import { formatSchedule } from "./formatter";

// get the schedules for a user
export async function getSchedulesByUser(
  context: any
): Promise<Schedule[] | null> {
  if (!context.user._id) throw new Error("User is not authenticated");

  const userSchedules = await ScheduleModel.find({
    created_by: context.user._id,
  });
  if (userSchedules.length == 0) {
    throw new Error("No schedules found for this user");
  }
  return userSchedules.map(formatSchedule);
}

// get the schedule for a user and a specific term
export async function getScheduleByID(id: string): Promise<Schedule> {
  const scheduleFromID = await ScheduleModel.findById({ _id: id });
  if (!scheduleFromID) {
    throw new Error("No schedules found with this ID");
  }
  return formatSchedule(scheduleFromID);
}

// delete a schedule specified by ObjectID
export async function removeSchedule(scheduleID: string): Promise<string> {
  const deletedSchedule = await ScheduleModel.findByIdAndDelete(scheduleID);
  if (!deletedSchedule) {
    throw new Error("Schedule deletion failed");
  }
  return scheduleID;
}

function removeNullEventVals(custom_event: CustomEventInput) {
  for (const key in custom_event) {
    if (custom_event[key as keyof CustomEventInput] === null) {
      delete custom_event[key as keyof CustomEventInput];
    }
  }
}

// create a new schedule
export async function createSchedule(
  main_schedule: ScheduleInput,
  context: any
): Promise<Schedule> {
  if (!context.user._id) throw new Error("User is not authenticated");
  if (main_schedule.custom_events) {
    main_schedule.custom_events.forEach(removeNullEventVals);
  }
  const non_null_schedule = omitBy(main_schedule, (value) => value == null);
  const newSchedule = await ScheduleModel.create({
    ...non_null_schedule,
    created_by: context.user._id,
  });
  return formatSchedule(newSchedule);
}

// update an existing schedule
export async function editSchedule(
  schedule_ID: string,
  main_schedule: ScheduleInput
): Promise<Schedule> {
  if (main_schedule.custom_events) {
    main_schedule.custom_events.forEach(removeNullEventVals);
  }
  const non_null_schedule = omitBy(main_schedule, (value) => value == null);
  const updatedSchedule = await ScheduleModel.findByIdAndUpdate(
    schedule_ID,
    non_null_schedule,
    { returnDocument: "after" }
  );
  if (!updatedSchedule) {
    throw new Error("Unable to update existing schedule");
  }
  return formatSchedule(updatedSchedule);
}

// update class selection in an existing schedule
export async function setClasses(
  scheduleID: string,
  courses: SelectedCourseInput[]
): Promise<Schedule> {
  const existingSchedule = await ScheduleModel.findByIdAndUpdate(
    scheduleID,
    { courses: courses },
    { returnDocument: "after" }
  );
  if (!existingSchedule) {
    throw new Error("Unable to update existing schedule's class selection");
  }
  return formatSchedule(existingSchedule);
}
