import { ICourseItem } from "@repo/common";
import { Course as ClassCourse } from "@repo/sis-api/classes";
import { Course } from "@repo/sis-api/courses";

import { getRequiredField } from "./utils";

// Include other relevant fields missing in the auto-generated Course type
export type CombinedCourse = Course & {
  gradeReplacement: ClassCourse["gradeReplacement"];
};

export default function mapCourseToNewCourse(
  original: CombinedCourse
): ICourseItem {
  const courseId = getRequiredField(
    original.identifiers?.find((i) => i.type == "cs-course-id")?.id,
    "courseId",
    ""
  );

  const newCourse: ICourseItem = {
    courseId,
    subject: getRequiredField(
      original.subjectArea?.code,
      "subjectArea.code",
      ""
    ),
    number: getRequiredField(
      original.catalogNumber?.formatted,
      "catalogNumber.formatted",
      ""
    ),
    title: getRequiredField(original.title, "title", ""),
    description: getRequiredField(original.description, "description", ""),
    academicCareer: getRequiredField(
      original.academicCareer?.code,
      "academicCareer.code",
      ""
    ),
    primaryInstructionMethod: getRequiredField(
      original.primaryInstructionMethod?.code,
      "primaryInstructionMethod.code",
      ""
    ),
    gradingBasis: getRequiredField(
      original.gradingBasis?.code,
      "gradingBasis.code",
      ""
    ),
    status: getRequiredField(original.status?.code, "status.code", ""),
    fromDate: getRequiredField(original.fromDate, "fromDate", ""),
    toDate: getRequiredField(original.toDate, "toDate", ""),
    printInCatalog: getRequiredField(
      original.printInCatalog,
      "printInCatalog",
      false
    ),
    finalExam: getRequiredField(original.finalExam?.code, "finalExam.code", ""),
    academicGroup: getRequiredField(
      original.academicGroup?.code,
      "academicGroup.code",
      ""
    ),
    academicOrganization: getRequiredField(
      original.academicOrganization?.code,
      "academicOrganization.code",
      ""
    ),
    instructorAddConsentRequired: getRequiredField(
      original.instructorAddConsentRequired,
      "instructorAddConsentRequired",
      false
    ),
    instructorDropConsentRequired: getRequiredField(
      original.instructorDropConsentRequired,
      "instructorDropConsentRequired",
      false
    ),
    allowMultipleEnrollments: getRequiredField(
      original.allowMultipleEnrollments,
      "allowMultipleEnrollments",
      false
    ),
    spansMultipleTerms: getRequiredField(
      original.spansMultipleTerms,
      "spansMultipleTerms",
      false
    ),
    multipleTermNumber: getRequiredField(
      original.multipleTermNumber,
      "multipleTermNumber",
      0
    ),
    anyFeesExist: getRequiredField(
      original.anyFeesExist,
      "anyFeesExist",
      false
    ),
    repeatability: {
      repeatable: getRequiredField(
        original.repeatability?.repeatable,
        "repeatability.repeatable",
        false
      ),
      maxCredit: getRequiredField(
        original.repeatability?.maxCredit,
        "repeatability.maxCredit",
        0
      ),
      maxCount: getRequiredField(
        original.repeatability?.maxCount,
        "repeatability.maxCount",
        0
      ),
    },
    preparation: {
      recommendedText: getRequiredField(
        original.preparation?.recommendedText,
        "preparation.recommendedText",
        ""
      ),
      recommendedCourses:
        original.preparation?.recommendedCourses?.map(
          (c) => c.identifiers?.find((i) => i.type === "cs-course-id")?.id || ""
        ) || [],
      requiredText: getRequiredField(
        original.preparation?.requiredText,
        "preparation.requiredText",
        ""
      ),
      requiredCourses:
        original.preparation?.requiredCourses?.map(
          (c) => c.identifiers?.find((i) => i.type === "cs-course-id")?.id || ""
        ) || [],
    },
    gradeReplacement: {
      text: getRequiredField(
        original.gradeReplacement?.gradeReplacementText,
        "gradeReplacement.gradeReplacementText",
        ""
      ),
      group: getRequiredField(
        original.gradeReplacement?.gradeReplacementGroup,
        "gradeReplacement.gradeReplacementGroup",
        ""
      ),
      courses:
        original.gradeReplacement?.gradeReplacementCourses?.map(
          (c) => c.identifiers?.find((i) => i.type === "cs-course-id")?.id || ""
        ) || [],
    },
    crossListing: getRequiredField(
      original.crossListing?.courses,
      "crossListing.courses",
      []
    ),
    formatsOffered: {
      description: getRequiredField(
        original.formatsOffered?.description,
        "formatsOffered.description",
        ""
      ),
      typicallyOffered: {
        comments: getRequiredField(
          original.formatsOffered?.typicallyOffered?.comments,
          "formatsOffered.typicallyOffered.comments",
          ""
        ),
        terms: getRequiredField(
          original.formatsOffered?.typicallyOffered?.terms,
          "formatsOffered.typicallyOffered.terms",
          []
        ),
      },
      formats:
        original.formatsOffered?.formats?.map((format) => ({
          termsAllowed: getRequiredField(
            format.termsAllowed,
            "formatsOffered.formats.termsAllowed",
            []
          ),
          description: getRequiredField(
            format.description,
            "formatsOffered.formats.description",
            ""
          ),
          components:
            format.components?.map((component) => ({
              instructionMethod: getRequiredField(
                component.instructionMethod?.code,
                "formatsOffered.formats.components.instructionMethod.code",
                ""
              ),
              primary: getRequiredField(
                component.primary,
                "formatsOffered.formats.components.primary",
                false
              ),
              minContactHours: getRequiredField(
                component.minContactHours,
                "formatsOffered.formats.components.minContactHours",
                0
              ),
              maxContactHours: getRequiredField(
                component.maxContactHours,
                "formatsOffered.formats.components.maxContactHours",
                0
              ),
              feesExist: getRequiredField(
                component.feesExist,
                "formatsOffered.formats.components.feesExist",
                false
              ),
            })) || [],
        })) || [],
    },
    requirementsFulfilled:
      original.requirementsFulfilled?.map((r) =>
        getRequiredField(r.code, "requirementsFulfilled.code", "")
      ) || [],
    courseObjectives: getRequiredField(
      original.courseObjectives,
      "courseObjectives",
      []
    ),
    studentLearningOutcomes: getRequiredField(
      original.studentLearningOutcomes,
      "studentLearningOutcomes",
      []
    ),
    creditRestriction: {
      text: getRequiredField(
        original.creditRestriction?.restrictionText,
        "creditRestriction.restrictionText",
        ""
      ),
      courses:
        original.creditRestriction?.restrictionCourses?.map((c) => ({
          courseId:
            c.course?.identifiers?.find((i) => i.type === "cs-course-id")?.id ||
            "",
          maxCreditPercentage: getRequiredField(
            c.maxCreditPercentage,
            "creditRestriction.restrictionCourses.maxCreditPercentage",
            0
          ),
        })) || [],
    },
    blindGrading: getRequiredField(
      original.blindGrading,
      "blindGrading",
      false
    ),
    credit: {
      type: getRequiredField(original.credit?.type, "credit.type", ""),
      value: {
        discrete:
          original.credit?.value?.discrete?.units?.map((unit) =>
            getRequiredField(unit, "credit.value.discrete.units", 0)
          ) || [],
        fixed: getRequiredField(
          original.credit?.value?.fixed?.units,
          "credit.value.fixed.units",
          0
        ),
        range: {
          minUnits: getRequiredField(
            original.credit?.value?.range?.minUnits,
            "credit.value.range.minUnits",
            0
          ),
          maxUnits: getRequiredField(
            original.credit?.value?.range?.maxUnits,
            "credit.value.range.maxUnits",
            0
          ),
        },
      },
    },
    workloadHours: getRequiredField(original.workloadHours, "workloadHours", 0),
    contactHours: getRequiredField(original.contactHours, "contactHours", 0),
    formerDisplayName: getRequiredField(
      original.formerDisplayName,
      "formerDisplayName",
      ""
    ),
    createdDate: getRequiredField(original.createdDate, "createdDate", ""),
    updatedDate: getRequiredField(original.updatedDate, "updatedDate", ""),
  };

  return newCourse;
}
