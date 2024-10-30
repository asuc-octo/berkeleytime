import { IClassItem } from "@repo/common";
import { Class } from "@repo/sis-api/classes";

import { getRequiredField } from "./utils";

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
  const courseId = getRequiredField(
    original.course?.identifiers?.find((i) => i.type == "cs-course-id")?.id,
    "courseId",
    ""
  );

  const newClass: IClassItem = {
    courseId,
    termId: getRequiredField(original.session?.term?.id, "session.term.id", ""),
    sessionId: getRequiredField(original.session?.id, "session.id", ""),
    number: getRequiredField(original.number, "number", ""),
    offeringNumber: getRequiredField(
      original.offeringNumber,
      "offeringNumber",
      0
    ),
    title: getRequiredField(original.classTitle, "classTitle", ""),
    description: getRequiredField(
      original.classDescription,
      "classDescription",
      ""
    ),
    allowedUnits: {
      minimum: getRequiredField(
        original.allowedUnits?.minimum,
        "allowedUnits.minimum",
        0
      ),
      maximum: getRequiredField(
        original.allowedUnits?.maximum,
        "allowedUnits.maximum",
        0
      ),
      forAcademicProgress: getRequiredField(
        original.allowedUnits?.forAcademicProgress,
        "allowedUnits.forAcademicProgress",
        0
      ),
      forFinancialAid: getRequiredField(
        original.allowedUnits?.forFinancialAid,
        "allowedUnits.forFinancialAid",
        0
      ),
    },
    gradingBasis: getRequiredField(
      original.gradingBasis?.code,
      "gradingBasis.code",
      ""
    ),
    status: getRequiredField(original.status?.code, "status.code", ""),
    finalExam: getRequiredField(original.finalExam?.code, "finalExam.code", ""),
    instructionMode: getRequiredField(
      original.instructionMode?.code,
      "instructionMode.code",
      ""
    ),
    anyPrintInScheduleOfClasses: getRequiredField(
      original.anyPrintInScheduleOfClasses,
      "anyPrintInScheduleOfClasses",
      false
    ),
    contactHours: getRequiredField(original.contactHours, "contactHours", 0),
    blindGrading: getRequiredField(
      original.blindGrading,
      "blindGrading",
      false
    ),
    requirementDesignation: getRequiredField(
      original.requirementDesignation?.code,
      "requirementDesignation.code",
      ""
    ),
    // TODO: fix with proper requisites
    requisites: getRequiredField(
      original.requisites?.formalDescription,
      "requisites.formalDescription",
      ""
    ),
  };

  return newClass;
}
