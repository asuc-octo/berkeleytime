import { ClassModel, ScheduleType } from "@repo/common";

import { formatClass } from "../catalog/formatter";
import { ScheduleModule } from "./generated-types/module-types";

export const formatSchedule = async (schedule: ScheduleType) => {
  const classes = [];

  for (const selectedClass of schedule.classes) {
    const _class = await ClassModel.findOne({
      number: selectedClass.classNumber,
      "course.subjectArea.code": selectedClass.subject,
      "course.catalogNumber.formatted": selectedClass.courseNumber,
      "session.term.name": `${schedule.term.year} ${schedule.term.semester}`,
    });

    if (!_class) continue;

    classes.push({
      class: formatClass(_class),
      selectedSections: selectedClass.sections,
    });
  }

  return {
    _id: schedule._id as string,
    name: schedule.name,
    createdBy: schedule.createdBy,
    public: schedule.public,
    classes,
    term: schedule.term,
    events: schedule.events,
  } as ScheduleModule.Schedule;
};
