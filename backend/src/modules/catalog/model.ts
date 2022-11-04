import mongoose, { Schema, InferSchemaType, Types } from "mongoose";

export const Identifier = {
  type: String, 
  id: String
}

export const CourseSchema = new Schema({
  _id: {
    type: Types.ObjectId,
    required: true
  },
  identifiers: [Identifier],
  _created: {
    $date: {
      $numberLong: String
    }
  },
  _updated: {
    $date: {
      $numberLong: String
    }
  },
  _version: Number,
  academicCareer: {
    code: String,
    description: String
  },
  academicGroup: {
    code: String,
    description: String
  },
  academicOrganization: {
    code: String,
    description: String
  },
  allowMultipleEnrollments: Boolean,
  anyFeesExist: Boolean,
  blindGrading: Boolean,
  catalogNumber: {
    prefix: String,
    number: Date,
    suffix: String,
    formatted: String
  },
  cip: {
    code: String,
    description: String
  },
  classDisplayName: {
    type: String,
    required: true
  },
  classSubjectArea: {
    code: String,
    description: String
  },
  contactHours: Number,
  createdDate: Date,
  credit: {
    type: String,
    value: {
      fixed: {
        units: Number
      }
    }
  },
  creditRestriction: {
    restrictionText: String,
    restrictionCourses: {
      creditRestrictionCourses: [{
        course: {
          identifiers: [Identifier],
          displayName: String
        }
      }]
    }
  },
  crossListing: {
    count: Number,
    courses: [String]
  },
  departmentNicknames: String,
  description: String,
  displayName: String,
  finalExam: {
    code: String,
    description: String
  },
  formatsOffered: {
    description: String,
    formats: [{
      termsAllowed: {
        termNames: [String]
      },
      sessionType: Date,
      description: String,
      aggregateMinContactHours: Number,
      aggregateMaxContactHours: Number,
      minWorkloadHours: Number,
      maxWorkloadHours: Number,
      anyFeesExist: Boolean,
      components: [{
        instructionMethod: {
          code: String,
          description: String
        },
        primary: Boolean,
        minContactHours: Number,
        maxContactHours: Number,
        feesExist: Boolean,
        finalExam: {
          code: String,
          description: String
        }
      }]
    }],
    typicallyOffered: {
      terms: {
        termNames: [String]
      },
      comments: String
    },
    summerOnly: Boolean
  },
  formerDisplayName: String,
  fromDate: Date,
  gradingBasis: {
    code: String,
    description: String,
  },
  hegis: {
    code: String,
    description: String,
  },
  instructorDropConsentRequired: Boolean,
  multipleTermNumber: Number,
  preparation: {
    requiredText: String,
    requiredCourses: {
        courses: {
            identifiers: [Identifier],
            displayName: String,
        }
    }
  },
  primaryInstructionMethod: {
    code: String,
    description: String
  },
  printInCatalog: Boolean,
  printInstructors: Boolean,
  proposedInstructors: [String],
  repeatability: {
    repeatable: Boolean
  },
  spansMultipleTerms: Boolean,
  status: {
    code: String,
    description: String
  },
  subjectArea: {
    code: String,
    description: String
  },
  tie: {
    code: String,
    description: String,
  },
  title: {
    type: String,
    required: true
  },
  toDate: Date,
  transcriptTitle: String,
  updatedDate: Date,
  workloadHours: Number,
})

export const CourseModel = mongoose.model("sis_course", CourseSchema, "sis_course");
export type CourseType = InferSchemaType<typeof CourseSchema>;