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
  class_IDs: {
    type: [String],
    trim: true,
    required: false
  },
  primary_section_IDs: {
    type: [String],
    trim: true,
    required: false
  },
  secondary_section_IDs: {
    type: [String],
    trim: true,
    required: false
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

export const TermModel = mongoose.model("outputTerm", termSchema, "outputTerm");
export type TermType = Document & InferSchemaType<typeof termSchema>;
export const CustomEventModel = mongoose.model("customEvent", customEventSchema, "customEvent");
export type CustomEventType = Document & InferSchemaType<typeof customEventSchema>;
export const ScheduleModel = mongoose.model("schedule", scheduleSchema, "schedule");
export type ScheduleType = Document & InferSchemaType<typeof scheduleSchema>;
