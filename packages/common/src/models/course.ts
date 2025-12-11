import { Document, Model, Schema, model } from "mongoose";

export interface ICourseItem {
  // identifiers[type=cs-course-id]
  courseId: string;
  // subjectArea.code
  subject: string;
  // subjectArea.description
  subjectName?: string;
  // departmentNicknames
  departmentNicknames?: string;
  // catalogNumber.formatted
  number: string;
  title?: string;
  description?: string;
  // academicCareer.code
  academicCareer?: string;
  // primaryInstructionMethod.code
  primaryInstructionMethod?: string;
  // gradingBasis.code
  gradingBasis?: string;
  // status.code
  status?: string;
  fromDate?: string;
  toDate?: string;
  printInCatalog?: boolean;
  // finalExam.code
  finalExam?: string;
  // academicGroup.code
  academicGroup?: string;
  // academicOrganization.code
  academicOrganization?: string;
  // academicOrganization.description
  academicOrganizationName?: string;
  instructorAddConsentRequired?: boolean;
  instructorDropConsentRequired?: boolean;
  allowMultipleEnrollments?: boolean;
  spansMultipleTerms?: boolean;
  multipleTermNumber?: number;
  anyFeesExist?: boolean;
  repeatability?: {
    repeatable?: boolean;
    maxCredit?: number;
    maxCount?: number;
  };
  preparation?: {
    recommendedText?: string;
    // recommendedCourses.identifiers[type=cs-course-id]
    recommendedCourses?: string[];
    requiredText?: string;
    // requiredCourses.identifiers[type=cs-course-id]
    requiredCourses?: string[];
  };

  gradeReplacement?: {
    // gradeReplacementText
    text?: string;
    // gradeReplacementGroup
    group?: string;
    // gradeReplacementCourses.identifiers[type=cs-course-id]
    courses?: string[];
  };

  // crossListing.courses.identifiers[type=cs-course-id]
  crossListing?: string[];
  // formatsOffered.typicallyOffered.terms[]
  formatsOffered?: {
    description?: string;
    // typicallyOffered.terms[]
    typicallyOffered?: {
      comments?: string;
      terms?: string[];
    };
    formats?: {
      termsAllowed?: string[];
      description?: string;
      components?: {
        // instructionMethod.code
        instructionMethod?: string;
        primary?: boolean;
        minContactHours?: number;
        maxContactHours?: number;
        feesExist?: boolean;
      }[];
    }[];
  };
  // requirementsFulfilled[].code
  requirementsFulfilled?: string[];
  courseObjectives?: string[];
  studentLearningOutcomes?: string[];
  creditRestriction?: {
    // restrictionText
    text?: string;
    // restrictionCourses
    courses?: {
      // course.identifiers[type=cs-course-id]
      courseId?: string;
      maxCreditPercentage?: number;
    }[];
  };
  blindGrading?: boolean;
  credit?: {
    type?: string;
    value?: {
      discrete?: number[];
      fixed?: number;
      range?: {
        maxUnits?: number;
        minUnits?: number;
      };
    };
  };
  // NOTE: Determine how formatsOffered factors
  workloadHours?: number;
  contactHours?: number;
  // NOTE: Replace with cs-course-id of former course
  formerDisplayName?: string;
  // createdDate?: string;
  updatedDate?: string;
  allTimeAverageGrade?: number | null;
  allTimePassCount?: number | null;
  allTimeNoPassCount?: number | null;
}

export interface ICourseItemDocument extends ICourseItem, Document {}

const courseSchema = new Schema<ICourseItem>({
  courseId: { type: String, required: true },
  subject: { type: String, required: true },
  subjectName: { type: String },
  departmentNicknames: { type: String },
  number: { type: String, required: true },
  title: { type: String },
  description: { type: String },
  academicCareer: { type: String },
  primaryInstructionMethod: { type: String },
  gradingBasis: { type: String },
  status: { type: String },
  fromDate: { type: String },
  toDate: { type: String },
  printInCatalog: { type: Boolean },
  finalExam: { type: String },
  academicGroup: { type: String },
  academicOrganization: { type: String },
  academicOrganizationName: { type: String },
  instructorAddConsentRequired: { type: Boolean },
  instructorDropConsentRequired: { type: Boolean },
  allowMultipleEnrollments: { type: Boolean },
  spansMultipleTerms: { type: Boolean },
  multipleTermNumber: { type: Number },
  anyFeesExist: { type: Boolean },
  repeatability: {
    repeatable: { type: Boolean },
    maxCredit: { type: Number },
    maxCount: { type: Number },
  },
  preparation: {
    recommendedText: { type: String },
    recommendedCourses: { type: [String] },
    requiredText: { type: String },
    requiredCourses: { type: [String] }, // stored as courseIds
  },
  gradeReplacement: {
    text: { type: String },
    group: { type: String },
    courses: { type: [String] },
  },
  crossListing: { type: [String] }, // stored as `${subject} ${number}`
  formatsOffered: {
    description: { type: String },
    typicallyOffered: {
      comments: { type: String },
      terms: { type: [String] },
    },
    formats: [
      {
        termsAllowed: { type: [String] },
        description: { type: String },
        components: [
          {
            instructionMethod: { type: String },
            primary: { type: Boolean },
            minContactHours: { type: Number },
            maxContactHours: { type: Number },
            feesExist: { type: Boolean },
          },
        ],
      },
    ],
  },
  requirementsFulfilled: { type: [String] },
  courseObjectives: { type: [String] },
  studentLearningOutcomes: { type: [String] },
  creditRestriction: {
    text: { type: String },
    courses: [
      {
        courseId: { type: String },
        maxCreditPercentage: { type: Number },
      },
    ],
  },
  blindGrading: { type: Boolean },
  credit: {
    type: { type: String },
    value: {
      discrete: { type: [Number] },
      fixed: { type: Number },
      range: {
        maxUnits: { type: Number },
        minUnits: { type: Number },
      },
    },
  },
  workloadHours: { type: Number },
  contactHours: { type: Number },
  formerDisplayName: { type: String },
  // createdDate: { type: String },
  updatedDate: { type: String },
  allTimeAverageGrade: { type: Number, default: null },
  allTimePassCount: { type: Number, default: null },
  allTimeNoPassCount: { type: Number, default: null },
});

// for catalog, associated courses by id, curated class controllers
courseSchema.index({ courseId: 1 });
courseSchema.index({ courseId: 1, printInCatalog: 1 });

// for associated courses by subject number and bookmarked courses controllers
courseSchema.index({
  subject: 1,
  number: 1,
});

export const CourseModel: Model<ICourseItem> = model<ICourseItem>(
  "courses",
  courseSchema
);
