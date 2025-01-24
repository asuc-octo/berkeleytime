import { Logger } from "tslog";

import { IClassItem } from "@repo/common";
import { Class, ClassesAPI } from "@repo/sis-api/classes";

import { fetchPaginatedData } from "./api/sis-api";

// Include relevant fields missing from the automatically generated type
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

export const formatClass = (input: CombinedClass) => {
  const courseId = input.course?.identifiers?.find(
    (i) => i.type === "cs-course-id"
  )?.id;

  const termId = input.session?.term?.id;
  const sessionId = input.session?.id;
  const number = input.number;
  const courseNumber = input.course?.catalogNumber?.formatted;
  const year = input.session?.term?.name?.split(" ")[0];
  const semester = input.session?.term?.name?.split(" ")[1];
  const subject = input.course?.subjectArea?.code?.replaceAll(" ", "");

  const essentialFields = {
    courseId,
    termId,
    sessionId,
    number,
    courseNumber,
    year,
    semester,
    subject,
  };

  const missingField = Object.keys(essentialFields).find(
    (value) => !essentialFields[value as keyof typeof essentialFields]
  );

  if (missingField)
    throw new Error(`Missing essential class field: ${missingField[0]}`);

  const output: IClassItem = {
    courseId: courseId!,
    courseNumber: courseNumber!,
    year: parseInt(year!),
    semester: semester!,
    subject: subject!,
    termId: termId!,
    sessionId: sessionId!,
    number: number!,
    offeringNumber: input.offeringNumber,
    title: input.classTitle,
    description: input.classDescription,
    allowedUnits: input.allowedUnits,
    gradingBasis: input.gradingBasis?.code,
    status: input.status?.code,
    finalExam: input.finalExam?.code,
    instructionMode: input.instructionMode?.code,
    anyPrintInScheduleOfClasses: input.anyPrintInScheduleOfClasses,
    contactHours: input.contactHours,
    blindGrading: input.blindGrading,
    requirementDesignation: input.requirementDesignation?.code,
    requisites: input.requisites?.formalDescription,
  };

  return output;
};

export const getClasses = async (
  logger: Logger<unknown>,
  id: string,
  key: string,
  termIds?: string[]
) => {
  const classesAPI = new ClassesAPI();

  const courses = await fetchPaginatedData<IClassItem, CombinedClass>(
    logger,
    classesAPI.v1,
    termIds || null,
    "getClasses",
    {
      app_id: id,
      app_key: key,
    },
    (data) => data.apiResponse.response.classes || [],
    formatClass,
    "classes"
  );

  return courses;
};
