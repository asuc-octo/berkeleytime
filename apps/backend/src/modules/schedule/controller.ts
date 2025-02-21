import {
  IClassItem,
  NewClassModel,
  NewSectionModel,
  NewTermModel,
  ScheduleModel,
} from "@repo/common";

import {
  CreateScheduleInput,
  SelectedClassInput,
  Semester,
  UpdateScheduleInput,
} from "../../generated-types/graphql";
import { formatClass } from "../class/formatter";
import { ClassModule } from "../class/generated-types/module-types";
import { formatSchedule } from "./formatter";
import { ScheduleModule } from "./generated-types/module-types";

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

  const term = await NewTermModel.findOne({
    name: `${input.year} ${input.semester}`,
  })
    .select({ _id: 1 })
    .lean();

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

export const getClasses = async (
  year: number,
  semester: Semester,
  sessionId: string,
  selectedClasses: SelectedClassInput[]
) => {
  const classes = [];

  for (const selectedClass of selectedClasses) {
    const _class = await NewClassModel.findOne({
      year,
      semester,
      sessionId: sessionId ? sessionId : "1",
      subject: selectedClass.subject,
      courseNumber: selectedClass.courseNumber,
      number: selectedClass.number,
    }).lean();

    if (!_class) continue;

    const sections = await NewSectionModel.find({
      year,
      semester,
      sessionId: sessionId ? sessionId : "1",
      id: { $in: selectedClass.sectionIds },
    }).lean();

    classes.push({
      class: formatClass(_class as IClassItem) as unknown as ClassModule.Class,
      selectedSections: sections as unknown as ClassModule.Section[],
    } as ScheduleModule.SelectedClass);
  }

  return classes;
};
