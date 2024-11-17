import { ICourseItem } from "@repo/common";
import { Course as ClassCourse } from "@repo/sis-api/classes";
import { Course } from "@repo/sis-api/courses";

// Include other relevant fields missing in the auto-generated Course type
export type CombinedCourse = Course & {
  gradeReplacement: ClassCourse["gradeReplacement"];
};

export default function mapCourseToNewCourse(
  original: CombinedCourse
): ICourseItem {
  const courseId = original.identifiers?.find(
    (i) => i.type === "cs-course-id"
  )?.id;
  const number = original.catalogNumber?.formatted;
  const subject = original.subjectArea?.code?.replaceAll(" ", "");
  const essentialFields = { courseId, number, subject };

  const missingField = Object.entries(essentialFields).find(
    ([_, value]) => !value
  );
  if (missingField) {
    throw new Error(
      `Course ${subject} ${number} is missing essential field: ${missingField[0]}`
    );
  }

  const newCourse: ICourseItem = {
    courseId: courseId!,
    subject: subject!,
    number: number!,
    title: original.title,
    description: original.description,
    academicCareer: original.academicCareer?.code,
    primaryInstructionMethod: original.primaryInstructionMethod?.code,
    gradingBasis: original.gradingBasis?.code,
    status: original.status?.code,
    fromDate: original.fromDate,
    toDate: original.toDate,
    printInCatalog: original.printInCatalog,
    finalExam: original.finalExam?.code,
    academicGroup: original.academicGroup?.code,
    academicOrganization: original.academicOrganization?.code,
    instructorAddConsentRequired: original.instructorAddConsentRequired,
    instructorDropConsentRequired: original.instructorDropConsentRequired,
    allowMultipleEnrollments: original.allowMultipleEnrollments,
    spansMultipleTerms: original.spansMultipleTerms,
    multipleTermNumber: original.multipleTermNumber,
    anyFeesExist: original.anyFeesExist,
    repeatability: {
      repeatable: original.repeatability?.repeatable,
      maxCredit: original.repeatability?.maxCredit,
      maxCount: original.repeatability?.maxCount,
    },
    preparation: {
      recommendedText: original.preparation?.recommendedText,
      recommendedCourses: original.preparation?.recommendedCourses?.map(
        (c) => c.identifiers?.find((i) => i.type === "cs-course-id")?.id || ""
      ),
      requiredText: original.preparation?.requiredText,
      requiredCourses: original.preparation?.requiredCourses?.map(
        (c) => c.identifiers?.find((i) => i.type === "cs-course-id")?.id || ""
      ),
    },
    gradeReplacement: {
      text: original.gradeReplacement?.gradeReplacementText,
      group: original.gradeReplacement?.gradeReplacementGroup,
      courses: original.gradeReplacement?.gradeReplacementCourses?.map(
        (c) => c.identifiers?.find((i) => i.type === "cs-course-id")?.id || ""
      ),
    },
    crossListing: original.crossListing?.courses,
    formatsOffered: {
      description: original.formatsOffered?.description,
      typicallyOffered: {
        comments: original.formatsOffered?.typicallyOffered?.comments,
        terms: original.formatsOffered?.typicallyOffered?.terms,
      },
      formats: original.formatsOffered?.formats?.map((format) => ({
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
    requirementsFulfilled: original.requirementsFulfilled
      ?.map((r) => r.code)
      .filter((code): code is string => code !== undefined),
    courseObjectives: original.courseObjectives,
    studentLearningOutcomes: original.studentLearningOutcomes,
    creditRestriction: {
      text: original.creditRestriction?.restrictionText,
      courses: original.creditRestriction?.restrictionCourses?.map((c) => ({
        courseId:
          c.course?.identifiers?.find((i) => i.type === "cs-course-id")?.id ||
          "",
        maxCreditPercentage: c.maxCreditPercentage,
      })),
    },
    blindGrading: original.blindGrading,
    credit: {
      type: original.credit?.type,
      value: {
        discrete: original.credit?.value?.discrete?.units,
        fixed: original.credit?.value?.fixed?.units,
        range: {
          minUnits: original.credit?.value?.range?.minUnits,
          maxUnits: original.credit?.value?.range?.maxUnits,
        },
      },
    },
    workloadHours: original.workloadHours,
    contactHours: original.contactHours,
    formerDisplayName: original.formerDisplayName,
    createdDate: original.createdDate,
    updatedDate: original.updatedDate,
  };

  return newCourse;
}
