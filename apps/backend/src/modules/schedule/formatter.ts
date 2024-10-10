import { ClassModel, ScheduleType } from "@repo/common";

import { formatClass } from "../class/formatter";
import { ClassModule } from "../class/generated-types/module-types";
import { ScheduleModule } from "./generated-types/module-types";

export type IntermediateSchedule = Omit<ScheduleModule.Schedule, "term"> & {
  term: null;
};

export const formatSchedule = async (schedule: ScheduleType) => {
  const classes = [];

  for (const selectedClass of schedule.classes) {
    const _class = await ClassModel.findOne({
      number: selectedClass.classNumber,
      "course.subjectArea.code": selectedClass.subject,
      "course.catalogNumber.formatted": selectedClass.courseNumber,
      "session.term.name": `${schedule.term.year} ${schedule.term.semester}`,
    }).lean();

    if (!_class) continue;

    classes.push({
      class: formatClass(_class) as unknown as ClassModule.Class,
      selectedSections: selectedClass.sections,
    });
  }

  return {
    _id: schedule._id as string,
    name: schedule.name,
    createdBy: schedule.createdBy,
    public: schedule.public,
    classes,
    year: schedule.term.year,
    semester: schedule.term.semester,
    term: null,
    events: schedule.events,
  } as IntermediateSchedule;
};
