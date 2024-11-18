import mongoose, { Document, InferSchemaType, Schema } from "mongoose";

export const GradtrakCustomEventSchema = new Schema({
  start_time: {
    type: String,
    required: true,
    trim: true,
    alias: "start",
  },
  end_time: {
    type: String,
    required: true,
    trim: true,
    alias: "end",
  },
  title: {
    type: String,
    required: false,
    alias: "name",
  },
  location: {
    type: String,
    required: false,
    trim: true,
    alias: "place",
  },
  description: {
    type: String,
    required: false,
  },
  days_of_week: {
    type: String,
    required: false,
    trim: true,
    alias: "days",
  },
  uni_reqs: {
    type: [String],
    required: false,
    trim: true,
  },
  college_reqs: {
    type: [String],
    required: false,
    trim: true,
  }
});

export const selectedCourseSchema = new Schema({
  class_ID: {
    type: String,
    trim: true,
    required: true,
  },
  primary_section_ID: {
    type: String,
    trim: true,
    required: false,
  },
  secondary_section_IDs: {
    type: [String],
    trim: true,
    required: false,
  },
  uni_reqs: {
    type: [String],
    required: false,
    trim: true,
  },
  college_reqs: {
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
    user_email: {
      type: String,
      required: true,
    },
    term: {
      type: {
        year: {
          type: Number,
          required: true,
        },
        planTerm: {
          type: String,
          required: true,
          trim: true,
        },
      },
      required: false,
    },
    custom_events: {
      type: [GradtrakCustomEventSchema],
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
  num_courses_required: {
    type: Number,
    required: true,
  },
  satisfying_course_ids: {
    type: [String],
    trim: true,
    required: false,
  },
});

export const gradtrakSchema = new Schema(
  {
    user_email: {
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
    uni_reqs: {
      type: [String!],
      required: true,
    },
    college_reqs: {
      type: [String!],
      required: true,
    },
    major_reqs: {
      type: [majorReqSchema],
      required: true,
    }
  },
  { timestamps: true }
);

export type GradtrakCustomEventType = Document &
  InferSchemaType<typeof GradtrakCustomEventSchema>;
export const CustomEventModel = mongoose.model<GradtrakCustomEventType>('customEvent', GradtrakCustomEventSchema);

export type SelectedCourseType = InferSchemaType<typeof selectedCourseSchema> & Document;
export const SelectedCourseModel = mongoose.model<SelectedCourseType>('course', selectedCourseSchema);

export type MajorReqType = Document & InferSchemaType<typeof majorReqSchema>;
export const MajorReqModel = mongoose.model<MajorReqType>('majorReq', majorReqSchema);

export interface PlanTermType extends Document {
  name?: string;
  courses: SelectedCourseType[];
  user_email: string;
  term?: {
    year: number;
    planTerm: string;
  };
  custom_events?: GradtrakCustomEventType[];
}
export const PlanTermModel = mongoose.model<PlanTermType>('planTerm', planTermSchema);

export interface GradtrakType extends Document {
  user_email: string;
  planTerms: PlanTermType[];
  miscellaneous: PlanTermType;
  uni_reqs: string[];
  college_reqs: string[];
  major_reqs: MajorReqType[];
  createdAt: Date;
  updatedAt: Date;
}
export const GradtrakModel = mongoose.model<GradtrakType>('gradtrak', gradtrakSchema);