import mongoose, { Schema, InferSchemaType, Document } from "mongoose";

export const TermSchema = new Schema({
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

export const CustomEventSchema = new Schema({
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


export const ScheduleSchema = new Schema({
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
  courses: [
    {
      class_ID: {
        type: String,
        trim: true,
      },
      primary_section_ID: {
        type: String,
        trim: true,
      },
      secondary_section_ID: {
        type: [String],
        trim: true,
      }
    }
  ],
  term: {
    type: TermSchema,
    required: true
  },
  custom_events: {
    type: [CustomEventSchema],
    required: false
  }
}, { timestamps: true });

export type TermType = Document & InferSchemaType<typeof TermSchema>;
export const TermModel = mongoose.model("outputTerm", TermSchema, "outputTerm");
export const CustomEventModel = mongoose.model("customEvent", CustomEventSchema, "customEvent");
export type CustomEventType = Document & InferSchemaType<typeof CustomEventSchema>;
export const ScheduleModel = mongoose.model("schedule", ScheduleSchema, "schedule");
export type ScheduleType = Document & InferSchemaType<typeof ScheduleSchema>;
