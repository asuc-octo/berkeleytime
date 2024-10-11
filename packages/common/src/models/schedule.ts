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
  sections: {
    type: [String],
    trim: true,
    required: false,
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
      required: true,
      trim: true,
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

export type CustomEventType = Document &
  InferSchemaType<typeof customEventSchema>;

export type SelectedClassType = Document &
  InferSchemaType<typeof selectedClassSchema>;

export const ScheduleModel = mongoose.model("schedule", scheduleSchema);

export type ScheduleType = Document & InferSchemaType<typeof scheduleSchema>;
