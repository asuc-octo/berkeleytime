import mongoose, { Schema, InferSchemaType, Document } from "mongoose";

export const termSchema = new Schema({
  year: {
    type: Number,
    required: true,
  },
  semester: {
    type: String,
    required: true,
    trim: true,
  },
}, { _id : false });

export const customEventSchema = new Schema({
  start_time: { 
    type: String,
    required: true,
    trim: true,
    alias: "start"
  },
  end_time: {
    type: String,
    required: true,
    trim: true,
    alias: "end"
  },
  title: {
    type: String,
    required: false,
    alias: "name"
  },
  location: {
    type: String,
    required: false,
    trim: true,
    alias: "place"
  },
  description: {
    type: String,
    required: false
  },
  days_of_week: {
    type: String,
    required: false,
    trim: true,
    alias: "days"
  }
});

export const SelectedCourseSchema = new Schema({
  class_ID: {
    type: String,
    trim: true,
    required: true
  },
  primary_section_ID: {
    type: String,
    trim: true,
    required: false
  },
  secondary_section_IDs: {
    type: [String],
    trim: true,
    required: false
  }
});

export const scheduleSchema = new Schema({
  name: {
    type: String,
    required: false
  },
  created_by: {
    type: String,
    required: true,
    trim: true,
    alias: "creator"
  },
  is_public: {
    type: Boolean,
    required: true,
    alias: "public",
    default: false,
  },
  courses: {
    type: [SelectedCourseSchema],
    required: true,
  },
  term: {
    type: termSchema,
    required: true
  },
  custom_events: {
    type: [customEventSchema],
    required: false
  }
}, { timestamps: true });

export type TermType = Document & InferSchemaType<typeof termSchema>;
export const TermModel = mongoose.model("outputTerm", termSchema, "outputTerm");
export const CustomEventModel = mongoose.model("customEvent", customEventSchema, "customEvent");
export type CustomEventType = Document & InferSchemaType<typeof customEventSchema>;
export const SelectedCourseModel = mongoose.model("course", SelectedCourseSchema, "course");
export type SelectedCourseType = Document & InferSchemaType<typeof SelectedCourseSchema>;
export const ScheduleModel = mongoose.model("schedule", scheduleSchema, "schedule");
export type ScheduleType = Document & InferSchemaType<typeof scheduleSchema>;