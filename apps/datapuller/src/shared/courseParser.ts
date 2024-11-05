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
  const subject = original.subjectArea?.code;

  if (!courseId || !number || !subject) {
    // Handle missing essential fields as needed
    throw new Error(`Course ${subject} ${number} is missing essential fields`);
  }

  // Top-level properties
  const title = original.title;
  const description = original.description;
  const academicCareer = original.academicCareer?.code;
  const primaryInstructionMethod = original.primaryInstructionMethod?.code;
  const gradingBasis = original.gradingBasis?.code;
  const status = original.status?.code;
  const fromDate = original.fromDate;
  const toDate = original.toDate;
  const finalExam = original.finalExam?.code;
  const academicGroup = original.academicGroup?.code;
  const academicOrganization = original.academicOrganization?.code;
  const printInCatalog = original.printInCatalog;
  const instructorAddConsentRequired = original.instructorAddConsentRequired;
  const instructorDropConsentRequired = original.instructorDropConsentRequired;
  const allowMultipleEnrollments = original.allowMultipleEnrollments;
  const spansMultipleTerms = original.spansMultipleTerms;
  const multipleTermNumber = original.multipleTermNumber;
  const anyFeesExist = original.anyFeesExist;
  const blindGrading = original.blindGrading;
  const workloadHours = original.workloadHours;
  const contactHours = original.contactHours;
  const formerDisplayName = original.formerDisplayName;
  const createdDate = original.createdDate;
  const updatedDate = original.updatedDate;

  // Repeatability
  const repeatability = original.repeatability;
  const repeatable = repeatability?.repeatable;
  const maxCredit = repeatability?.maxCredit;
  const maxCount = repeatability?.maxCount;

  // Preparation
  const preparation = original.preparation;
  const recommendedText = preparation?.recommendedText;
  const requiredText = preparation?.requiredText;
  const recommendedCourses = preparation?.recommendedCourses?.map(
    (c) => c.identifiers?.find((i) => i.type === "cs-course-id")?.id || ""
  );
  const requiredCourses = preparation?.requiredCourses?.map(
    (c) => c.identifiers?.find((i) => i.type === "cs-course-id")?.id || ""
  );

  // Grade Replacement
  const gradeReplacement = original.gradeReplacement;
  const gradeReplacementText = gradeReplacement?.gradeReplacementText;
  const gradeReplacementGroup = gradeReplacement?.gradeReplacementGroup;
  const gradeReplacementCourses =
    gradeReplacement?.gradeReplacementCourses?.map(
      (c) => c.identifiers?.find((i) => i.type === "cs-course-id")?.id || ""
    );

  // Cross Listing
  // TODO: verify
  const crossListing = original.crossListing?.courses;

  // Formats Offered
  const formatsOffered = original.formatsOffered;
  const formatsOfferedDescription = formatsOffered?.description;
  const typicallyOffered = formatsOffered?.typicallyOffered;
  const typicallyOfferedComments = typicallyOffered?.comments;
  const typicallyOfferedTerms = typicallyOffered?.terms;
  const formats = formatsOffered?.formats?.map((format) => ({
    termsAllowed: format.termsAllowed,
    description: format.description,
    components: format.components?.map((component) => ({
      instructionMethod: component.instructionMethod?.code,
      primary: component.primary,
      minContactHours: component.minContactHours,
      maxContactHours: component.maxContactHours,
      feesExist: component.feesExist,
    })),
  }));

  // Requirements Fulfilled
  const requirementsFulfilled = original.requirementsFulfilled
    ?.map((r) => r.code)
    .filter((code): code is string => code !== undefined);

  // Course Objectives and Student Learning Outcomes
  const courseObjectives = original.courseObjectives;
  const studentLearningOutcomes = original.studentLearningOutcomes;

  // Credit Restriction
  const creditRestriction = original.creditRestriction;
  const creditRestrictionText = creditRestriction?.restrictionText;
  const creditRestrictionCourses = creditRestriction?.restrictionCourses?.map(
    (c) => ({
      courseId:
        c.course?.identifiers?.find((i) => i.type === "cs-course-id")?.id || "",
      maxCreditPercentage: c.maxCreditPercentage,
    })
  );

  // Credit
  const credit = original.credit;
  const creditType = credit?.type;
  const creditValueDiscrete = credit?.value?.discrete?.units;
  const creditValueFixed = credit?.value?.fixed?.units;
  const creditValueRangeMinUnits = credit?.value?.range?.minUnits;
  const creditValueRangeMaxUnits = credit?.value?.range?.maxUnits;

  // Construct the newCourse object
  const newCourse: ICourseItem = {
    courseId,
    subject,
    number,
    title,
    description,
    academicCareer,
    primaryInstructionMethod,
    gradingBasis,
    status,
    fromDate,
    toDate,
    printInCatalog,
    finalExam,
    academicGroup,
    academicOrganization,
    instructorAddConsentRequired,
    instructorDropConsentRequired,
    allowMultipleEnrollments,
    spansMultipleTerms,
    multipleTermNumber,
    anyFeesExist,
    repeatability: {
      repeatable,
      maxCredit,
      maxCount,
    },
    preparation: {
      recommendedText,
      recommendedCourses,
      requiredText,
      requiredCourses,
    },
    gradeReplacement: {
      text: gradeReplacementText,
      group: gradeReplacementGroup,
      courses: gradeReplacementCourses,
    },
    crossListing,
    formatsOffered: {
      description: formatsOfferedDescription,
      typicallyOffered: {
        comments: typicallyOfferedComments,
        terms: typicallyOfferedTerms,
      },
      formats,
    },
    requirementsFulfilled,
    courseObjectives,
    studentLearningOutcomes,
    creditRestriction: {
      text: creditRestrictionText,
      courses: creditRestrictionCourses,
    },
    blindGrading,
    credit: {
      type: creditType,
      value: {
        discrete: creditValueDiscrete,
        fixed: creditValueFixed,
        range: {
          minUnits: creditValueRangeMinUnits,
          maxUnits: creditValueRangeMaxUnits,
        },
      },
    },
    workloadHours,
    contactHours,
    formerDisplayName,
    createdDate,
    updatedDate,
  };

  return newCourse;
}
