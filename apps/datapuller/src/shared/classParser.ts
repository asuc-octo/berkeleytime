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
  const courseNumber = original.course?.catalogNumber?.formatted;
  const year = parseInt(
    original.session?.term?.name?.split(" ")[0] || "0",
    10
  );
  const semester = original.session?.term?.name?.split(" ")[1] || "";
  const subject = original.course?.subjectArea?.code?.replaceAll(" ", "");
  const essentialFields = {
    courseId,
    termId,
    sessionId,
    number,
    courseNumber,
    year,
    semester,
    subject
  };

  const missingField = Object.entries(essentialFields).find(([_, value]) => !value);

  if (missingField) {
    throw new Error(`Missing essential class field: ${missingField[0]}`);
  }

  const newClass: IClassItem = {
    courseId,
    courseNumber,
    year,
    semester,
    subject,
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
