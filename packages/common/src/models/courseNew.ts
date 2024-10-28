import { Document, Schema, model } from "mongoose";

export interface ICourseItem {
  // identifiers[type=cs-course-id]
  courseId: string;

  // subjectArea.code
  subject: string;

  // catalogNumber.formatted
  number: string;

  title: string;
  description: string;

  // academicCareer.code
  academicCareer: string;

  // primaryInstructionMethod.code
  primaryInstructionMethod: string;

  // gradingBasis.code
  gradingBasis: string;

  // status.code
  status: string;

  fromDate: string;
  toDate: string;

  printInCatalog: boolean;

  // finalExam.code
  finalExam: string;

  // academicGroup.code
  academicGroup: string;

  // academicOrganization.code
  academicOrganization: string;

  instructorAddConsentRequired: boolean;
  instructorDropConsentRequired: boolean;
  allowMultipleEnrollments: boolean;
  spansMultipleTerms: boolean;
  multipleTermNumber: number;
  anyFeesExist: boolean;

  repeatability: {
    repeatable: boolean;
    maxCredit: number;
    maxCount: number;
  };

  preparation: {
    recommendedText: string;

    // recommendedCourses.identifiers[type=cs-course-id]
    recommendedCourses: string[];

    requiredText: string;

    // requiredCourses.identifiers[type=cs-course-id]
    requiredCourses: string[];
  };

  gradeReplacement: {
    // gradeReplacementText
    text: string;

    // gradeReplacementGroup
    group: string;

    // gradeReplacementCourses.identifiers[type=cs-course-id]
    courses: string[];
  };

  // crossListing.courses.identifiers[type=cs-course-id]
  crossListing: string[];

  // formatsOffered.typicallyOffered.terms[]
  formatsOffered: {
    description: string;

    // typicallyOffered.terms[]
    typicallyOffered: {
      comments: string;
      terms: string[];
    };

    formats: {
      termsAllowed: string[];
      description: string;
      components: {
        // instructionMethod.code
        instructionMethod: string;

        primary: boolean;
        minContactHours: number;
        maxContactHours: number;
        feesExist: boolean;
      }[];
    }[];
  };

  // requirementsFulfilled[].code
  requirementsFulfilled: string[];

  courseObjectives: string[];
  studentLearningOutcomes: string[];

  creditRestriction: {
    // restrictionText
    text: string;

    // restrictionCourses
    courses: {
      // course.identifiers[type=cs-course-id]
      courseId: string;
      maxCreditPercentage: number;
    }[];
  };

  blindGrading: boolean;

  credit: {
    type: string;
    value: {
      discrete: number[];
      fixed: number;
      range: {
        maxUnits: number;
        minUnits: number;
      };
    };
  };

  // NOTE: Determine how formatsOffered factors
  workloadHours: number;
  contactHours: number;

  // NOTE: Replace with cs-course-id of former course
  formerDisplayName: string;

  createdDate: string;
  updatedDate: string;
}

export interface ISectionItemDocument extends ICourseItem, Document {}

const courseSchema = new Schema<ICourseItem>({
  courseId: { type: String, required: true, unique: true },
  subject: { type: String, required: true },
  number: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  academicCareer: { type: String, required: true },
  primaryInstructionMethod: { type: String, required: true },
  gradingBasis: { type: String, required: true },
  status: { type: String, required: true },
  fromDate: { type: String, required: true },
  toDate: { type: String, required: true },
  printInCatalog: { type: Boolean, required: true },
  finalExam: { type: String, required: true },
  academicGroup: { type: String, required: true },
  academicOrganization: { type: String, required: true },
  instructorAddConsentRequired: { type: Boolean, required: true },
  instructorDropConsentRequired: { type: Boolean, required: true },
  allowMultipleEnrollments: { type: Boolean, required: true },
  spansMultipleTerms: { type: Boolean, required: true },
  multipleTermNumber: { type: Number, required: true },
  anyFeesExist: { type: Boolean, required: true },
  repeatability: {
    repeatable: { type: Boolean, required: true },
    maxCredit: { type: Number, required: true },
    maxCount: { type: Number, required: true },
  },
  preparation: {
    recommendedText: { type: String, required: true },
    recommendedCourses: { type: [String], required: true },
    requiredText: { type: String, required: true },
    requiredCourses: { type: [String], required: true },
  },
  gradeReplacement: {
    text: { type: String, required: true },
    group: { type: String, required: true },
    courses: { type: [String], required: true },
  },
  crossListing: { type: [String], required: true },
  formatsOffered: {
    description: { type: String, required: true },
    typicallyOffered: {
      comments: { type: String, required: true },
      terms: { type: [String], required: true },
    },
    formats: [
      {
        termsAllowed: { type: [String], required: true },
        description: { type: String, required: true },
        components: [
          {
            instructionMethod: { type: String, required: true },
            primary: { type: Boolean, required: true },
            minContactHours: { type: Number, required: true },
            maxContactHours: { type: Number, required: true },
            feesExist: { type: Boolean, required: true },
          },
        ],
      },
    ],
  },
  requirementsFulfilled: { type: [String], required: true },
  courseObjectives: { type: [String], required: true },
  studentLearningOutcomes: { type: [String], required: true },
  creditRestriction: {
    text: { type: String, required: true },
    courses: [
      {
        courseId: { type: String, required: true },
        maxCreditPercentage: { type: Number, required: true },
      },
    ],
  },
  blindGrading: { type: Boolean, required: true },
  credit: {
    type: { type: String, required: true },
    value: {
      discrete: { type: [Number], required: true },
      fixed: { type: Number, required: true },
      range: {
        maxUnits: { type: Number, required: true },
        minUnits: { type: Number, required: true },
      },
    },
  },
  workloadHours: { type: Number, required: true },
  contactHours: { type: Number, required: true },
  formerDisplayName: { type: String, required: true },
  createdDate: { type: String, required: true },
  updatedDate: { type: String, required: true },
});

export const NewCourseModel = model<ICourseItem>("NewCourse", courseSchema);
