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
  },
});

// PlanRequirement: Stores BtLL code for evaluating requirements
export const planRequirementSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    isUcReq: {
      type: Boolean,
      required: true,
      default: false,
    },
    college: {
      type: String,
      required: false,
      trim: true,
    },
    major: {
      type: String,
      required: false,
      trim: true,
    },
    minor: {
      type: String,
      required: false,
      trim: true,
    },
    createdBy: {
      type: String,
      required: true,
      trim: true,
    },
    isOfficial: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
);

// SelectedPlanRequirement: Links a PlanRequirement to a Plan with met status tracking
export const selectedPlanRequirementSchema = new Schema({
  planRequirementId: {
    type: Schema.Types.ObjectId,
    ref: "planRequirement",
    required: true,
  },
  // Manual overrides: when user manually checks off a requirement
  // true = manually marked as met, false = manually marked as not met, undefined = use evaluated value
  manualOverrides: {
    type: [Schema.Types.Mixed],
    required: true,
    default: [],
  },
});

export const selectedCourseSchema = new Schema({
  courseID: {
    type: String,
    trim: true,
    required: true,
  },
  courseName: {
    type: String,
    required: true,
    trim: true,
  },
  courseTitle: {
    type: String,
    required: true,
    trim: true,
  },
  courseUnits: {
    type: Number,
    required: true,
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
  },
});

export const planTermSchema = new Schema({
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
    colleges: {
      type: [String!],
      required: true,
    },
    labels: {
      type: [labelSchema],
      required: true,
    },
    selectedPlanRequirements: {
      type: [selectedPlanRequirementSchema],
      required: true,
      default: [],
    },
  },
  { timestamps: true }
);

export type SelectedCourseType = InferSchemaType<typeof selectedCourseSchema> &
  Document;
export const SelectedCourseModel = mongoose.model<SelectedCourseType>(
  "course",
  selectedCourseSchema
);

export type LabelType = InferSchemaType<typeof labelSchema> & Document;
export const LabelModel = mongoose.model<LabelType>("label", labelSchema);

export type PlanRequirementType = InferSchemaType<
  typeof planRequirementSchema
> &
  Document;
export const PlanRequirementModel = mongoose.model<PlanRequirementType>(
  "planRequirement",
  planRequirementSchema
);

export type SelectedPlanRequirementType = InferSchemaType<
  typeof selectedPlanRequirementSchema
> &
  Document;
export const SelectedPlanRequirementModel =
  mongoose.model<SelectedPlanRequirementType>(
    "selectedPlanRequirement",
    selectedPlanRequirementSchema
  );

export interface PlanTermType extends Document {
  name: string;
  courses: SelectedCourseType[];
  userEmail: string;
  year: number;
  term: string;
  hidden: boolean;
  status: string;
  pinned: boolean;
}
export const PlanTermModel = mongoose.model<PlanTermType>(
  "planTerm",
  planTermSchema
);

export interface PlanType extends Document {
  userEmail: string;
  planTerms: PlanTermType[];
  majors: string[];
  minors: string[];
  createdAt: Date;
  updatedAt: Date;
  colleges: string[];
  labels: LabelType[];
  selectedPlanRequirements: SelectedPlanRequirementType[];
}
export const PlanModel = mongoose.model<PlanType>("plan", planSchema);
