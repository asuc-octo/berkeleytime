import { ScheduleModel, TermModel } from "@repo/common";

import {
  CreateScheduleInput,
  UpdateScheduleInput,
} from "../../generated-types/graphql";
import { formatSchedule } from "./formatter";

export const getSchedules = async (context: any) => {
  if (!context.user._id) throw new Error("Unauthorized");

  const schedules = await ScheduleModel.find({
    createdBy: context.user._id,
  });

  return await Promise.all(schedules.map(formatSchedule));
};

export const getSchedule = async (context: any, id: string) => {
  const schedule = await ScheduleModel.findOne({
    _id: id,
    $or: [{ public: true }, { createdBy: context.user._id }],
  });

  if (!schedule) throw new Error("Not found");

  return await formatSchedule(schedule);
};

export const deleteSchedule = async (context: any, id: string) => {
  const schedule = await ScheduleModel.findOneAndDelete({
    _id: id,
    createdBy: context.user._id,
  });

  if (!schedule) throw new Error("Not found");

  return schedule._id.toString();
};

export const createSchedule = async (
  context: any,
  input: CreateScheduleInput
) => {
  if (!context.user._id) throw new Error("Unauthorized");

  const term = await TermModel.findOne({
    name: `${input.year} ${input.semester}`,
  });

  if (!term) throw new Error("Invalid term");

  const schedule = await ScheduleModel.create({
    ...input,
    createdBy: context.user._id,
  });

  return await formatSchedule(schedule);
};

export const updateSchedule = async (
  context: any,
  id: string,
  input: UpdateScheduleInput
) => {
  if (!context.user._id) throw new Error("Unauthorized");

  // Filter out duplicates
  if (input.classes) {
    input.classes = input.classes.filter(
      (selectedClass, index) =>
        selectedClass &&
        index ===
          input.classes?.findIndex(
            (currentClass) =>
              currentClass &&
              currentClass.subject === selectedClass.subject &&
              currentClass.courseNumber === selectedClass.courseNumber &&
              currentClass.number === selectedClass.number
          )
    );
  }

  const schedule = await ScheduleModel.findOneAndUpdate(
    { _id: id, createdBy: context.user._id },
    input,
    { new: true }
  );

  if (!schedule) throw new Error("Not found");

  return await formatSchedule(schedule);
};
