import { Logger } from "tslog";

import { ICourseItem } from "@repo/common";
import { Course as ClassCourse } from "@repo/sis-api/classes";
import { Course, CoursesAPI } from "@repo/sis-api/courses";

import { fetchPaginatedData } from "./api/sis-api";

// Include relevant fields missing from the automically generated type
type CombinedCourse = Course & {
  gradeReplacement: ClassCourse["gradeReplacement"];
};

const filterCourse = (input: CombinedCourse): boolean => {
  return input.status?.code === "ACTIVE";
};

const formatCourse = (input: CombinedCourse) => {
  const courseId = input.identifiers?.find(
    (i) => i.type === "cs-course-id"
  )?.id;

  const number = input.catalogNumber?.formatted;
  const subject = input.subjectArea?.code?.replaceAll(" ", "");

  const essentialFields = {
    courseId,
    number,
    subject,
  };

  const missingField = Object.keys(essentialFields).find(
    (value) => !essentialFields[value as keyof typeof essentialFields]
  );

  if (missingField)
    throw new Error(`Missing essential course field: ${missingField[0]}`);

  const output: ICourseItem = {
    courseId: courseId!,
    subject: subject!,
    number: number!,
    title: input.title,
    description: input.description,
    academicCareer: input.academicCareer?.code,
    primaryInstructionMethod: input.primaryInstructionMethod?.code,
    gradingBasis: input.gradingBasis?.code,
    status: input.status?.code,
    fromDate: input.fromDate,
    toDate: input.toDate,
    printInCatalog: input.printInCatalog,
    finalExam: input.finalExam?.code,
    academicGroup: input.academicGroup?.code,
    academicOrganization: input.academicOrganization?.code,
    instructorAddConsentRequired: input.instructorAddConsentRequired,
    instructorDropConsentRequired: input.instructorDropConsentRequired,
    allowMultipleEnrollments: input.allowMultipleEnrollments,
    spansMultipleTerms: input.spansMultipleTerms,
    multipleTermNumber: input.multipleTermNumber,
    anyFeesExist: input.anyFeesExist,
    repeatability: {
      repeatable: input.repeatability?.repeatable,
      maxCredit: input.repeatability?.maxCredit,
      maxCount: input.repeatability?.maxCount,
    },
    preparation: {
      recommendedText: input.preparation?.recommendedText,
      recommendedCourses: input.preparation?.recommendedCourses?.map(
        (c) => c.identifiers?.find((i) => i.type === "cs-course-id")?.id || ""
      ),
      requiredText: input.preparation?.requiredText,
      requiredCourses: input.preparation?.requiredCourses?.map(
        (c) => c.identifiers?.find((i) => i.type === "cs-course-id")?.id || ""
      ),
    },
    gradeReplacement: {
      text: input.gradeReplacement?.gradeReplacementText,
      group: input.gradeReplacement?.gradeReplacementGroup,
      courses: input.gradeReplacement?.gradeReplacementCourses?.map(
        (c) => c.identifiers?.find((i) => i.type === "cs-course-id")?.id || ""
      ),
    },
    crossListing: input.crossListing?.courses,
    formatsOffered: {
      description: input.formatsOffered?.description,
      typicallyOffered: {
        comments: input.formatsOffered?.typicallyOffered?.comments,
        terms: input.formatsOffered?.typicallyOffered?.terms,
      },
      formats: input.formatsOffered?.formats?.map((format) => ({
        termsAllowed: format.termsAllowed,
        description: format.description,
        components: format.components?.map((component) => ({
          instructionMethod: component.instructionMethod?.code,
          primary: component.primary,
          minContactHours: component.minContactHours,
          maxContactHours: component.maxContactHours,
          feesExist: component.feesExist,
        })),
      })),
    },
    requirementsFulfilled: input.requirementsFulfilled
      ?.map((r) => r.code)
      .filter((code): code is string => code !== undefined),
    courseObjectives: input.courseObjectives,
    studentLearningOutcomes: input.studentLearningOutcomes,
    creditRestriction: {
      text: input.creditRestriction?.restrictionText,
      courses: input.creditRestriction?.restrictionCourses?.map((c) => ({
        courseId:
          c.course?.identifiers?.find((i) => i.type === "cs-course-id")?.id ||
          "",
        maxCreditPercentage: c.maxCreditPercentage,
      })),
    },
    blindGrading: input.blindGrading,
    credit: {
      type: input.credit?.type,
      value: {
        discrete: input.credit?.value?.discrete?.units,
        fixed: input.credit?.value?.fixed?.units,
        range: {
          minUnits: input.credit?.value?.range?.minUnits,
          maxUnits: input.credit?.value?.range?.maxUnits,
        },
      },
    },
    workloadHours: input.workloadHours,
    contactHours: input.contactHours,
    formerDisplayName: input.formerDisplayName,
    createdDate: input.createdDate,
    updatedDate: input.updatedDate,
  };

  return output;
};

export const getCourses = async (
  logger: Logger<unknown>,
  id: string,
  key: string
) => {
  const coursesAPI = new CoursesAPI();

  const courses = await fetchPaginatedData<ICourseItem, CombinedCourse>(
    logger,
    coursesAPI.v4,
    null,
    "findCourseCollectionUsingGet",
    {
      app_id: id,
      app_key: key,
    },
    (data) => data.apiResponse.response.courses || [],
    filterCourse,
    formatCourse
  );

  return courses;
};
