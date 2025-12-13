import mongoose, { Document, InferSchemaType, Schema } from "mongoose";

export const customEventSchema = new Schema({
  startTime: {
    type: String,
    required: true,
    trim: true,
  },
  endTime: {
    type: String,
    required: true,
    trim: true,
  },
  title: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: false,
    trim: true,
  },
  description: {
    type: String,
    required: false,
  },
  days: {
    type: [Boolean],
    required: true,
    trim: true,
  },
  color: {
    type: String,
    required: false,
  },
});

export const selectedClassSchema = new Schema({
  subject: {
    type: String,
    trim: true,
    required: true,
  },
  courseNumber: {
    type: String,
    trim: true,
    required: true,
  },
  number: {
    type: String,
    trim: true,
    required: true,
  },
  sectionIds: {
    type: [Number],
    required: false,
  },
  color: {
    type: String,
    required: false,
  },
  hidden: {
    type: Boolean,
    default: false,
  },
  locked: {
    type: Boolean,
    default: false,
  },
  blockedSections: {
    type: [String],
    required: false,
    default: [],
  },
  lockedComponents: {
    type: [String],
    required: false,
    default: [],
  },
});

export const scheduleSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    createdBy: {
      type: String,
      required: true,
      trim: true,
    },
    public: {
      type: Boolean,
      required: true,
      default: false,
    },
    classes: {
      type: [selectedClassSchema],
      required: true,
      default: [],
    },
    year: {
      type: Number,
      required: true,
    },
    semester: {
      type: String,
      enum: ["Spring", "Summer", "Fall", "Winter"],
      required: true,
    },
    sessionId: {
      type: String,
      required: true,
    },
    events: {
      type: [customEventSchema],
      required: true,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// for scheduler controller
scheduleSchema.index({ createdBy: 1 });

export type CustomEventType = Document &
  InferSchemaType<typeof customEventSchema>;

export type SelectedClassType = Document &
  InferSchemaType<typeof selectedClassSchema>;

export const ScheduleModel = mongoose.model("schedules", scheduleSchema);

export type ScheduleType = Document & InferSchemaType<typeof scheduleSchema>;
