import mongoose, { Schema, InferSchemaType, Types } from "mongoose";

export const SisClassSchema = new Schema({
  _id: {
    type: Types.ObjectId,
  },
  course: {
    catalogNumber: {
      number: {
        type: String,
      },
      formatted: {
        type: String,
      },
    },
    displayName: {
      type: String,
    },
    identifiers: {
      type: [],
    },
    subjectArea: {
      code: {
        type: String,
      },
      description: {
        type: String,
      },
    },
    title: {
      type: String,
    },
    transcriptTitle: {
      type: String,
    },
  },
  number: {
    type: Date,
  },
  session: {
    id: {
      type: String,
    },
    name: {
      type: String,
    },
    term: {
      id: {
        type: Date,
      },
      name: {
        type: String,
      },
    },
  },
  _created: {
    type: Date,
  },
  _updated: {
    type: Date,
  },
  _version: {
    type: Number,
  },
  aggregateEnrollmentStatus: {
    status: {
      code: {
        type: String,
      },
      description: {
        type: String,
      },
    },
    enrolledCount: {
      type: Number,
    },
    minEnroll: {
      type: Number,
    },
    maxEnroll: {
      type: Number,
    },
    maxWaitlist: {
      type: Number,
    },
    instructorAddConsentRequired: {
      type: Boolean,
    },
    instructorDropConsentRequired: {
      type: Boolean,
    },
    waitlistedCount: {
      type: Number,
    },
  },
  allowedUnits: {
    minimum: {
      type: Number,
    },
    maximum: {
      type: Number,
    },
    forAcademicProgress: {
      type: Number,
    },
    forFinancialAid: {
      type: Number,
    },
  },
  anyFeesExist: {
    type: Boolean,
  },
  anyPrintInScheduleOfClasses: {
    type: Boolean,
  },
  anyPrintInstructors: {
    type: Boolean,
  },
  assignedClassMaterials: {
    status: {},
    noneAssigned: {
      type: Boolean,
    },
  },
  blindGrading: {
    type: Boolean,
  },
  contactHours: {
    type: Number,
  },
  displayName: {
    type: String,
  },
  finalExam: {
    code: {
      type: String,
    },
    description: {
      type: String,
    },
  },
  gradingBasis: {
    code: {
      type: String,
    },
    description: {
      type: String,
    },
  },
  instructionMode: {
    code: {
      type: String,
    },
    description: {
      type: String,
    },
  },
  offeringNumber: {
    type: Number,
  },
  primaryComponent: {
    code: {
      type: String,
    },
    description: {
      type: String,
    },
  },
  status: {
    code: {
      type: String,
    },
    description: {
      type: String,
    },
  },
});

export const SisClassHistorySchema = new Schema({
  _id: { type: Types.ObjectId, required: true },
  _createdAt: String,
  _updatedAt: String,
  _version: Number,
  collectionName: String,
  collectionId: { type: Types.ObjectId, required: true },
  diff: {},
});
