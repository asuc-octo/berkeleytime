import mongoose, { Schema, InferSchemaType, Types } from "mongoose";

export const ScheduleSchema = new Schema({
  date_created: { type: String, required: true },
  last_updated: { type: String, required: true },
  term: { type: String, required: true },
});

export const ScheduleModel = mongoose.model("schedule", ScheduleSchema, "schedule");
export type ScheduleType = InferSchemaType<typeof ScheduleSchema>;
