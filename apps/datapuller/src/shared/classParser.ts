import { IClassItem } from "@repo/common";
import { Class } from "@repo/sis-api/classes";

// Include other relevant fields missing in the auto-generated Class type
export type CombinedClass = Class & {
  requisites: {
    code: {
      type: string;
    };
    description: {
      type: string;
    };
    formalDescription: string;
    active: boolean;
    fromDate: Date;
    toDate: Date;
  };
};

export default function mapClassToNewClass(
  original: CombinedClass
): IClassItem {
  const courseId = original.course?.identifiers?.find(
    (i) => i.type === "cs-course-id"
  )?.id;
  const termId = original.session?.term?.id;
  const sessionId = original.session?.id;
  const number = original.number;

  if (!courseId || !termId || !sessionId || !number) {
    throw new Error("Missing essential class fields");
  }

  const newClass: IClassItem = {
    courseId,
    termId,
    sessionId,
    number,
    offeringNumber: original.offeringNumber,
    title: original.classTitle,
    description: original.classDescription,
    allowedUnits: original.allowedUnits,
    gradingBasis: original.gradingBasis?.code,
    status: original.status?.code,
    finalExam: original.finalExam?.code,
    instructionMode: original.instructionMode?.code,
    anyPrintInScheduleOfClasses: original.anyPrintInScheduleOfClasses,
    contactHours: original.contactHours,
    blindGrading: original.blindGrading,
    requirementDesignation: original.requirementDesignation?.code,
    requisites: original.requisites?.formalDescription,
  };

  return newClass;
}
