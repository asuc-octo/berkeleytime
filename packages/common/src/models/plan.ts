import mongoose, { Document, InferSchemaType, Schema } from "mongoose";

export const PlanCustomEventSchema = new Schema({
  title: {
    type: String,
    required: false,
    alias: "name",
  },
  description: {
    type: String,
    required: false,
  },
  uniReqs: {
    type: [String],
    required: false,
    trim: true,
  },
  collegeReqs: {
    type: [String],
    required: false,
    trim: true,
  }
});

export const selectedCourseSchema = new Schema({
  classID: {
    type: String,
    trim: true,
    required: true,
  },
  uniReqs: {
    type: [String],
    required: false,
    trim: true,
  },
  collegeReqs: {
    type: [String],
    required: false,
    trim: true,
  }
});

export const planTermSchema = new Schema(
  {
    name: {
      type: String,
      required: false,
    },
    courses: {
      type: [selectedCourseSchema],
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    term: {
      type: String,
      required: true,
      trim: true,
    },
    customEvents: {
      type: [PlanCustomEventSchema],
      required: false,
    },
  }
);

export const majorReqSchema = new Schema({
  name: {
    type: String,
    trim: true,
    required: true,
  },
  major: {
    type: String,
    trim: true,
    required: true,
  },
  numCoursesRequired: {
    type: Number,
    required: true,
  },
  satisfyingCourseIds: {
    type: [String],
    trim: true,
    required: false,
  },
  isMinor: {
    type: Boolean,
    required: false
  }
});

export const planSchema = new Schema(
  {
    userEmail: {
      type: String,
      required: true,
      trim: true,
      alias: "user",
    },
    planTerms: {
      type: [planTermSchema],
      required: true,
    },
    miscellaneous: {
      type: planTermSchema,
      required: true,
    },
    majors: {
      type: [String!],
      required: true,
    },
    minors: {
      type: [String!],
      required: true,
    },
    uniReqs: {
      type: [String!],
      required: true,
    },
    collegeReqs: {
      type: [String!],
      required: true,
    },
    majorReqs: {
      type: [majorReqSchema],
      required: true,
    }
  },
  { timestamps: true }
);

export type PlanCustomEventType = Document &
  InferSchemaType<typeof PlanCustomEventSchema>;
export const CustomEventModel = mongoose.model<PlanCustomEventType>('customEvent', PlanCustomEventSchema);

export type SelectedCourseType = InferSchemaType<typeof selectedCourseSchema> & Document;
export const SelectedCourseModel = mongoose.model<SelectedCourseType>('course', selectedCourseSchema);

export type MajorReqType = Document & InferSchemaType<typeof majorReqSchema>;
export const MajorReqModel = mongoose.model<MajorReqType>('majorReq', majorReqSchema);

export interface PlanTermType extends Document {
  name?: string;
  courses: SelectedCourseType[];
  userEmail: string;
  year: number;
  term: string;
  customEvents?: PlanCustomEventType[];
}
export const PlanTermModel = mongoose.model<PlanTermType>('planTerm', planTermSchema);

export interface PlanType extends Document {
  userEmail: string;
  planTerms: PlanTermType[];
  miscellaneous: PlanTermType;
  majors: string[];
  minors: string[];
  uniReqs: string[];
  collegeReqs: string[];
  majorReqs: MajorReqType[];
  createdAt: Date;
  updatedAt: Date;
}
export const PlanModel = mongoose.model<PlanType>('plan', planSchema);