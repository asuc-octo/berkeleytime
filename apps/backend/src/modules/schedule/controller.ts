import {
  ClassModel,
  IClassItem,
  ScheduleModel,
  SectionModel,
  TermModel
} from "@repo/common";

import {
  CreateScheduleInput,
  SelectedClassInput,
  Semester,
  UpdateScheduleInput,
} from "../../generated-types/graphql";

import {getSecondarySections} from "../class/controller"
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

  const term = await TermModel.findOne({
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
    } as ScheduleModule.SelectedClass);
  }

  return classes;
};


// export type SimpleTimeBlock = {
//   startTime: string;
//   endTime: string;
//   days: string[];
// };

// const convertBooleanDaysToStrings = (
//   boolDays?: boolean[] | null
// ): string[] => {
//   if (!boolDays) return [];
//   const DAY_MAP = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
//   return boolDays
//     .map((val, i) => (val ? DAY_MAP[i] : null))
//     .filter((v): v is string => v !== null);
// };

// export const extractTimeBlocks = (
//   classes: ScheduleModule.SelectedClass[]
// ): SimpleTimeBlock[] => {
//   return classes.flatMap((sc) =>
//     sc.selectedSections.flatMap((section) =>
//       (section.meetings || []).map((m) => ({
//         startTime: m.startTime,
//         endTime: m.endTime,
//         days: convertBooleanDaysToStrings(m.days), 
//       }))
//     )
//   );
// };

// const parseTimeToHour = (timeStr: string): number => {
//   const [time, meridiem] = timeStr.trim().split(" ");
//   let [hour, min] = time.split(":").map(Number);
//   if (meridiem === "PM" && hour !== 12) hour += 12;
//   if (meridiem === "AM" && hour === 12) hour = 0;
//   return hour + min / 60;
// };

// const blocksConflict = (a: SimpleTimeBlock, b: SimpleTimeBlock): boolean => {
//   const daysA = new Set(a.days);
//   const daysB = new Set(b.days);
//   const hasOverlapDay = [...daysA].some((d) => daysB.has(d));
//   if (!hasOverlapDay) return false;

//   const aStart = parseTimeToHour(a.startTime);
//   const aEnd = parseTimeToHour(a.endTime);
//   const bStart = parseTimeToHour(b.startTime);
//   const bEnd = parseTimeToHour(b.endTime);

//   return !(aEnd <= bStart || aStart >= bEnd);
// };

// export const filterNonConflictingSections = (
//   sections: ClassModule.Section[],
//   existingTimeBlocks: SimpleTimeBlock[]
// ): ClassModule.Section[] => {
//   return sections.filter((section) =>
//     (section.meetings || []).every((m) => {
//       const block = {
//         startTime: m.startTime,
//         endTime: m.endTime,
//         days: convertBooleanDaysToStrings(m.days),
//       };

//       return !existingTimeBlocks.some((b) => blocksConflict(block, b));
//     })
//   );
// };


// export const getFilteredSecondarySections = async (
//   year: number,
//   semester: Semester,
//   sessionId: string,
//   subject: string,
//   courseNumber: string,
//   number: string,
//   selectedClasses: SelectedClassInput[],
//   filterConflicts: boolean
// ) => {
//   const secondarySections = await getSecondarySections(
//     year, semester, sessionId, subject, courseNumber, number
//   );
  
//   if (!filterConflicts) {
//     return secondarySections.map((s) => formatSection(s as ISectionItem));
//   }

//   const selected = await getClasses(year, semester, sessionId, selectedClasses);
//   const timeBlocks = extractTimeBlocks(selected);

//   const filtered = filterNonConflictingSections(
//     secondarySections as unknown as ClassModule.Section[],
//     timeBlocks
//   );

//   return filtered.map((s) => formatSection(s as ISectionItem)) as ScheduleModule.Section[];

// };






