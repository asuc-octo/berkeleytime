import {
  ClassModel,
  IClassItem,
  ScheduleModel,
  SectionModel,
  TermModel,
} from "@repo/common/models";

import {
  CreateScheduleInput,
  SelectedClassInput,
  Semester,
  UpdateScheduleInput,
} from "../../generated-types/graphql";
import { RequestContext } from "../../types/request-context";
import { formatClass } from "../class/formatter";
import { ClassModule } from "../class/generated-types/module-types";
import { formatSchedule } from "./formatter";
import { ScheduleModule } from "./generated-types/module-types";

export const getSchedules = async (context: RequestContext) => {
  if (!context.user?._id) throw new Error("Unauthorized");
  const userId = context.user._id;

  const schedules = await ScheduleModel.find({
    createdBy: userId,
  });

  return await Promise.all(schedules.map(formatSchedule));
};

export const getSchedule = async (context: RequestContext, id: string) => {
  const userId = context.user?._id;
  const schedule = await ScheduleModel.findOne({
    _id: id,
    $or: [{ public: true }, ...(userId ? [{ createdBy: userId }] : [])],
  });

  if (!schedule) throw new Error("Not found");

  return await formatSchedule(schedule);
};

export const deleteSchedule = async (context: RequestContext, id: string) => {
  if (!context.user?._id) throw new Error("Unauthorized");
  const userId = context.user._id;
  const schedule = await ScheduleModel.findOneAndDelete({
    _id: id,
    createdBy: userId,
  });

  if (!schedule) throw new Error("Not found");

  return schedule._id.toString();
};

export const createSchedule = async (
  context: RequestContext,
  input: CreateScheduleInput
) => {
  if (!context.user?._id) throw new Error("Unauthorized");
  const userId = context.user._id;

  const term = await TermModel.findOne({
    name: `${input.year} ${input.semester}`,
  })
    .select({ _id: 1 })
    .lean();

  if (!term) throw new Error("Invalid term");

  const schedule = await ScheduleModel.create({
    ...input,
    createdBy: userId,
  });

  return await formatSchedule(schedule);
};

export const updateSchedule = async (
  context: RequestContext,
  id: string,
  input: UpdateScheduleInput
) => {
  if (!context.user?._id) throw new Error("Unauthorized");
  const userId = context.user._id;

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
    { _id: id, createdBy: userId },
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
    const _class = await ClassModel.findOne({
      year,
      semester,
      sessionId: sessionId ? sessionId : "1",
      subject: selectedClass.subject,
      courseNumber: selectedClass.courseNumber,
      number: selectedClass.number,
    }).lean();

    if (!_class) continue;

    const sections = await SectionModel.find({
      termId: _class.termId,
      sessionId: _class.sessionId,
      sectionId: { $in: selectedClass.sectionIds },
    }).lean();

    classes.push({
      class: formatClass(_class as IClassItem) as unknown as ClassModule.Class,
      selectedSections: sections as unknown as ClassModule.Section[],
      color: selectedClass.color,
      hidden: selectedClass.hidden,
      locked: selectedClass.locked,
      blockedSections: selectedClass.blockedSections,
      lockedComponents: selectedClass.lockedComponents,
    } as ScheduleModule.SelectedClass);
  }

  return classes;
};
