import { ObjectId } from "mongodb";
import mongoose, { Schema, InferSchemaType, Types } from "mongoose";
import { User } from "../user/fixture";
import { CustomEvent } from "./fixture";

export const ScheduleSchema = new Schema({
  name: { type: String, required: false },
  created_by: { type: ObjectId, required: true },
  date_created: { type: String, required: true },
  last_updated: { type: String, required: true },
  term: { type: String, required: true },
  public: { type: Boolean, required: true },
  class_IDs: { type: [String], required: false },
  section_Ids: { type: [String], required: false },
  custom_events: { type: [CustomEvent], required: false }
});

export const ScheduleModel = mongoose.model("schedule", ScheduleSchema, "schedule");
export type ScheduleType = InferSchemaType<typeof ScheduleSchema>;
