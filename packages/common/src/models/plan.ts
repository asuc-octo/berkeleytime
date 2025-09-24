import mongoose, { Document, InferSchemaType, Schema } from "mongoose";

export const labelSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  color: {
    type: String,
    required: true,
    trim: true,
  }
});

export const PlanCustomCourseSchema = new Schema({
  title: {
    type: String,
    required: true,
    alias: "name",
  },
  description: {
    type: String,
    required: true,
  },
  uniReqs: {
    type: [String],
    required: true,
    trim: true,
  },
  collegeReqs: {
    type: [String],
    required: true,
    trim: true,
  },
  pnp: {
    type: Boolean,
    required: true,
  },
  transfer: {
    type: Boolean,
    required: true,
  },
  labels: {
    type: [labelSchema],
    required: true,
  }
});

export const selectedCourseSchema = new Schema({
  courseID: {
    type: String,
    trim: true,
    required: true,
  },
  uniReqs: {
    type: [String],
    required: true,
    trim: true,
  },
  collegeReqs: {
    type: [String],
    required: true,
    trim: true,
  },
  pnp: {
    type: Boolean,
    required: true,
  },
  transfer: {
    type: Boolean,
    required: true,
  },
  labels: {
    type: [labelSchema],
    required: true,
  }
});

export const planTermSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
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
    customCourses: {
      type: [PlanCustomCourseSchema],
      required: true,
    },
    hidden: {
      type: Boolean,
      required: true,
    },
    status: {
      type: String,
      required: true,
      trim: true,
    },
    pinned: {
      type: Boolean,
      required: true,
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
    majors: {
      type: [String!],
      required: true,
    },
    minors: {
      type: [String!],
      required: true,
    },
    college: {
      type: String,
      required: true,
      trim: true,
    },
    majorReqs: {
      type: [majorReqSchema],
      required: true,
    },
    gridLayout: {
      type: Boolean,
      required: true,
    },
    labels: {
      type: [labelSchema],
      required: true,
    },
    uniReqsSatisfied: {
      type: [String],
      required: true,
      trim: true,
    },
    collegeReqsSatisfied: {
      type: [String],
      required: true,
      trim: true,
    }
  },
  { timestamps: true }
);

export type PlanCustomCourseType = Document &
  InferSchemaType<typeof PlanCustomCourseSchema>;
export const CustomCourseModel = mongoose.model<PlanCustomCourseType>('customCourse', PlanCustomCourseSchema);

export type SelectedCourseType = InferSchemaType<typeof selectedCourseSchema> & Document;
export const SelectedCourseModel = mongoose.model<SelectedCourseType>('course', selectedCourseSchema);

export type MajorReqType = Document & InferSchemaType<typeof majorReqSchema>;
export const MajorReqModel = mongoose.model<MajorReqType>('majorReq', majorReqSchema);

export type LabelType = InferSchemaType<typeof labelSchema> & Document;
export const LabelModel = mongoose.model<LabelType>('label', labelSchema);

export interface PlanTermType extends Document {
  name: string;
  courses: SelectedCourseType[];
  userEmail: string;
  year: number;
  term: string;
  customCourses: PlanCustomCourseType[];
  hidden: boolean;
  status: string;
  pinned: boolean;
}
export const PlanTermModel = mongoose.model<PlanTermType>('planTerm', planTermSchema);

export interface PlanType extends Document {
  userEmail: string;
  planTerms: PlanTermType[];
  majors: string[];
  minors: string[];
  majorReqs: MajorReqType[];
  createdAt: Date;
  updatedAt: Date;
  gridLayout: boolean;
  college: string;
  labels: LabelType[];
  uniReqsSatisfied: string[];
  collegeReqsSatisfied: string[];
}
export const PlanModel = mongoose.model<PlanType>('plan', planSchema);